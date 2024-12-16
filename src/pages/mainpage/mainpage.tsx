import { Demo } from './Demo';
import styles from './PlinkoLandingPage.module.css';
import { Link } from "react-router-dom";

const PlinkoLandingPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.abc}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
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
            <Link to="/game" className={styles.ctaButton}>
              ✨ Start Playing ✨
            </Link>
          </div>
        </div>

        {/* Game Demo Section */}
        <div className={styles.demoSection}>
          <div className={styles.demoContainer}>
            <h2 className={styles.demoTitle}>Try Your Strategy</h2>
            <Demo />
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.featuresGrid}>
  <div className={styles.featureCard}>
    <div className={styles.featureIcon}>⚙️</div>
    <h3 className={styles.featureTitle}>Game Features</h3>
    <p className={styles.featureText}>
      16 rows of precision-engineered pegs, 17 scoring buckets with multipliers from 0.2x to 16x, Physics-based ball movement, Real-time probability display
    </p>
  </div>
  <div className={styles.featureCard}>
    <div className={styles.featureIcon}>📊</div>
    <h3 className={styles.featureTitle}>Win Probabilities</h3>
    <p className={styles.featureText}>
      Center (8): 16.8%, Peak (7,9): 12.5%, Elite (6,10): 9.7%, Premium (5,11): 7.45%, High Value (4,12): 7.0%
    </p>
  </div>
  <div className={styles.featureCard}>
    <div className={styles.featureIcon}>💰</div>
    <h3 className={styles.featureTitle}>Practice in a fun filled simulated environment</h3>
    <p className={styles.featureText}>
     This is a fun filled simulated environment so must enjoy.
    </p>
  </div>
</div>
      </div>
    </div>
  );
};

export default PlinkoLandingPage;