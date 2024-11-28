import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from '../utils';
import { Star } from 'lucide-react';
import styles from "./casinoo.module.css"
// Updated TypeScript interfaces
interface PaymentMethod {
  name: string;
  processingTime: string;
  minDeposit: number;
  maxWithdrawal: number;
  fees: string;
}

interface FreeSpinsConditions {
  wageringRequirement: number;
  maxCashout: number;
  expirationDays: number;
}

interface BonusCurrency {
  currency: string;
  minDeposit: number;
}

interface FirstDepositBonus {
  minDeposit: number;
  maxCashout: number;
  excludedPaymentMethods: string[];
  wageringRequirement: number;
  bonusExpirationDays: number;
  processingSpeed: string;
  freeSpinsConditions: FreeSpinsConditions;
  bonusPercentage: number;
  increasedBonusPercentage?: number;
  increasedBonusTimeLimit?: number;
  claimTimeLimit: number;
  currencies: BonusCurrency[];
}

interface TermsAndConditions {
  firstDepositBonus: FirstDepositBonus;
  generalTerms: string[];
  eligibilityRequirements: string[];
  restrictedCountries?: string[];
  additionalNotes?: string[];
}

interface ContentSection {
  title: string;
  content: string;
  order: number;
}

interface CategoryRating {
  category: string;
  score: number;
  description: string;
}

interface Casino {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  website: string;
  established: number;
  offer: string;
  ourRating: number;
  trustIndex: "Low" | "Medium" | "High";
  categoryRatings: CategoryRating[];
  payoutRatio: {
    percentage: number;
    lastUpdated: Date;
  };
  payoutSpeed: {
    averageDays: string;
    details: string;
  };
  termsAndConditions: TermsAndConditions;
  paymentMethods: PaymentMethod[];
  currencies: string[];
  minDeposit: number;
  maxPayout: number;
  licenses: string[];
  securityMeasures: string[];
  fairnessVerification: string[];
  contentSections: ContentSection[];
  advantages: string[];
  disadvantages: string[];
  orderInListing: number;
  isActive: boolean;
}

export function PublicCasinoList(): JSX.Element {
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCasinos = async () => {
      try {
        const response = await axios.get<Casino[]>(`${baseURL}/ads/casino`);
        setCasinos(response.data.filter((casino: Casino) => casino.isActive));
      } catch (error) {
        console.error('Error fetching casinos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCasinos();
  }, []);

  if (isLoading) {
    return <div className={styles.pageContainer}>Loading casinos...</div>;
  }

  return (
    <div className={styles.prishthContainer}>
    <div className={styles.samagriContainer}>
      <h2 className={styles.prishthShirshak}>Top Online Casinos</h2>


      {casinos.map((casino: Casino) => (
        <div key={casino._id} className={styles.casinoWrapper}>
          <div className={styles.juaCard}>
    <div className={styles.juaHeader}>
      {casino.logo && (
        <div className={styles.chihnContainer}>
          <img
            src={`${baseURL}${casino.logo}`}
            alt={casino.name}
            className={styles.chihnChavi}
          />
        </div>
      )}
      
      <div className={styles.headerInfo}>
        <div className={styles.titleRow}>
          <h3 className={styles.juaNaam}>
            {casino.name}
            <span className={styles.established}>Est. {casino.established}</span>
          </h3>
        </div>
        
        <div className={styles.mulyankanContainer}>
          <Star className={styles.taraIcon} />
          <span className={styles.mulyankanScore}>{casino.ourRating}/5</span>
          <span className={`${styles.vishwasBadge} ${styles[casino.trustIndex.toLowerCase()]}`}>
  {casino.trustIndex} Trust
</span>
        </div>
      </div>
      
      {casino.offer && (
  <div className={styles.offerBadge}>
    {casino.offer}
  </div>
)}
    </div>

    <div className={styles.vivaranWrapper}>
      <p className={styles.vivaran}>{casino.description}</p>
    </div>

    <div className={styles.cardFooter}>
      <a
        href={casino.website}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.websiteLink}
      >
        Visit Website
      </a>
      <Link
        to={`/casinos/${casino._id}`}
        className={styles.dekheinButton}
      >
        View Details
      </Link>
    </div>
  </div>
  </div>
))}
    </div>
   
  </div>
  );
}

export function PublicCasinoDetail() {
    const [casino, setCasino] = useState<Casino | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [_error, setError] = useState('');
    const casinoId = window.location.pathname.split('/').pop();
  // Add this to your component
useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const processContent = (text: string) => {
    // Regular expression to identify URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Replace URLs with domain-based friendly links
    return text.replace(urlRegex, (url) => {
      // Remove admin/edit URLs completely
      if (url.includes('admin/casinos/edit')) {
        return '';
      }
      
      try {
        // Extract domain name from URL
        const domain = new URL(url).hostname
          .replace('www.', '')         // Remove www.
          .split('.')[0];              // Get first part of domain
        
        // Capitalize first letter for cleaner display
        const linkText = domain.charAt(0).toUpperCase() + domain.slice(1);
        
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      } catch {
        // Fallback if URL parsing fails
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">Link</a>`;
      }
    });
  };
    useEffect(() => {
      const fetchCasinoDetails = async () => {
        try {
          const response = await axios.get(`${baseURL}/ads/casino/${casinoId}`);
          setCasino(response.data);
          setError('');
        } catch (error) {
          setError('Failed to fetch casino details');
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      if (casinoId) {
        fetchCasinoDetails();
      }
    }, [casinoId]);

    if (isLoading) return <div className="text-center p-8">Loading casino details...</div>;
    if (!casino) return <div className="text-center p-8">Casino not found</div>;
  
    return (
<div className={styles.pageContainer}>
  <div className={styles.main}>
  <div className={styles.contentContainer}>
            <Link to="/casinos" className={styles.backLink}>
                ← Back to Casinos
            </Link>
              
    <div className={styles.card}>
      {/* Left Side - Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {casino.logo && (
            <img
              src={`${baseURL}${casino.logo}`}
              alt={casino.name}
              className={styles.logo}
            />
          )}
          <div className={styles.basicInfo}>
  {casino.established && (
    <div className={styles.establishedInfo}>
      <span className={styles.infoLabel}>Established:</span>
      <span className={styles.infoValue}>{casino.established}</span>
    </div>
  )}
</div>
          <h1 className={styles.name}>{casino.name}</h1>
          
          <div className={styles.ratingTrust}>
            <div className={styles.rating}>
              <Star className={styles.star} />
              <span className={styles.ratingText}>{casino.ourRating}/5</span>
            </div>
            
            <span
              className={`${styles.trustBadge} ${
                casino.trustIndex === 'High'
                  ? styles.trustHigh
                  : casino.trustIndex === 'Medium'
                  ? styles.trustMedium
                  : styles.trustLow
              }`}
            >
              {casino.trustIndex} Trust
            </span>
          </div>
          
          <p className={styles.description}>{casino.description}</p>
          
          <a
            href={casino.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.visitButton}
          >
            Visit Website
          </a>
        </div>
      </div>

      {/* Right Side - Content Section */}
      <div className={styles.contentWrapper}>
        {/* Move all other sections here */}
        {casino.offer && (
          <div className={styles.offerSection}>
            <h2 className={styles.offerTitle}>Current Offer</h2>
            <p className={styles.offerText}>{casino.offer}</p>
          </div>
        )}
      
            {/* Category Ratings */}
            <div className={styles.ratingsSection}>
              <h2 className={styles.ratingsTitle}>Ratings by Category</h2>
              <div className={styles.ratingsGrid}>
                {casino.categoryRatings.map((rating) => (
                  <div key={rating.category} className={styles.ratingCard}>
                    <h3 className={styles.ratingCategory}>{rating.category}</h3>
                    <div className={styles.ratingScore}>
                      <Star className={styles.star} />
                      <span>{rating.score}/5</span>
                    </div>
                    <p className={styles.ratingDescription}>{rating.description}</p>
                  </div>
                ))}
              </div>
            </div>
      
            {/* Terms and Conditions */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsTitle}>Bonus Terms & Conditions</h2>
              <div className={styles.termsGrid}>
                <div className={styles.termsCard}>
                  <h3 className={styles.termsSubtitle}>First Deposit Bonus</h3>
                  <div className={styles.termsContent}>
                    <p>Bonus Percentage: {casino.termsAndConditions.firstDepositBonus.bonusPercentage}%</p>
                    <p>Min Deposit: ${casino.termsAndConditions.firstDepositBonus.minDeposit}</p>
                    <p>Max Cashout: ${casino.termsAndConditions.firstDepositBonus.maxCashout}</p>
                    <p>Wagering Requirement: {casino.termsAndConditions.firstDepositBonus.wageringRequirement}x</p>
                    <p>Expires in: {casino.termsAndConditions.firstDepositBonus.bonusExpirationDays} days</p>
                    <p>Claim within: {casino.termsAndConditions.firstDepositBonus.claimTimeLimit} days</p>
                  </div>
                </div>
                <div className={styles.termsCard}>
                  <h3 className={styles.termsSubtitle}>Free Spins Conditions</h3>
                  <div className={styles.termsContent}>
                    <p>Wagering: {casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.wageringRequirement}x</p>
                    <p>Max Cashout: ${casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.maxCashout}</p>
                    <p>Valid for: {casino.termsAndConditions.firstDepositBonus.freeSpinsConditions.expirationDays} days</p>
                  </div>
                </div>
              </div>
      
              {/* General Terms and Requirements */}
              {(casino.termsAndConditions.generalTerms.length > 0 ||
      casino.termsAndConditions.eligibilityRequirements.length > 0 ||
      (casino.termsAndConditions.restrictedCountries && casino.termsAndConditions.restrictedCountries.length > 0)) && (
      <div className={styles.termsGrid}>
        {casino.termsAndConditions.generalTerms.length > 0 && (
          <div className={styles.termsCard}>
            <h3 className={styles.termsSubtitle}>General Terms</h3>
            <ul className={styles.termsList}>
              {casino.termsAndConditions.generalTerms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        )}
        {casino.termsAndConditions.eligibilityRequirements.length > 0 && (
          <div className={styles.termsCard}>
            <h3 className={styles.termsSubtitle}>Eligibility Requirements</h3>
            <ul className={styles.termsList}>
              {casino.termsAndConditions.eligibilityRequirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
        {casino.termsAndConditions.restrictedCountries && casino.termsAndConditions.restrictedCountries.length > 0 && (
          <div className={styles.termsCard}>
            <h3 className={styles.termsSubtitle}>Restricted Countries</h3>
            <ul className={styles.termsList}>
              {casino.termsAndConditions.restrictedCountries.map((country, index) => (
                <li key={index}>{country}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      )}
            </div>
      
            {/* Payment Methods */}
            <div className={styles.paymentsSection}>
  <h2 className={styles.paymentsTitle}>Payment Methods</h2>
  <div className={styles.paymentsTable}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.tableHeader}>Method</th>
          <th className={styles.tableHeader}>Processing Time</th>
          <th className={styles.tableHeader}>Min Deposit</th>
          <th className={styles.tableHeader}>Max Withdrawal</th>
          <th className={styles.tableHeader}>Fees</th>
        </tr>
      </thead>
      <tbody>
        {casino.paymentMethods.map((method) => (
          <tr key={method.name}>
            <td className={styles.tableCell}>{method.name}</td>
            <td className={styles.tableCell}>{method.processingTime}</td>
            <td className={`${styles.tableCell}`} data-type="currency">${method.minDeposit}</td>
            <td className={`${styles.tableCell}`} data-type="currency">${method.maxWithdrawal}</td>
            <td className={styles.tableCell}>{method.fees}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      
            {/* Banking Information */}
            <div className={styles.bankingSection}>
              <h2 className={styles.bankingTitle}>Banking Information</h2>
              <div className={styles.bankingGrid}>
                <div>
                  <h3 className={styles.bankingSubtitle}>Payout Information</h3>
                  <div className={styles.bankingContent}>
                    <p>Payout Ratio: {casino.payoutRatio.percentage}%</p>
                    <p>Average Payout Speed: {casino.payoutSpeed.averageDays}</p>
                    {casino.payoutSpeed.details && <p>Details: {casino.payoutSpeed.details}</p>}
                    <p>Minimum Deposit: ${casino.minDeposit}</p>
                    <p>Maximum Payout: ${casino.maxPayout}</p>
                  </div>
                </div>
                <div>
                  <h3 className={styles.bankingSubtitle}>Accepted Currencies</h3>
                  <div className={styles.currencies}>
                    {casino.currencies.map((currency) => (
                      <span key={currency} className={styles.currency}>
                        {currency}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
      
            {/* Security & Licensing */}
            <div className={styles.securitySection}>
  <h2 className={styles.securityTitle}>Security & Licensing</h2>
  <div className={styles.securityGrid}>
    <div>
      <h3 className={styles.securitySubtitle}>Licenses</h3>
      <ul className={styles.securityList}>
        {casino.licenses.map((license) => (
          <li key={license}>{license}</li>
        ))}
      </ul>
    </div>
    <div>
      <h3 className={styles.securitySubtitle}>Security Measures</h3>
      <ul className={styles.securityList}>
        {casino.securityMeasures.map((measure) => (
          <li key={measure}>{measure}</li>
        ))}
      </ul>
    </div>
    {casino.fairnessVerification && casino.fairnessVerification.length > 0 && (
      <div>
        <h3 className={styles.securitySubtitle}>Fairness Verification</h3>
        <ul className={styles.securityList}>
          {casino.fairnessVerification.map((verification) => (
            <li key={verification}>{verification}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
</div>
      
            {/* Pros and Cons */}
            <div className={styles.prosConsSection}>
              <h2 className={styles.prosConsTitle}>Pros & Cons</h2>
              <div className={styles.prosConsGrid}>
                <div>
                  <h3 className={styles.prosTitle}>Advantages</h3>
                  <ul className={styles.prosList}>
                    {casino.advantages.map((advantage) => (
                      <li key={advantage} className={styles.prosItem}>
                        <span className={styles.prosIcon}>✓</span>
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={styles.consTitle}>Disadvantages</h3>
                  <ul className={styles.consList}>
                    {casino.disadvantages.map((disadvantage) => (
                      <li key={disadvantage} className={styles.consItem}>
                        <span className={styles.consIcon}>✗</span>
                        {disadvantage}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
      
            {/* Content Sections */}
{casino.contentSections.length > 0 && (
  <div className={styles.contentSection}>
    <h2 className={styles.contentTitle}>Additional Information</h2>
    {casino.contentSections
      .sort((a, b) => a.order - b.order)
      .map((section) => (
        <div key={section.title} className={styles.contentItem}>
          <h3 className={styles.contentSubtitle}>{section.title}</h3>
          <p 
            className={styles.contentText}
            dangerouslySetInnerHTML={{ 
              __html: processContent(section.content) 
            }}
          />
        </div>
      ))}
  </div>
)}
          </div>
        </div>
        </div>
        </div>
      </div>
);
}
  