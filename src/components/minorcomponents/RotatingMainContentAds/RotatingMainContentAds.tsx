import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import axios from "axios";
import styles from './RotatingMainContentAds.module.css';
import { MainContentAdCard } from '../MainContentAdCard/MainContentAdCard';
import { baseURL} from '../../../utils';
import { Ad } from '../types';

interface RotatingMainContentAdsProps {
  ads: Ad[];
}

export const RotatingMainContentAds = ({ ads }: RotatingMainContentAdsProps) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settings, setSettings] = useState<{ totalCycleTime: number | null }>({ totalCycleTime: null });
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const transitionIdRef = useRef<NodeJS.Timeout | null>(null);
  const sortedAdsRef = useRef<Ad[]>([]);

  // Add debug logging
  useEffect(() => {
    console.log('RotatingMainContentAds mounted');
    console.log('Initial ads:', ads);
    console.log('Initial settings:', settings);
  }, []);

  useEffect(() => {
    console.log('Ads changed:', ads);
    console.log('Ads length:', ads?.length);
  }, [ads]);

  useEffect(() => {
    const socket = io(baseURL, {
      transports: ['websocket', 'polling']
    });

    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${baseURL}/settings`);
        console.log('Settings response:', response.data.totalCycleTime);
        setSettings({ totalCycleTime: response.data.totalCycleTime });
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSettings({ totalCycleTime: 600000 });
      }
    };

    fetchSettings();
    socket.on("settings_updated", (updatedSettings) => {
      console.log('Settings updated:', {
        totalCycleTime: updatedSettings.totalCycleTime / 60000,
        isFallback: false
      });
      setSettings({ totalCycleTime: updatedSettings.totalCycleTime });
    });

    return () => {
      socket.off("settings_updated");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!ads?.length || settings.totalCycleTime === null) {
      console.log('Early return condition met:', {
        adsLength: ads?.length,
        totalCycleTime: settings.totalCycleTime
      });
      return;
    }

    const cleanup = () => {
      console.log('Cleaning up previous rotation cycle');
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      if (transitionIdRef.current) clearTimeout(transitionIdRef.current);
    };

    cleanup();

    sortedAdsRef.current = [...ads].sort((a, b) => {
      const orderA = a.orderInCasinosPage ?? Infinity;
      const orderB = b.orderInCasinosPage ?? Infinity;
      return orderA - orderB;
    });

    console.log('Sorted ads:', sortedAdsRef.current);

    const numAds = sortedAdsRef.current.length;
    const weights = Array(numAds).fill(0).map((_, index) => Math.pow(2, numAds - index - 1));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const displayTimes = weights.map(weight => 
      Math.floor((weight / totalWeight) * settings.totalCycleTime!)
    );

    console.log('Display times calculated:', displayTimes);

    const rotateAd = () => {
      setIsTransitioning(true);
      
      transitionIdRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentAdIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % numAds;
          console.log('Rotation State:', {
            previousAd: sortedAdsRef.current[prevIndex].title,
            nextAd: sortedAdsRef.current[nextIndex].title,
            displayTimeMinutes: displayTimes[nextIndex] / 60000
          });
          return nextIndex;
        });
      }, 300);
    };

    intervalIdRef.current = setInterval(rotateAd, displayTimes[currentAdIndex]);

    return cleanup;
  }, [ads, settings.totalCycleTime]);

  // Add debug logging before return
  if (!ads?.length || !sortedAdsRef.current[currentAdIndex]) {
    console.log('Returning null due to:', {
      adsLength: ads?.length,
      currentAd: sortedAdsRef.current[currentAdIndex],
      currentIndex: currentAdIndex
    });
    return null;
  }

  return (
    <div className={styles.mainContentSection}>
      <div className={`${styles.rotatingAdContainer} ${isTransitioning ? styles.transitioning : ''}`}>
        <MainContentAdCard 
          key={sortedAdsRef.current[currentAdIndex]._id} 
          ad={sortedAdsRef.current[currentAdIndex]} 
        />
      </div>
    </div>
  );
};