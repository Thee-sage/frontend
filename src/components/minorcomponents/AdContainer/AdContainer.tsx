import { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../../utils';
import { Ad } from '../types';
import styles from './AdContainer.module.css';

interface AdContainerProps {
  renderAds: (props: {
    headerAds: Ad[];
    sidebarAds: Ad[];
    mainContentAds: Ad[];
    footerAds: Ad[];
  }) => React.ReactNode;
  children: React.ReactNode; // For the game component and other content
}

export const AdContainer = ({ renderAds, children }: AdContainerProps) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [mainContentAds, setMainContentAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        
        const [regularResponse, mainContentResponse] = await Promise.all([
          axios.get<Ad[]>(`${baseURL}/public`),
          axios.get<Ad[]>(`${baseURL}/public/main-content`)
        ]);

        setAds(regularResponse.data);
        setMainContentAds(mainContentResponse.data.filter(ad => 
          ad.location === "MainContent"
        ));
        setError(null);
      } catch (error) {
        console.error("Error fetching ads:", error);
        setError("Failed to load advertisements");
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  const headerAds = ads.filter(ad => ad.location === "Header");
  const sidebarAds = ads.filter(ad => ad.location === "Sidebar");
  const footerAds = ads.filter(ad => ad.location === "Footer");

  return (
    <div className={styles.pageWrapper}>
      {renderAds({
        headerAds,
        sidebarAds,
        mainContentAds,
        footerAds,
      })}
      {children}
    </div>
  );
};