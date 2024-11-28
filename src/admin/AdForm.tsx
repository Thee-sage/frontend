import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import { useAdminAuth } from "../contexts/admincontext";
import { CasinoSelect } from './CasinoSelect';
import styles from "./styles/AdForm.module.css";

interface AdFormProps {
  adId: string | null;
  onSuccess?: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  link?: string;
  rating?: string;
  casino?: string;
  orderInCasinosPage?: string;
}

const DESCRIPTION_MAX_LENGTH = 150;

export function AdForm({ adId, onSuccess }: AdFormProps) {
  const { token, isAuthenticated } = useAdminAuth();
  const [ad, setAd] = useState({
    title: '',
    description: '',
    link: '',
    rating: 0,
    service: 'GoogleAdSense',
    location: 'Header',
    isShowInMainPage: false,
    percentageInHomePage: 0,
    orderInCasinosPage: 0,
    casino: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [charactersLeft, setCharactersLeft] = useState(DESCRIPTION_MAX_LENGTH);
  const [errors, setErrors] = useState<FormErrors>({});

  const authAxios = useMemo(() => axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  }), [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'percentageInHomePage') return;
    
    if (name === 'description') {
      if (value.length <= DESCRIPTION_MAX_LENGTH) {
        setAd(prevAd => ({ ...prevAd, [name]: value }));
        setCharactersLeft(DESCRIPTION_MAX_LENGTH - value.length);
        setErrors(prev => ({ ...prev, description: undefined }));
      }
      return;
    }
    
    setAd(prevAd => ({
      ...prevAd,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const missingFields: string[] = [];
    
    if (!ad.title.trim()) {
      newErrors.title = 'Title is required';
      missingFields.push('Title');
    }
    if (!ad.description.trim()) {
      newErrors.description = 'Description is required';
      missingFields.push('Description');
    }
    if (!ad.link.trim()) {
      newErrors.link = 'Link is required';
      missingFields.push('Link');
    }
    if (!ad.rating) {
      newErrors.rating = 'Rating is required';
      missingFields.push('Rating');
    }
    if (ad.location === 'MainContent') {
      if (!ad.casino) {
        newErrors.casino = 'Casino selection is required';
        missingFields.push('Casino');
      }
      if (!ad.orderInCasinosPage) {
        newErrors.orderInCasinosPage = 'Order is required';
        missingFields.push('Order in Casinos Page');
      }
    }
    
    setErrors(newErrors);
    
    if (missingFields.length > 0) {
      setMessage(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (adId && isAuthenticated) {
      async function fetchAd() {
        try {
          const response = await authAxios.get(`/ads/ad/${adId}`);
          const adData = {
            ...response.data,
            percentageInHomePage: 0,
            description: response.data.description.substring(0, DESCRIPTION_MAX_LENGTH)
          };
          setAd(adData);
          setCharactersLeft(DESCRIPTION_MAX_LENGTH - adData.description.length);
          if (response.data.imageUrl) {
            setPreviewUrl(`${baseURL}${response.data.imageUrl}`);
          }
        } catch (error) {
          console.error('Error fetching ad:', error);
          setMessage("Failed to fetch ad details");
        }
      }
      fetchAd();
    }
  }, [adId, isAuthenticated, authAxios]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setMessage("You must be authenticated as an admin to perform this action");
      return;
    }

    setErrors({});
    setMessage("");

    // Validate form before making the API call
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      const submitData = {
        ...ad,
        percentageInHomePage: 0
      };
      
      Object.entries(submitData).forEach(([key, value]) => {
        if (key === 'isShowInMainPage') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value?.toString() || '');
        }
      });
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await authAxios({
        method: adId ? 'put' : 'post',
        url: adId ? `/ads/ad/id/${adId}` : '/ads/ad',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(response.data.message || `Ad ${adId ? 'updated' : 'created'} successfully`);
      if (!adId) {
        setAd({
          title: '',
          description: '',
          link: '',
          rating: 0,
          service: 'GoogleAdSense',
          location: 'Header',
          isShowInMainPage: false,
          percentageInHomePage: 0,
          orderInCasinosPage: 0,
          casino: ''
        });
        setSelectedImage(null);
        setPreviewUrl('');
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        let errorMessage = "";
        
        if (error.response?.status === 401) {
          errorMessage = "Authentication error. Please log in again.";
        } else if (error.response?.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (error.response?.status === 404) {
          errorMessage = "Ad not found. It may have been deleted.";
        } else if (error.response?.status === 413) {
          errorMessage = "Image file size is too large. Please use a smaller image.";
        } else {
          errorMessage = "An unexpected error occurred. Please try again.";
        }
        
        setMessage(errorMessage);
      } else {
        setMessage("An unexpected error occurred. Please try again or contact support if the problem persists.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className={styles.messageError}>Please log in as an admin to manage ads.</div>;
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>{adId ? "Edit Ad" : "Create Ad"}</h2>
      {message && (
        <div className={`${styles.message} ${message.includes('required fields') ? styles.messageError : message.includes('successfully') ? styles.messageSuccess : styles.messageError}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title:</label>
          <input
            type="text"
            name="title"
            value={ad.title}
            onChange={handleChange}
            required
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Description: <span className={styles.characterCount}>({charactersLeft} characters left)</span>
          </label>
          <textarea
            name="description"
            value={ad.description}
            onChange={handleChange}
            required
            rows={2}
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder={`Maximum ${DESCRIPTION_MAX_LENGTH} characters`}
            className={`${styles.textarea} ${errors.description ? styles.inputError : ''} ${
              ad.description.length >= DESCRIPTION_MAX_LENGTH ? styles.textareaLimit : ''
            }`}
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Link:</label>
          <input
            type="url"
            name="link"
            value={ad.link}
            onChange={handleChange}
            required
            className={`${styles.input} ${errors.link ? styles.inputError : ''}`}
          />
          {errors.link && <span className={styles.errorText}>{errors.link}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
          {previewUrl && (
            <div className={styles.preview}>
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Rating:</label>
          <input
            type="number"
            name="rating"
            value={ad.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            required
            className={`${styles.input} ${errors.rating ? styles.inputError : ''}`}
          />
          {errors.rating && <span className={styles.errorText}>{errors.rating}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Service:</label>
          <select 
            name="service" 
            value={ad.service} 
            onChange={handleChange} 
            required
            className={styles.select}
          >
            <option value="GoogleAdSense">Google AdSense</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ad Location:</label>
          <select 
            name="location" 
            value={ad.location} 
            onChange={handleChange} 
            required
            className={styles.select}
          >
            <option value="Header">Header</option>
            <option value="Sidebar">Sidebar</option>
            <option value="Footer">Footer</option>
            <option value="MainContent">Main Content</option>
          </select>
        </div>

        {ad.location === 'MainContent' && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Associated Casino:</label>
              <div className={`${styles.casinoSelectWrapper} ${errors.casino ? styles.selectError : ''}`}>
                <CasinoSelect
                  value={ad.casino}
                  onChange={(casinoId) => {
                    setAd(prev => ({ ...prev, casino: casinoId }));
                    setErrors(prev => ({ ...prev, casino: undefined }));
                  }}
                />
              </div>
              {errors.casino && <span className={styles.errorText}>{errors.casino}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isShowInMainPage"
                  checked={ad.isShowInMainPage}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <span>Show in Main Page</span>
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Order in Casinos Page:</label>
              <input
                type="number"
                name="orderInCasinosPage"
                value={ad.orderInCasinosPage}
                onChange={handleChange}
                min="0"
                className={`${styles.input} ${errors.orderInCasinosPage ? styles.inputError : ''}`}
              />
              {errors.orderInCasinosPage && (
                <span className={styles.errorText}>{errors.orderInCasinosPage}</span>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.submitButton} ${isLoading ? styles.submitButtonDisabled : ''}`}
        >
          {isLoading ? 'Processing...' : (adId ? 'Update Ad' : 'Create Ad')}
        </button>
      </form>
    </div>
  );
}