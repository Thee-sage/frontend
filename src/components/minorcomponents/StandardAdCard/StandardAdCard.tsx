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
      <div className={styles.ratingWrapper}>
          <span className={styles.ratingLabel}>Our rating:</span>
          <div className={styles.ratingContent}>
            <span className={styles.star}>⭐</span>
            <span className={styles.rating}>{ad.rating}/5</span>
          </div>
        </div>
     
      <div className={styles.adFeature}>
        {ad.description}
      </div>
      <div className={styles.visi}>
      <a 
          href={ad.link}
          className={styles.visitButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Visit Site</span>
          <span className={styles.arrow}>›</span>
        </a>
        </div>
    </div>
  );
};