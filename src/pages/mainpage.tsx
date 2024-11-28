import { Demo } from './Demo';
import styles from './PlinkoLandingPage.module.css';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseURL } from "../utils";


// Import the separated components
import { StandardAdCard } from '../components/minorcomponents/StandardAdCard/StandardAdCard';
import { RotatingMainContentAds } from '../components/minorcomponents/RotatingMainContentAds/RotatingMainContentAds';
import type { Ad } from '../components/minorcomponents/types';
import { SidebarAdCard } from '../components/minorcomponents/SidebarAdCard/SidebarAdCard';
const PlinkoLandingPage = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [mainContentAds, setMainContentAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        
        // Fetch regular ads and main content ads in parallel
        const [regularResponse, mainContentResponse] = await Promise.all([
          axios.get<Ad[]>(`${baseURL}/public`),
          axios.get<Ad[]>(`${baseURL}/public/main-content`)
        ]);

        console.log("Main content response:", mainContentResponse.data);
        
        // Remove the casino verification check and filter only by location
        const mainContentFiltered = mainContentResponse.data.filter(ad => 
          ad.location === "MainContent"
        );

        setAds(regularResponse.data);
        setMainContentAds(mainContentFiltered);
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

  const filterAdsByLocation = (location: string) => {
    return ads.filter(ad => ad.location === location);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        {/* Header Ad Section */}
        <div>
          {filterAdsByLocation("Header").map((ad) => (
            <StandardAdCard key={ad._id} ad={ad} />
          ))}
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Master the Drop in{' '}
            <span className={styles.heroTitleAccent}>Plinko</span>
          </h1>
          <p className={styles.heroText}>
            Experience the thrill of strategic gameplay with our modern Plinko. 
            Watch as each drop creates a unique path, with multipliers that can 
            lead to exciting wins. Perfect your technique in our refined gaming environment.
          </p>
          <button className={styles.ctaButton}>
            <Link to="/game" className={styles.ctaButtonLink}>
              ✨ Start Playing ✨
            </Link>
          </button>
        </div>
      </div>

      {/* Sidebar Ads */}
      <div>
          {filterAdsByLocation("Sidebar").map((ad) => (
            <SidebarAdCard key={ad._id} ad={ad} />
          ))}
        </div>

      {/* Game Demo Section */}
      <div className={styles.demoSection}>
        <div className={styles.demoContainer}>
          <h2 className={styles.demoTitle}>Try Your Strategy</h2>
          <Demo />
        </div>

        {/* Main Content Ads - Using dedicated mainContentAds state */}
        <div>
          <RotatingMainContentAds ads={mainContentAds} />
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🎯</div>
          <h3 className={styles.featureTitle}>Strategic Depth</h3>
          <p className={styles.featureText}>
            Multiple drop points and risk levels let you control your gameplay style
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⚡</div>
          <h3 className={styles.featureTitle}>Instant Rewards</h3>
          <p className={styles.featureText}>
            Watch your strategy pay off with immediate results and exciting multipliers
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🏆</div>
          <h3 className={styles.featureTitle}>Daily Challenges</h3>
          <p className={styles.featureText}>
            Complete special events and tournaments for bonus rewards
          </p>
        </div>
      </div>

      {/* Footer Ads */}
      <div className={`${styles.adsGrid} ${styles.footerAds}`}>
        {filterAdsByLocation("Footer").map((ad) => (
          <StandardAdCard key={ad._id} ad={ad} />
        ))}
      </div>
    </div>
  );
};

export default PlinkoLandingPage;