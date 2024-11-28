import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import { AdForm } from "./AdForm";
import { useAdminAuth } from "../contexts/admincontext";
import styles from "./styles/AdList.module.css"
interface AdminData {
  email: string;
  uid: string;
  role: string;
}

interface AuthContext {
  token: string;
  isAuthenticated: boolean;
  adminData: AdminData | null;
}

interface Ad {
  _id: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  service: string;
  rating: number;
  location: string;
  isShowInMainPage: boolean;
  percentageInHomePage: number;
  orderInCasinosPage: number;
  casino?: {
    _id: string;
    name: string;
    logo: string;
  };
  createdBy?: {
    email: string;
    timestamp: Date;
  };
  lastEditedBy?: {
    email: string;
    timestamp: Date;
  };
}

export function AdList() {
  const { token, isAuthenticated } = useAdminAuth() as AuthContext;
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const defaultPlaceholder = useMemo(() => `${baseURL}/default-placeholder.jpg`, []);

  const authAxios = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const response = await authAxios.get<Ad[]>(`/ads/ad`);
      setAds(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching ads", error);
      setError("Failed to fetch ads");
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAds();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const handleImageError = (adId: string) => {
    if (!imageLoadErrors[adId]) {
      setImageLoadErrors(prev => ({ ...prev, [adId]: true }));
    }
  };

  const handleAddAd = () => {
    setSelectedAdId(null);
    setShowForm(true);
  };

  const handleEditAd = (adId: string) => {
    setSelectedAdId(adId);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchAds();
    setShowForm(false);
    setSelectedAdId(null);
    setImageLoadErrors({});
  };

  const handleDeleteAd = async (adId: string) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      try {
        await authAxios.delete(`/ads/ad/id/${adId}`);
        await fetchAds();
        setError(null);
      } catch (error) {
        console.error("Error deleting ad:", error);
        setError("Failed to delete the ad");
      }
    }
  };

  const getImageUrl = (ad: Ad) => {
    if (!ad.imageUrl) return defaultPlaceholder;
    if (imageLoadErrors[ad._id]) return defaultPlaceholder;
    return ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseURL}${ad.imageUrl}`;
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Ad Management</h1>
        <div className={styles.errorMessage}>
          Please log in as an admin to view and manage ads.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Ad Management</h1>
        <div className={styles.loadingState}>Loading ads...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
    <h1 className={styles.title}>Ad Management</h1>
    
    <div className={styles.header}>
  
      <button
        onClick={handleAddAd}
        className={styles.addButton}
      >
        Add New Ad
      </button>
    </div>
    
    {error && (
      <div className={styles.errorMessage}>{error}</div>
    )}

    {showForm && (
      <div className="mb-8">
        <AdForm adId={selectedAdId} onSuccess={handleFormSuccess} />
      </div>
    )}

    {!showForm && (
      <div className={styles.grid}>
        {ads.map((ad) => (
          <div key={ad._id} className={styles.card}>
          <div className={styles.imageContainer}>
            <img
              src={getImageUrl(ad)}
              alt={ad.title}
              className={imageLoadErrors[ad._id] ? styles.imageFallback : styles.image}
              onError={() => handleImageError(ad._id)}
              loading="lazy"
            />
          </div>
          
          <div className={styles.cardContent}>
  <div className={styles.contentWrapper}>
    <div className={styles.mainContent}>
      <h3 className={styles.cardTitle}>{ad.title}</h3>
      <p className={styles.cardDescription}>{ad.description}</p>
      
      <div className={styles.metrics}>
        <div className={styles.rating}>
          <span>★</span>
          <span>{ad.rating.toFixed(1)}</span>
        </div>
        <span className={`${styles.tag} ${styles.tagHeader}`}>{ad.location}</span>
        <span className={`${styles.tag} ${styles.tagGoogleAdsense}`}>{ad.service}</span>
      </div>

      {(ad.location === 'MainContent' || ad.location === 'Header') ? (
  <div className={styles.infoSection}>
    {ad.location === 'MainContent' && (
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Main Page</span>
        <span className={`${styles.tag} ${styles.tagMainContent}`}>
          {ad.isShowInMainPage ? 'Yes' : 'No'}
        </span>
      </div>
    )}
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>Order</span>
      <span className={styles.infoValue}>#{ad.orderInCasinosPage}</span>
    </div>
  </div>
) : (
  <div className={styles.orderSection}>
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>Order</span>
      <span className={styles.infoValue}>#{ad.orderInCasinosPage}</span>
    </div>
  </div>
)}
    </div>

    <div className={styles.footerContent}>
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        View Ad Link →
      </a>
      
      <div className={styles.meta}>
        {ad.createdBy?.email && (
          <p>Created by: {ad.createdBy.email}</p>
        )}
        {ad.lastEditedBy?.email && (
          <p>Last edited by: {ad.lastEditedBy.email}</p>
        )}
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={() => handleEditAd(ad._id)}
          className={styles.editButton}
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteAd(ad._id)}
          className={styles.deleteButton}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</div>
</div>
       
))}
      </div>
    )}

    {!showForm && ads.length === 0 && (
      <div className={styles.emptyState}>
        <div>No ads found</div>
        <div className={styles.meta}>
          Click "Add New Ad" to create your first advertisement
        </div>
      </div>
    )}
  </div>
  );
}