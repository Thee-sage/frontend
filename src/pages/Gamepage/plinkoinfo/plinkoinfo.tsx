
import styles from "./PlinkoInfo.module.css";

const PlinkoInfo = () => {
  return (
    <div className={styles.infoContainer}>
     

     
      <div className={styles.gridContainer}>
        <div className={styles.infoBox}>
          <h3 className={styles.inputLabel}>
            Game Features
          </h3>

          <ul className={styles.featureList}>
            <li>16 Rows of Precision-placed Pegs</li>
            <li>17 Scoring Buckets</li>
            <li>Realistic Physics Engine</li>
            <li>Free-to-Play Simulation</li>
          </ul>
        </div>

        <div className={styles.infoBox}>
          <h3 className={styles.inputLabel}>
            How to Play
          </h3>
          <ul className={styles.featureList}>
            <li>Click to Drop the Ball</li>
            <li>Watch it Bounce Through Pegs</li>
            <li>Land in Scoring Buckets</li>
            <li>Practice Risk-Free</li>
          </ul>
        </div>
        <div className={`${styles.message} ${styles.infoMessage}`}>
        This is a simulation for entertainment purposes only. No real money or stakes involved.
      </div>
      </div>
      
    
    </div>
  );
};

export default PlinkoInfo;