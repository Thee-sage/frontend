import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError, AxiosInstance } from "axios";
import { baseURL } from "../utils";
import { useAdminAuth } from "../contexts/admincontext";
import styles from "./styles/Casino.module.css"
interface PaymentMethod {
  name: string;
  processingTime: string;
  minDeposit: number;
  maxWithdrawal: number;
  fees: string;
}
interface IFreeSpinsConditions {
  wageringRequirement: number;
  maxCashout: number;
  expirationDays: number;
}

interface IDepositBonus {
  minDeposit: number;
  maxCashout: number;
  excludedPaymentMethods: string[];
  wageringRequirement: number;
  bonusExpirationDays: number;
  processingSpeed: string;
  freeSpinsConditions: IFreeSpinsConditions;
  bonusPercentage: number;
  increasedBonusPercentage?: number;
  increasedBonusTimeLimit?: number;
  claimTimeLimit: number;
  currencies: {
    currency: string;
    minDeposit: number;
  }[];
}

interface ITermsAndConditions {
  firstDepositBonus: IDepositBonus;
  generalTerms: string[];
  eligibilityRequirements: string[];
  restrictedCountries?: string[];
  additionalNotes?: string[];
}

interface ContentSection {
  title: string;
  content: string;
  order: number;
}

interface CategoryRating {
  category: string;
  score: number;
  description: string;
}

interface CasinoData {
  name: string;
  description: string;
  website: string;
  established: number;
  offer: string;
  ourRating: number;
  trustIndex: "Low" | "Medium" | "High";
  categoryRatings: CategoryRating[];
  payoutRatio: {
    percentage: number;
    lastUpdated: Date;
  };
  payoutSpeed: {
    averageDays: string;
    details: string;
  };
  termsAndConditions: ITermsAndConditions;
  paymentMethods: PaymentMethod[];
  currencies: string[];
  minDeposit: number;
  maxPayout: number;
  licenses: string[];
  securityMeasures: string[];
  fairnessVerification: string[];
  contentSections: ContentSection[];
  advantages: string[];
  disadvantages: string[];
  orderInListing: number;
  isActive: boolean;
}

interface CasinoFormProps {
  casinoId: string | null;
  onSuccess?: () => void;
}

export function CasinoForm({ casinoId, onSuccess }: CasinoFormProps) {
  const { token, isAuthenticated, refreshToken } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const validateRating = (rating: number): boolean => {
    // Check if it's a number and within range
    if (typeof rating !== 'number' || 
        isNaN(rating) || 
        rating < 0 || 
        rating > 5) {
      return false;
    }
  
    // Convert to string and check decimal places
    const ratingStr = rating.toString();
    
    // Match either whole numbers or numbers with exactly one decimal place
    return /^\d+(\.\d{1})?$/.test(ratingStr);
  };
  

  const validatePayoutRatio = (ratio: number): boolean => {
    if (ratio === undefined || ratio === null) return false;
    const ratioNum = Number(ratio);
    return !isNaN(ratioNum) && 
           ratioNum >= 0 && 
           ratioNum <= 100 && 
           /^\d{1,2}(\.\d{1,2})?$/.test(ratioNum.toString());
};

  const validatePayoutSpeed = (speed: string): boolean => {
    return typeof speed === 'string' && speed.trim().length > 0;
  };

  const validateCategoryRatings = (ratings: CategoryRating[]): boolean => {
    const requiredCategories = ['Games', 'Support', 'Banking', 'Mobile', 'User Experience'];
    return requiredCategories.every(category => {
      const rating = ratings.find(r => r.category === category);
      return rating && validateRating(rating.score);
    });
  };

  const initialCasinoState: CasinoData = {
    name: "",
    description: "",
    website: "",
    offer: "",
    established: new Date().getFullYear(),
    ourRating: 0,
    trustIndex: "Medium",
    categoryRatings: [
      { category: "Games", score: 0, description: "" },
      { category: "Support", score: 0, description: "" },
      { category: "Banking", score: 0, description: "" },
      { category: "Mobile", score: 0, description: "" },
      { category: "User Experience", score: 0, description: "" },
    ],
    payoutRatio: {
      percentage: 0,
      lastUpdated: new Date(),
    },
    payoutSpeed: {
      averageDays: "",
      details: "",
    },
    paymentMethods: [],
    currencies: [],
    minDeposit: 0,
    maxPayout: 0,
    licenses: [],
    securityMeasures: [],
    fairnessVerification: [],
    contentSections: [],
    advantages: [],
    disadvantages: [],
    orderInListing: 0,
    isActive: true,
    termsAndConditions: {
      firstDepositBonus: {
        minDeposit: 10, // Set a reasonable default minimum deposit
        maxCashout: 1000, // Set a reasonable default maximum cashout
        excludedPaymentMethods: [],
        wageringRequirement: 35, // Common wagering requirement
        bonusExpirationDays: 30, // Standard bonus expiration period
        processingSpeed: "Instant", // Default processing speed
        freeSpinsConditions: {
          wageringRequirement: 35,
          maxCashout: 100,
          expirationDays: 7
        },
        bonusPercentage: 100, // Standard 100% match bonus
        increasedBonusPercentage: undefined,
        increasedBonusTimeLimit: undefined,
        claimTimeLimit: 7, // Standard claim window
        currencies: []
      },
      generalTerms: [],
      eligibilityRequirements: [],
      restrictedCountries: [],
      additionalNotes: []
    }
  
  };

  const [casino, setCasino] = useState<CasinoData>(initialCasinoState);

  const createAxiosInstance = useCallback((): AxiosInstance => {
    const instance = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (retryCount < MAX_RETRIES) {
            try {
              await refreshToken();
              setRetryCount((prev) => prev + 1);
              const originalRequest = error.config;
              if (originalRequest && token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axios(originalRequest);
              }
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              setMessage("Session expired. Please log in again.");
              return Promise.reject(refreshError);
            }
          } else {
            setMessage("Maximum retry attempts reached. Please log in again.");
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [token, retryCount, refreshToken]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedLogo(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCategoryRatingChange = (index: number, value: string) => {
    // Parse the input value to a number
    let numValue = parseFloat(value);
    
    // If it's not a valid number, return early
    if (isNaN(numValue)) return;
    
    // Clamp the value between 0 and 5
    numValue = Math.max(0, Math.min(5, numValue));
    
    // Format to exactly one decimal place
    const formattedValue = Number(numValue.toFixed(1));
    
    setCasino(prev => {
      const newRatings = [...prev.categoryRatings];
      newRatings[index] = {
        ...newRatings[index],
        score: formattedValue
      };
      return {
        ...prev,
        categoryRatings: newRatings
      };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setCasino((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleArrayChange = (
    field: keyof Pick<CasinoData, 'currencies' | 'licenses' | 'securityMeasures' | 'fairnessVerification' | 'advantages' | 'disadvantages'>
  ) => (index: number, value: string) => {
    setCasino((prev) => {
      const currentValue = prev[field];
      if (Array.isArray(currentValue)) {
        const newArray = [...currentValue];
        newArray[index] = value;
        return {
          ...prev,
          [field]: newArray,
        };
      }
      return prev;
    });
  };

  const handlePaymentMethodChange = (index: number, field: keyof PaymentMethod, value: string | number) => {
    setCasino((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) =>
        i === index ? { ...method, [field]: value } : method
      ),
    }));
  };

  const handleContentSectionChange = (index: number, field: keyof ContentSection, value: string | number) => {
    setCasino((prev) => ({
      ...prev,
      contentSections: prev.contentSections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      ),
    }));
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const clampedValue = Math.max(0, Math.min(5, value));
      const formattedValue = Number(clampedValue.toFixed(1));
      setCasino(prev => ({
        ...prev,
        ourRating: formattedValue
      }));
    }
  };
  const handleAddItem = (field: keyof CasinoData) => {
    setCasino((prev) => {
      const currentValue = prev[field];
      if (!Array.isArray(currentValue)) return prev;

      const newItem = (() => {
        switch (field) {
          case 'paymentMethods':
            return {
              name: "",
              processingTime: "",
              minDeposit: 0,
              maxWithdrawal: 0,
              fees: "",
            };
          case 'contentSections':
            return {
              title: "",
              content: "",
              order: (currentValue as ContentSection[]).length,
            };
          default:
            return "";
        }
      })();

      return {
        ...prev,
        [field]: [...currentValue, newItem],
      };
    });
  };

  const handleRemoveItem = (
    field: keyof CasinoData,
    index: number
  ) => {
    setCasino((prev) => {
      const currentValue = prev[field];
      if (!Array.isArray(currentValue)) return prev;

      return {
        ...prev,
        [field]: currentValue.filter((_, i) => i !== index),
      };
    });
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setMessage("You must be authenticated as an admin");
      return;
    }

    // Basic validation
    const validationErrors = {
      name: !casino.name?.trim() ? "Casino name is required" : null,
      description: !casino.description?.trim() ? "Description is required" : null,
      website: !casino.website?.trim() ? "Website is required" : null,
      established: casino.established < 1900 || casino.established > new Date().getFullYear() 
        ? "Invalid establishment year" : null,
      ourRating: !validateRating(casino.ourRating) 
        ? "Rating must be between 0 and 5 with at most 1 decimal place" : null,
      trustIndex: !['Low', 'Medium', 'High'].includes(casino.trustIndex) 
        ? "Invalid trust index" : null,
      payoutRatio: !validatePayoutRatio(casino.payoutRatio.percentage)
        ? "Payout ratio must be between 0 and 100 with at most 2 decimal places" : null,
      payoutSpeed: !validatePayoutSpeed(casino.payoutSpeed.averageDays)
        ? "Average payout days is required" : null,
      categoryRatings: !validateCategoryRatings(casino.categoryRatings)
        ? "All category ratings must be provided with valid scores" : null,
      currencies: casino.currencies.length === 0 
        ? "At least one currency is required" : null,
      licenses: casino.licenses.length === 0 
        ? "At least one license is required" : null,
      logo: !casinoId && !selectedLogo && !previewUrl 
        ? "Logo is required" : null,
    };

    const errors = Object.entries(validationErrors)
      .filter(([_, value]) => value !== null)
      .map(([_, message]) => message);

    if (errors.length > 0) {
      setMessage(errors.join(", "));
      return;
    }

    setIsLoading(true);
    setRetryCount(0);

    try {
      const axiosInstance = createAxiosInstance();
      const formData = new FormData();

      // Helper function to clean array items
      const cleanArrayItem = (item: any): string => {
        if (typeof item !== 'string') return String(item).trim();
        
        try {
          if (item.startsWith('[') || item.startsWith('{') || item.startsWith('"')) {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              return parsed[0]?.toString().trim() || '';
            }
            return typeof parsed === 'string' ? parsed.trim() : String(parsed).trim();
          }
          return item.trim();
        } catch {
          return item.replace(/[\[\]"{}]/g, '').trim();
        }
      };

      // Process arrays and ensure clean strings
      const processArrayField = (field: any[]): string[] => {
        return field
          .map(cleanArrayItem)
          .filter(Boolean);
      };



      // Basic Information
      formData.append('name', casino.name.trim());
      formData.append('description', casino.description.trim());
      formData.append('website', casino.website.trim());
      formData.append('established', casino.established.toString());
      formData.append('ourRating', casino.ourRating.toFixed(1));
      formData.append('trustIndex', casino.trustIndex);
      formData.append('offer', casino.offer || '');

      // Payment Methods
      const validatedPaymentMethods = casino.paymentMethods.map(method => ({
        name: method.name.trim(),
        processingTime: method.processingTime.trim(),
        minDeposit: Math.max(0, Number(method.minDeposit)),
        maxWithdrawal: Math.max(0, Number(method.maxWithdrawal)),
        fees: method.fees.trim()
      }));
      const payoutRatioData = {
        percentage: Number(casino.payoutRatio.percentage),
        lastUpdated: new Date()
    };
    formData.append('payoutRatio', JSON.stringify(payoutRatioData));
      formData.append('paymentMethods', JSON.stringify(validatedPaymentMethods));

     
      // Category Ratings
      const validatedCategoryRatings = casino.categoryRatings.map(rating => ({
        ...rating,
        score: Number(parseFloat(rating.score.toFixed(1))),
        description: rating.description?.trim() || ""
      }));
      formData.append('categoryRatings', JSON.stringify(validatedCategoryRatings));

      // Financial Information
      formData.append('termsAndConditions', JSON.stringify({
        firstDepositBonus: {
            minDeposit: Number(casino.termsAndConditions.firstDepositBonus.minDeposit),
            maxCashout: Number(casino.termsAndConditions.firstDepositBonus.maxCashout),
            excludedPaymentMethods: casino.termsAndConditions.firstDepositBonus.excludedPaymentMethods,
            wageringRequirement: Number(casino.termsAndConditions.firstDepositBonus.wageringRequirement),
            bonusExpirationDays: Number(casino.termsAndConditions.firstDepositBonus.bonusExpirationDays),
            processingSpeed: casino.termsAndConditions.firstDepositBonus.processingSpeed,
            freeSpinsConditions: {
                wageringRequirement: Number(casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.wageringRequirement),
                maxCashout: Number(casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.maxCashout),
                expirationDays: Number(casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.expirationDays)
            },
            bonusPercentage: Number(casino.termsAndConditions.firstDepositBonus.bonusPercentage),
            claimTimeLimit: Number(casino.termsAndConditions.firstDepositBonus.claimTimeLimit),
            currencies: casino.termsAndConditions.firstDepositBonus.currencies
        },
        generalTerms: casino.termsAndConditions.generalTerms,
        eligibilityRequirements: casino.termsAndConditions.eligibilityRequirements,
        restrictedCountries: casino.termsAndConditions.restrictedCountries,
        additionalNotes: casino.termsAndConditions.additionalNotes
    }));
    
    // Payout Speed
    formData.append('payoutSpeed', JSON.stringify({
        averageDays: casino.payoutSpeed.averageDays,
        details: casino.payoutSpeed.details
    }));

      // Content Sections
      const validatedContentSections = casino.contentSections.map(section => ({
        title: section.title.trim(),
        content: section.content.trim(),
        order: Math.max(0, Number(section.order))
      }));
      formData.append('contentSections', JSON.stringify(validatedContentSections));

      // Array fields
      formData.append('currencies', JSON.stringify(processArrayField(casino.currencies)));
      formData.append('licenses', JSON.stringify(processArrayField(casino.licenses)));
      formData.append('securityMeasures', JSON.stringify(processArrayField(casino.securityMeasures)));
      formData.append('fairnessVerification', JSON.stringify(processArrayField(casino.fairnessVerification)));
      formData.append('advantages', JSON.stringify(processArrayField(casino.advantages)));
      formData.append('disadvantages', JSON.stringify(processArrayField(casino.disadvantages)));

      // Administrative Details
      formData.append('minDeposit', Math.max(0, Number(casino.minDeposit)).toString());
      formData.append('maxPayout', Math.max(0, Number(casino.maxPayout)).toString());
      formData.append('orderInListing', Math.max(0, Number(casino.orderInListing)).toString());
      formData.append('isActive', casino.isActive.toString());

      // Logo
      if (selectedLogo) {
        formData.append('logo', selectedLogo as Blob);
      }

      // API call with retry logic
      let attempt = 0;
      const maxAttempts = 3;
      let lastError: any = null;

      while (attempt < maxAttempts) {
        try {
          const response = casinoId
            ? await axiosInstance.put(`/ads/casino/${casinoId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              })
            : await axiosInstance.post("/ads/casino", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
          setMessage(response.data.message || "Casino saved successfully");
          if (onSuccess) {
            onSuccess();
          }
          return;

        } catch (error) {
          lastError = error;
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            attempt++;
            if (attempt < maxAttempts) {
              await refreshToken();
              continue;
            }
          }
          break;
        }
      }

      // Error handling
      if (lastError) {
        console.error('Error details:', lastError);
        if (axios.isAxiosError(lastError)) {
          if (lastError.response?.status === 401) {
            setMessage("Authentication failed. Please log in again.");
          } else if (lastError.response?.data?.error?.errors) {
            const validationErrors = Object.values(lastError.response.data.error.errors)
              .map((err: any) => err.message)
              .join(", ");
            setMessage(validationErrors);
          } else if (lastError.response?.data?.message) {
            setMessage(lastError.response.data.message);
          } else {
            setMessage("An error occurred while saving the casino.");
          }
        } else {
          setMessage("An unexpected error occurred.");
        }
      }

    } catch (error) {
      console.error("Submit error:", error);
      setMessage("An unexpected error occurred while submitting the form.");
    } finally {
      setIsLoading(false);
    }
};

useEffect(() => {
  if (casinoId) {  // Remove isAuthenticated check for GET requests
    const fetchCasino = async () => {
      setIsLoading(true);
      try {
        // Use regular axios for GET request
        const response = await axios.get(`${baseURL}/ads/casino/${casinoId}`);
        
        // Process the received data
        const casinoData = {
          ...response.data,
          termsAndConditions: {
            firstDepositBonus: {
              minDeposit: Number(response.data?.termsAndConditions?.firstDepositBonus?.minDeposit || 0),
              maxCashout: Number(response.data?.termsAndConditions?.firstDepositBonus?.maxCashout || 0),
              excludedPaymentMethods: response.data?.termsAndConditions?.firstDepositBonus?.excludedPaymentMethods || [],
              wageringRequirement: Number(response.data?.termsAndConditions?.firstDepositBonus?.wageringRequirement || 0),
              bonusExpirationDays: Number(response.data?.termsAndConditions?.firstDepositBonus?.bonusExpirationDays || 0),
              processingSpeed: response.data?.termsAndConditions?.firstDepositBonus?.processingSpeed || "Instant",
              freeSpinsConditions: {
                wageringRequirement: Number(response.data?.termsAndConditions?.firstDepositBonus?.freeSpinsConditions?.wageringRequirement || 0),
                maxCashout: Number(response.data?.termsAndConditions?.firstDepositBonus?.freeSpinsConditions?.maxCashout || 0),
                expirationDays: Number(response.data?.termsAndConditions?.firstDepositBonus?.freeSpinsConditions?.expirationDays || 0)
              },
              bonusPercentage: Number(response.data?.termsAndConditions?.firstDepositBonus?.bonusPercentage || 0),
              claimTimeLimit: Number(response.data?.termsAndConditions?.firstDepositBonus?.claimTimeLimit || 0),
              currencies: response.data?.termsAndConditions?.firstDepositBonus?.currencies || []
            },
            generalTerms: response.data?.termsAndConditions?.generalTerms || [],
            eligibilityRequirements: response.data?.termsAndConditions?.eligibilityRequirements || [],
            restrictedCountries: response.data?.termsAndConditions?.restrictedCountries || [],
            additionalNotes: response.data?.termsAndConditions?.additionalNotes || []
          },
          payoutRatio: {
            percentage: Number(response.data?.payoutRatio?.percentage || 0),
            lastUpdated: new Date(response.data?.payoutRatio?.lastUpdated || new Date())
          },
          paymentMethods: response.data?.paymentMethods || [],
          categoryRatings: response.data?.categoryRatings?.map((rating: any) => ({
            ...rating,
            score: Number(parseFloat(rating.score).toFixed(1))
          })) || [],
          currencies: response.data?.currencies || [],
          advantages: response.data?.advantages || [],
          disadvantages: response.data?.disadvantages || [],
          licenses: response.data?.licenses || [],
          securityMeasures: response.data?.securityMeasures || [],
          fairnessVerification: response.data?.fairnessVerification || [],
          contentSections: response.data?.contentSections || []
        };

        setCasino(casinoData);
        
        if (response.data.logo) {
          setPreviewUrl(`${baseURL}${response.data.logo}`);
        }

      } catch (error) {
        console.error("Error fetching casino:", error);
        setMessage("Failed to fetch casino details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCasino();
  }
}, [casinoId, baseURL]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


 
  return (
<form onSubmit={handleSubmit} className={styles.form}>
  {message && (
    <div className={message.includes('Error') ? styles.messageError : styles.messageSuccess}>
      {message}
    </div>
  )}

      <section>

        
        <div className={styles.basicInfoSection}>
  <h3 className={styles.sectionTitle}>Basic Information</h3>
  
  <div className={styles.formGroup}>
    <label className={styles.label}>Logo</label>
    <input
      type="file"
      accept="image/*"
      onChange={handleLogoChange}
      className={styles.fileInput}
    />
    {previewUrl && (
      <img src={previewUrl} alt="Preview" className={styles.previewImage} />
    )}
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>Casino Name</label>
    <input
      type="text"
      name="name"
      value={casino.name}
      onChange={handleChange}
      required
      className={styles.input}
    />
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>Description</label>
    <textarea
      name="description"
      value={casino.description}
      onChange={handleChange}
      required
      rows={4}
      className={styles.textarea}
    />
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>Website URL</label>
    <input
      type="url"
      name="website"
      value={casino.website}
      onChange={handleChange}
      required
      placeholder="https://example.com"
      className={styles.input}
    />
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>Established Year</label>
    <input
      type="number"
      name="established"
      value={casino.established}
      onChange={handleChange}
      min="1900"
      max={new Date().getFullYear()}
      className={styles.input}
    />
  </div>
</div>
{/*section two*/}
<section className={styles.offerSection}>
  <h3 className={styles.offerTitle}>Special Offer</h3>
  
  <div className={styles.offerGroup}>
    <label className={styles.offerLabel}>Offer</label>
    <input
      type="text"
      name="offer"
      value={casino.offer}
      onChange={(e) => {
        setCasino(prev => ({
          ...prev,
          offer: e.target.value
        }));
      }}
      placeholder="Enter special offer or promotion"
      className={styles.offerInput}
    />
  </div>
</section>

{/*section three*/}
{/* Ratings Section */}
<section className={styles.ratingsSection}>
  <h3 className={styles.ratingsTitle}>Ratings</h3>
  
  <div className={styles.ratingGroup}>
    <label className={styles.ratingLabel}>Our Rating (0-5)</label>
    <input
      type="number"
      name="ourRating"
      value={casino.ourRating}
      onChange={handleRatingChange}
      min="0"
      max="5"
      step="0.1"
      required
      className={styles.ratingInput}
    />
  </div>

  <div className={styles.ratingGroup}>
    <label className={styles.ratingLabel}>Trust Index</label>
    <select
      name="trustIndex"
      value={casino.trustIndex}
      onChange={handleChange}
      required
      className={styles.trustSelect}
    >
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>
  </div>

  <div className={styles.ratingGroup}>
    <label className={styles.ratingLabel}>Category Ratings</label>
    {casino.categoryRatings.map((rating, index) => (
      <div key={rating.category} className={styles.categoryItem}>
        <div className={styles.categoryName}>{rating.category}</div>
        <input
          type="number"
          value={rating.score}
          onChange={(e) => handleCategoryRatingChange(index, e.target.value)}
          min="0"
          max="5"
          step="0.1"
          required
          className={styles.ratingInput}
        />
        <input
          type="text"
          value={rating.description}
          onChange={(e) => {
            const newRatings = [...casino.categoryRatings];
            newRatings[index] = {
              ...newRatings[index],
              description: e.target.value
            };
            setCasino(prev => ({ ...prev, categoryRatings: newRatings }));
          }}
          placeholder="Description"
          className={styles.descriptionInput}
        />
      </div>
    ))}
  </div>
</section>


<section className={styles.termsSection}>
  <h3 className={styles.termsTitle}>Terms and Conditions</h3>
  
  {/* First Deposit Bonus */}
  <div className={styles.bonusContainer}>
    <h4 className={styles.subTitle}>First Deposit Bonus</h4>
    
    <div className={styles.grid}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Minimum Deposit</label>
        <input
          type="number"
          value={casino.termsAndConditions.firstDepositBonus.minDeposit}
          onChange={(e) => setCasino(prev => ({
            ...prev,
            termsAndConditions: {
              ...prev.termsAndConditions,
              firstDepositBonus: {
                ...prev.termsAndConditions.firstDepositBonus,
                minDeposit: Number(e.target.value)
              }
            }
          }))}
          className={styles.input}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Maximum Cashout</label>
        <input
          type="number"
          value={casino.termsAndConditions.firstDepositBonus.maxCashout}
          onChange={(e) => setCasino(prev => ({
            ...prev,
            termsAndConditions: {
              ...prev.termsAndConditions,
              firstDepositBonus: {
                ...prev.termsAndConditions.firstDepositBonus,
                maxCashout: Number(e.target.value)
              }
            }
          }))}
          className={styles.input}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Wagering Requirement (x)</label>
        <input
          type="number"
          value={casino.termsAndConditions.firstDepositBonus.wageringRequirement}
          onChange={(e) => setCasino(prev => ({
            ...prev,
            termsAndConditions: {
              ...prev.termsAndConditions,
              firstDepositBonus: {
                ...prev.termsAndConditions.firstDepositBonus,
                wageringRequirement: Number(e.target.value)
              }
            }
          }))}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Bonus Expiration (days)</label>
        <input
          type="number"
          value={casino.termsAndConditions.firstDepositBonus.bonusExpirationDays}
          onChange={(e) => setCasino(prev => ({
            ...prev,
            termsAndConditions: {
              ...prev.termsAndConditions,
              firstDepositBonus: {
                ...prev.termsAndConditions.firstDepositBonus,
                bonusExpirationDays: Number(e.target.value)
              }
            }
          }))}
          className={styles.input}
        />
      </div>
    </div>

    {/* Free Spins Conditions */}
    <div className={styles.spinConditions}>
      <h5 className={styles.subTitle}>Free Spins Conditions</h5>
      <div className={styles.grid3Cols}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Wagering Requirement</label>
          <input
            type="number"
            value={casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.wageringRequirement}
            onChange={(e) => setCasino(prev => ({
              ...prev,
              termsAndConditions: {
                ...prev.termsAndConditions,
                firstDepositBonus: {
                  ...prev.termsAndConditions.firstDepositBonus,
                  freeSpinsConditions: {
                    ...prev.termsAndConditions.firstDepositBonus.freeSpinsConditions,
                    wageringRequirement: Number(e.target.value)
                  }
                }
              }
            }))}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Max Cashout</label>
          <input
            type="number"
            value={casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.maxCashout}
            onChange={(e) => setCasino(prev => ({
              ...prev,
              termsAndConditions: {
                ...prev.termsAndConditions,
                firstDepositBonus: {
                  ...prev.termsAndConditions.firstDepositBonus,
                  freeSpinsConditions: {
                    ...prev.termsAndConditions.firstDepositBonus.freeSpinsConditions,
                    maxCashout: Number(e.target.value)
                  }
                }
              }
            }))}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Expiration (days)</label>
          <input
            type="number"
            value={casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.expirationDays}
            onChange={(e) => setCasino(prev => ({
              ...prev,
              termsAndConditions: {
                ...prev.termsAndConditions,
                firstDepositBonus: {
                  ...prev.termsAndConditions.firstDepositBonus,
                  freeSpinsConditions: {
                    ...prev.termsAndConditions.firstDepositBonus.freeSpinsConditions,
                    expirationDays: Number(e.target.value)
                  }
                }
              }
            }))}
            className={styles.input}
          />
        </div>
      </div>
    </div>
  </div>

  {/* General Terms */}
  <div className={styles.generalTerms}>
    <label className={styles.label}>General Terms</label>
    {casino.termsAndConditions.generalTerms.map((term, index) => (
      <div key={index} className={styles.termItem}>
        <input
          type="text"
          value={term}
          onChange={(e) => {
            const newTerms = [...casino.termsAndConditions.generalTerms];
            newTerms[index] = e.target.value;
            setCasino(prev => ({
              ...prev,
              termsAndConditions: {
                ...prev.termsAndConditions,
                generalTerms: newTerms
              }
            }));
          }}
          className={styles.termInput}
        />
        <button
          type="button"
          onClick={() => {
            const newTerms = casino.termsAndConditions.generalTerms.filter((_, i) => i !== index);
            setCasino(prev => ({
              ...prev,
              termsAndConditions: {
                ...prev.termsAndConditions,
                generalTerms: newTerms
              }
            }));
          }}
          className={styles.removeButton}
        >
          Remove
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => {
        setCasino(prev => ({
          ...prev,
          termsAndConditions: {
            ...prev.termsAndConditions,
            generalTerms: [...prev.termsAndConditions.generalTerms, ""]
          }
        }));
      }}
      className={styles.addButton}
    >
      Add General Term
    </button>
  </div>
</section>
{/* Financial Information Section */}
<section className={styles.financialSection}>
      <h3 className={styles.sectionTitle}>Financial Information</h3>
      
      <div className={styles.payoutContainer}>
        <label className={styles.label}>Payout Ratio (%)</label>
        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <input
              type="number"
              value={casino.payoutRatio.percentage}
              onChange={(e) => setCasino(prev => ({
                ...prev,
                payoutRatio: {
                  ...prev.payoutRatio,
                  percentage: Number(e.target.value)
                }
              }))}
              min="0"
              max="100"
              step="0.01"
              required
              className={`${styles.input} ${!casino.payoutRatio.percentage ? styles.inputError : ''}`}
            />
            {!casino.payoutRatio.percentage && (
              <p className={styles.errorMessage}>Payout ratio is required</p>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <input
              type="date"
              value={new Date(casino.payoutRatio.lastUpdated).toISOString().split('T')[0]}
              onChange={(e) => setCasino(prev => ({
                ...prev,
                payoutRatio: {
                  ...prev.payoutRatio,
                  lastUpdated: new Date(e.target.value)
                }
              }))}
              className={`${styles.input} ${styles.dateInput}`}
            />
          </div>
        </div>
      </div>

      <div className={styles.payoutSpeedContainer}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Average Payout Time</label>
          <input
            type="text"
            value={casino.payoutSpeed.averageDays}
            onChange={(e) => setCasino(prev => ({
              ...prev,
              payoutSpeed: {
                ...prev.payoutSpeed,
                averageDays: e.target.value
              }
            }))}
            placeholder="e.g., 2-3 days"
            required
            className={`${styles.input} ${!casino.payoutSpeed.averageDays ? styles.inputError : ''}`}
          />
          {!casino.payoutSpeed.averageDays && (
            <p className={styles.errorMessage}>Average payout days is required</p>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Payout Details</label>
          <input
            type="text"
            value={casino.payoutSpeed.details}
            onChange={(e) => setCasino(prev => ({
              ...prev,
              payoutSpeed: {
                ...prev.payoutSpeed,
                details: e.target.value
              }
            }))}
            className={`${styles.input} ${styles.detailsInput}`}
          />
        </div>
      </div>
    </section>

{/* Payment Methods Section */}
<section className={styles.section}>
  <h3 className={styles.sectionTitle}>Payment Methods</h3>
  
  {casino.paymentMethods.map((method, index) => (
    <div key={index} className={styles.methodCard}>
      <div className={styles.methodHeader}>
        <h4 className={styles.methodTitle}>Payment Method #{index + 1}</h4>
        <button
          type="button"
          onClick={() => handleRemoveItem('paymentMethods', index)}
          className={styles.removeButton}
        >
          Remove
        </button>
      </div>
      
      <div className={styles.methodGrid}>
        <input
          type="text"
          value={method.name || ''} // Add || ''
          onChange={(e) => handlePaymentMethodChange(index, 'name', e.target.value)}
          placeholder="Method Name"
          className={styles.input}
        />
        <input
          type="text"
          value={method.processingTime || ''} // Add || ''
          onChange={(e) => handlePaymentMethodChange(index, 'processingTime', e.target.value)}
          placeholder="Processing Time"
          className={styles.input}
        />
        <input
          type="number"
          value={method.minDeposit || ''} // Add || ''
          onChange={(e) => handlePaymentMethodChange(index, 'minDeposit', Number(e.target.value))}
          placeholder="Min Deposit"
          className={styles.input}
        />
        <input
          type="number"
          value={method.maxWithdrawal || ''} // Add || ''
          onChange={(e) => handlePaymentMethodChange(index, 'maxWithdrawal', Number(e.target.value))}
          placeholder="Max Withdrawal"
          className={styles.input}
        />
        <input
          type="text"
          value={method.fees || ''} // Add || ''
          onChange={(e) => handlePaymentMethodChange(index, 'fees', e.target.value)}
          placeholder="Fees %"
          className={styles.input}
        />
      </div>
    </div>
  ))}
  
  <button
    type="button"
    onClick={() => handleAddItem('paymentMethods')}
    className={styles.addButton}
  >
    Add Payment Method
  </button>
</section>

{/* Currencies Section */}
<section className={styles.section}>
      <h3 className={styles.sectionTitle}>Currencies</h3>
      
      {casino.currencies.map((currency, index) => (
        <div key={index} className={styles.currencyRow}>
          <input
            type="text"
            value={currency}
            onChange={(e) => handleArrayChange('currencies')(index, e.target.value)}
            className={styles.input}
          />
          <button
            type="button"
            onClick={() => handleRemoveItem('currencies', index)}
            className={styles.removeButton}
          >
            Remove
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => handleAddItem('currencies')}
        className={styles.addButton}
      >
        Add Currency
      </button>
    </section>

{/* Licensing & Security Section */}
<section className={styles.section}>
      <h3 className={styles.sectionTitle}>Licensing & Security</h3>
      
      {/* Licenses */}
      <div className={styles.subsection}>
        <label className={styles.label}>Licenses</label>
        {casino.licenses.map((license, index) => (
          <div key={index} className={styles.itemRow}>
            <input
              type="text"
              value={license}
              onChange={(e) => handleArrayChange('licenses')(index, e.target.value)}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => handleRemoveItem('licenses', index)}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddItem('licenses')}
          className={styles.addButton}
        >
          Add License
        </button>
      </div>

      {/* Security Measures */}
      <div className={styles.subsection}>
        <label className={styles.label}>Security Measures</label>
        {casino.securityMeasures.map((measure, index) => (
          <div key={index} className={styles.itemRow}>
            <input
              type="text"
              value={measure}
              onChange={(e) => handleArrayChange('securityMeasures')(index, e.target.value)}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => handleRemoveItem('securityMeasures', index)}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddItem('securityMeasures')}
          className={styles.addButton}
        >
          Add Security Measure
        </button>
      </div>

      {/* Fairness Verification */}
      <div className={styles.subsection}>
        <label className={styles.label}>Fairness Verification</label>
        {casino.fairnessVerification.map((verification, index) => (
          <div key={index} className={styles.itemRow}>
            <input
              type="text"
              value={verification}
              onChange={(e) => handleArrayChange('fairnessVerification')(index, e.target.value)}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => handleRemoveItem('fairnessVerification', index)}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddItem('fairnessVerification')}
          className={styles.addButton}
        >
          Add Verification Method
        </button>
      </div>
    </section>

{/* Content Sections */}
<section className={styles.section}>
      <h3 className={styles.sectionTitle}>Content Sections</h3>
      
      {casino.contentSections.map((section, index) => (
        <div key={index} className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <div className={styles.sectionBadge}>
              Section #{index + 1}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveItem('contentSections', index)}
              className={styles.removeButton}
            >
              Remove Section
            </button>
          </div>
          
          <div className={styles.cardContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Section Title</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleContentSectionChange(index, 'title', e.target.value)}
                placeholder="e.g., Welcome Bonus, Game Selection, Banking Methods"
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Content</label>
              <textarea
                value={section.content}
                onChange={(e) => handleContentSectionChange(index, 'content', e.target.value)}
                placeholder="Write your section content here. You can include details about features, benefits, requirements, or any other relevant information. Use clear and engaging language to inform your readers."
                required
                rows={8}
                className={styles.textarea}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Display Order</label>
              <div className={styles.orderInputWrapper}>
                <input
                  type="number"
                  value={section.order}
                  onChange={(e) => handleContentSectionChange(index, 'order', Number(e.target.value))}
                  min="0"
                  placeholder="Enter display order (0 = first)"
                  className={styles.orderInput}
                />
                <span className={styles.orderHint}>
                  Lower numbers appear first
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => handleAddItem('contentSections')}
        className={styles.addButton}
      >
        + Add New Content Section
      </button>
    </section>

       {/* Pros and Cons Section */}
       <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Pros and Cons</h3>
      
      <div className={styles.prosConsContainer}>
        {/* Pros/Advantages Column */}
        <div className={styles.columnPros}>
          <div className={styles.columnHeader}>
            <span className={styles.prosLabel}>Advantages</span>
          </div>
          <div className={styles.itemsList}>
            {casino.advantages.map((advantage, index) => (
              <div key={index} className={styles.itemRow}>
                <span className={styles.prosIcon}>+</span>
                <input
                  type="text"
                  value={advantage}
                  onChange={(e) => handleArrayChange('advantages')(index, e.target.value)}
                  placeholder="Add a positive aspect"
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('advantages', index)}
                  className={styles.removeButton}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem('advantages')}
              className={styles.addButtonPros}
            >
              + Add Advantage
            </button>
          </div>
        </div>

        {/* Cons/Disadvantages Column */}
        <div className={styles.columnCons}>
          <div className={styles.columnHeader}>
            <span className={styles.consLabel}>Disadvantages</span>
          </div>
          <div className={styles.itemsList}>
            {casino.disadvantages.map((disadvantage, index) => (
              <div key={index} className={styles.itemRow}>
                <span className={styles.consIcon}>-</span>
                <input
                  type="text"
                  value={disadvantage}
                  onChange={(e) => handleArrayChange('disadvantages')(index, e.target.value)}
                  placeholder="Add a negative aspect"
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('disadvantages', index)}
                  className={styles.removeButton}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem('disadvantages')}
              className={styles.addButtonCons}
            >
              + Add Disadvantage
            </button>
          </div>
        </div>
      </div>
    </section>

{/* Administrative Section */}
<section className={styles.section}>
      <h3 className={styles.sectionTitle}>Administrative Details</h3>
      
      <div>
        <label className={styles.label}>Order in Listing</label>
        <input
          type="number"
          name="orderInListing"
          value={casino.orderInListing}
          onChange={handleChange}
          min="0"
          className={styles.input}
        />
      </div>

      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          name="isActive"
          checked={casino.isActive}
          onChange={handleChange}
          className={styles.checkbox}
        />
        <label className={styles.checkboxLabel}>
          Active Casino
        </label>
      </div>
    </section>
        
    <button
  type="submit"
  disabled={isLoading}
  className={styles.submitButton}
>
  {isLoading ? 'Saving...' : (casinoId ? 'Update Casino' : 'Create Casino')}
</button>
      </section>
    </form>
  );
}