import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>About The Plinko Challenge</h3>
          <p>A free-to-play simulation game that recreates the classic Plinko experience.
              Practice and understand game mechanics without real money involvement.</p>
          <div className={styles.disclaimer}>
            <strong>Disclaimer:</strong> This is a simulation for entertainment purposes only.
             No real gambling or monetary transactions involved.
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/privacy-policy#game-info" className={styles.footerLink}>How to Play and game statistics</Link></li>
            <li><Link to="/privacy-policy#information" className={styles.footerLink}>FAQ and Cookie Policy</Link></li>
          </ul>
        </div>

   

        <div className={styles.footerSection}>
          <h3>Responsible Gaming</h3>
          <p>Remember that real gambling can be addictive. If you or someone you know needs help:</p>
          <ul>
            <li><a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">BeGambleAware</a></li>
            <li><a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer">GamCare</a></li>
            <li><a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer">Gambling Therapy</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerDivider} />
        <div className={styles.footerCopyright}>
          <p>© {currentYear} The Plinko Challenge. For entertainment purposes only.</p>
          <div className={styles.footerLinks}>
            <Link to="/privacy-policy#introduction" className={styles.footerLink}>Privacy Policy</Link>
            <span className={styles.divider}>|</span>
            <Link to="/privacy-policy#terms" className={styles.footerLink}>Terms of Use</Link>
            <span className={styles.divider}>|</span>
            <Link to="/privacy-policy#contact" className={styles.footerLink}>Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};