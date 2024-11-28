import { useState } from 'react';
import styles from './SidebarAdCard.module.css';
import { baseURL } from '../../../utils';
import { Ad } from '../types';

const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

interface SidebarAdCardProps {
  ad: Ad;
}

export const SidebarAdCard = ({ ad }: SidebarAdCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (!ad.imageUrl || imageError) return DEFAULT_PLACEHOLDER;
    return ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseURL}${ad.imageUrl}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <img
          src={getImageUrl()}
          alt={ad.title}
          className={`${styles.image} ${imageError ? styles.fallbackImage : ''}`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
      
      <div className={styles.content}>
        <div className={styles.bonus}>
          {ad.title}
        </div>

        <div className={styles.ratingContainer}>
          Our rating: 
          <span className={styles.ratingValue}>{ad.rating.toFixed(1)}</span>
          <span className={styles.ratingMax}>/5</span>
          <span className={styles.star}>⭐</span>
        </div>
      </div>

      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.visitButton}
      >
        Visit Site
        <span className={styles.arrow}>›</span>
      </a>
    </div>
  );
};