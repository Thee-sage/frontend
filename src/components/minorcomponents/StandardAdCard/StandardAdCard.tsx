import { useState } from 'react';
import styles from './StandardAdCard.module.css';
import { baseURL } from '../../../utils';
import { Ad } from '../types';
const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

interface StandardAdCardProps {
  ad: Ad;
}

export const StandardAdCard = ({ ad }: StandardAdCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (!ad.imageUrl || imageError) return DEFAULT_PLACEHOLDER;
    return ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseURL}${ad.imageUrl}`;
  };

  return (
    <div className={styles.adContainer}>
      <div className={styles.adImageContainer}>
        <img
          src={getImageUrl()}
          alt={ad.title}
          className={`${styles.adImage} ${imageError ? styles.adImageFallback : ''}`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
      <div className={styles.adLogo}>
        {ad.title}
      </div>
      <div className={styles.adRatingContainer}>
        <span className={styles.adRatingLabel}>Our rating:</span>
        <span className={styles.adRatingValue}>{ad.rating.toFixed(1)}</span>
        <span className={styles.adRatingMax}>/5</span>
      </div>
      <div className={styles.adFeature}>
        {ad.description}
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.visitSiteButton}
      >
        Visit Site
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
          className="w-4 h-4 ml-1"
        >
          <path 
            fillRule="evenodd" 
            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </a>
    </div>
  );
};