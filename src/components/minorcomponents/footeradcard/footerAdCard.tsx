import { useState } from 'react';
import styles from './FooterAdCard.module.css';
import { baseURL } from '../../../utils';
import { Ad } from '../types';

const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
interface FooterAdCardProps {
  ad: Ad;
}
export const FooterAdCard = ({ ad }: FooterAdCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (!ad.imageUrl || imageError) return DEFAULT_PLACEHOLDER;
    return ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseURL}${ad.imageUrl}`;
  };

  return (
    <div className={styles.adCard}>
      <div className={styles.imageContainer}>
        <img
          src={getImageUrl()}
          alt={ad.title}
          className={styles.image}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{ad.title}</h3>
        <p className={styles.description}>{ad.description}</p>
        
        <div className={styles.footer}>
          <div className={styles.rating}>
            <span className={styles.starIcon}>⭐</span>
            <span>{ad.rating}/5</span>
          </div>
          
          <a
            href={ad.link}
            className={styles.button}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Site
            <span>›</span>
          </a>
        </div>
      </div>
    </div>
  );
};