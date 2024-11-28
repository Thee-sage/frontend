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
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const transitionIdRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const sortedAdsRef = useRef<Ad[]>([]);

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
        setSettings({ totalCycleTime: 600000 }); // 10 minute fallback
      }
    };

    fetchSettings();
    socket.on("settings_updated", (updatedSettings) => {
      setSettings({ totalCycleTime: updatedSettings.totalCycleTime });
    });

    return () => {
      socket.off("settings_updated");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!ads?.length || settings.totalCycleTime === null) return;

    const cleanup = () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (transitionIdRef.current) clearTimeout(transitionIdRef.current);
    };

    cleanup();

    sortedAdsRef.current = [...ads].sort((a, b) => {
      const orderA = a.orderInCasinosPage ?? Infinity;
      const orderB = b.orderInCasinosPage ?? Infinity;
      return orderA - orderB;
    });

    const numAds = sortedAdsRef.current.length;
    const weights = Array(numAds).fill(0).map((_, index) => Math.pow(2, numAds - index - 1));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const displayTimes = weights.map(weight => 
      Math.floor((weight / totalWeight) * settings.totalCycleTime!)
    );

    console.log('Rotation config:', {
      totalCycleTime: settings.totalCycleTime! / 60000,
      isFallback: settings.totalCycleTime === 600000,
      displayTimes: displayTimes.map((time, i) => ({
        ad: sortedAdsRef.current[i].title,
        minutes: time / 60000,
        order: sortedAdsRef.current[i].orderInCasinosPage
      }))
    });

    const rotateAds = () => {
      if (!sortedAdsRef.current[currentAdIndex]) {
        setCurrentAdIndex(0);
        return;
      }

      setIsTransitioning(true);
      
      transitionIdRef.current = setTimeout(() => {
        setIsTransitioning(false);
        const nextIndex = (currentAdIndex + 1) % numAds;
        setCurrentAdIndex(nextIndex);
        
        timeoutIdRef.current = setTimeout(rotateAds, displayTimes[nextIndex]);
      }, 300);
    };

    setCurrentAdIndex(0);
    startTimeRef.current = Date.now();
    timeoutIdRef.current = setTimeout(rotateAds, displayTimes[0]);

    return cleanup;
  }, [ads, settings.totalCycleTime]);

  if (!ads?.length || !sortedAdsRef.current[currentAdIndex]) return null;

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