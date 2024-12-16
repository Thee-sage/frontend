import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './MainContentAdCard.module.css';
import { SafetyIndex } from '../SafetyIndex/SafetyIndex';
import { Ad } from '../types';
import { baseURL } from '../../../utils';

interface MainContentAdCardProps {
  ad: Ad;
}

const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export const MainContentAdCard = ({ ad }: MainContentAdCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickInfo, _setShowQuickInfo] = useState(false);

  const imageUrl = ad.imageUrl?.startsWith('http')
    ? ad.imageUrl
    : ad.imageUrl
    ? `${baseURL}${ad.imageUrl}`
    : DEFAULT_PLACEHOLDER;

  const bonusText = ad.casino?.offer || ad.description;
  const shouldTruncate = bonusText?.length > 50;

  // Function to handle T&C link click
  const handleTCClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (ad.casino) {
      // Navigate to casino details page with terms section
      window.location.href = `/casinos/${ad.casino._id}#terms`;
    }
  };

  return (
    <div className={styles.adCard}>
      <div className={styles.photo}>
        <div className={styles.logo}>
          <img
            src={imageUrl}
            alt={ad.title}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = DEFAULT_PLACEHOLDER;
            }}
          />
        </div>
      </div>

      <div className={styles.nameandbonus}>
        <div className={styles.title}>{ad.title}</div>
        <div className={styles.bonusContainer}>
          {ad.casino ? (
            <>
              <span>BONUS:</span>{' '}
              {shouldTruncate ? (
                <>
                  {isExpanded ? bonusText : `${bonusText.slice(0, 100)}...`}{' '}
                  <button 
                    className={styles.readMore} 
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </button>
                </>
              ) : (
                bonusText
              )}
              <Link 
                to={`/casinos/${ad.casino._id}#terms`} 
                className={styles.tcLink}
                onClick={handleTCClick}
              >
                T&Cs apply
              </Link>
            </>
          ) : (
            <>
              {shouldTruncate ? (
                <>
                  {isExpanded ? ad.description : `${ad.description?.slice(0, 100)}...`}{' '}
                  <button 
                    className={styles.readMore} 
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </button>
                </>
              ) : (
                ad.description
              )}
              {ad.description && (
                <a href="#" className={styles.tcLink} onClick={(e) => e.preventDefault()}>
                  T&Cs apply
                </a>
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.buttons}>
          <div className={styles.description}>{ad.description}</div>
          <div className={styles.butt}>
            {ad.casino && (
              <Link 
              to={`/casinos#${ad.casino._id}`}
                className={`${styles.quickInfo} ${showQuickInfo ? styles.active : ''}`}
              >
                Quick info
                
              </Link>
            )}

            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.visitCasino}
            >
              Visit {ad.casino ? 'casino' : 'site'}
            </a>
            </div>
          </div>
        </div>
       <div className={styles.safetyIndex}>
        {ad.casino && <SafetyIndex trustIndex={ad.casino.trustIndex} />}
        </div>
      </div>
    </div>
  );
};