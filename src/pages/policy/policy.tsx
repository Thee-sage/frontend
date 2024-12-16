import { useState, useEffect, FormEvent } from 'react';
import styles from './policy.module.css';
import { baseURL } from '../../utils';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const PrivacyPolicy = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Add scroll handling
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

  useEffect(() => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(date);

    // Handle initial hash navigation on component mount
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 180);
    }
  }, []);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const href = event.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState({}, '', href);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus('sending');
    
    try {
      const response = await fetch(`${baseURL}/api/auth/contact/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyNav}>
        <nav>
          <a href="#introduction" onClick={handleNavClick}>Introduction</a>
          <a href="#information" onClick={handleNavClick}>Information</a>
          <a href="#how-we-use" onClick={handleNavClick}>Usage</a>
          <a href="#game-info" onClick={handleNavClick}>Game</a>
          <a href="#cookies" onClick={handleNavClick}>Cookies</a>
          <a href="#terms" onClick={handleNavClick}>Terms</a>
          <a href="#contact" onClick={handleNavClick}>Contact</a>
        </nav>
      </div>

      <div className={styles.policyContent}>
        <h1 className={styles.mainTitle}>Privacy Policy</h1>
        
        <section id="introduction" className={styles.section}>
          <h2>Introduction</h2>
          <p>This Privacy Policy explains how ThePlinkoChallenge.com ("we," "us," or "our") collects, uses, and protects your information when you use our website.</p>
        </section>

        <section id="information" className={styles.section}>
          <h2>Information We Collect</h2>
          
          <div className={styles.subsection}>
            <h3>Google Account Integration</h3>
            <p>When you choose to sign in with Google, they provide us with:</p>
            <ul>
              <li>Email address</li>
              <li>Name</li>
              <li>Google account identifier</li>
              <li>Basic profile information</li>
            </ul>
          </div>

          <div className={styles.subsection}>
            <h3>System Information</h3>
            <p>Your browser automatically sends standard technical information:</p>
            <ul>
              <li>Browser type and version</li>
              <li>Device type</li>
              <li>Operating system</li>
            </ul>
            <p>This is standard browser behavior and happens automatically when visiting any website.</p>
          </div>
        </section>

        <section id="how-we-use" className={styles.section}>
          <h2>How We Use Your Information</h2>
          <p>We use the collected information solely to:</p>
          <ul>
            <li>Provide and maintain our service</li>
            <li>Allow you to log in and maintain your session</li>
            <li>Improve user experience</li>
            <li>Ensure technical functionality</li>
          </ul>
        </section>

        <section id="game-info" className={styles.section}>
          <h2>Game Information</h2>
          
          <div className={styles.subsection}>
            <h3>Game Features</h3>
            <ul>
              <li>16 rows of precision-engineered pegs</li>
              <li>17 scoring buckets with multipliers from 0.2x to 16x</li>
              <li>Physics-based ball movement</li>
              <li>Real-time probability display</li>
              <li>Play around with a simulated currency letting you have the feel of the game</li>
            </ul>
          </div>

          <div className={styles.subsection}>
            <h3>Win Probabilities</h3>
            <ul>
              <li>Outer Buckets (0, 16): 0.2% each</li>
              <li>Near Edge (1, 15): 0.45% each</li>
              <li>Secondary (2, 14): 0.9% each</li>
              <li>Middle Tier (3, 13): 3.0% each</li>
              <li>High Value (4, 12): 7.0% each</li>
              <li>Premium (5, 11): 7.45% each</li>
              <li>Elite (6, 10): 9.7% each</li>
              <li>Peak (7, 9): 12.5% each</li>
              <li>Center (8): 16.8%</li>
            </ul>
          </div>
        </section>

        <section id="cookies" className={styles.section}>
          <h2>Cookie Policy</h2>
          
          <div className={styles.subsection}>
            <h3>Cookies We Use</h3>
            <p>We use a minimal set of cookies that are necessary for the website to function:</p>
            
            <div className={styles.cookieType}>
              <h4>Authentication Cookies</h4>
              <ul>
                <li>Purpose: To keep you signed in</li>
                <li>Duration: Session cookies (deleted when you close your browser)</li>
              </ul>
            </div>

            <div className={styles.cookieType}>
              <h4>Google Sign-In Cookies</h4>
              <ul>
                <li>Purpose: To manage Google authentication</li>
                <li>Managed by: Google</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="terms" className={styles.section}>
          <h2>Terms of Use</h2>
          <div className={styles.subsection}>
            <h3>Agreement to Terms</h3>
            <p>By accessing and using ThePlinkoChallenge.com, you agree to be bound by these Terms of Use and all applicable laws and regulations.</p>
          </div>

          <div className={styles.subsection}>
            <h3>Use License</h3>
            <p>This is a free simulation game for entertainment purposes only. No real money gambling is involved or permitted.</p>
            <ul>
              <li>The game is provided "as is" without any warranties</li>
              <li>You must not use the game for real money gambling</li>
              <li>You must not exploit or attempt to hack the game</li>
              <li>We reserve the right to modify or discontinue the service at any time</li>
            </ul>
          </div>

          <div className={styles.subsection}>
            <h3>Limitations</h3>
            <p>ThePlinkoChallenge.com will not be liable for any damages arising from the use or inability to use our service. This includes but is not limited to:</p>
            <ul>
              <li>Direct or indirect damages</li>
              <li>Lost profits or data</li>
              <li>Service interruptions</li>
              <li>Technical issues</li>
            </ul>
          </div>
        </section>

        <section id="contact" className={styles.section}>
          <h2>Contact Us</h2>
          <div className={styles.subsection}>
            <h3>Get in Touch</h3>
            <p>For any questions about our privacy policy, terms of use, or general inquiries:</p>
            <ul>
              <li>Email: support@ThePlinkoChallenge.com</li>
              <li>Twitter: @plinkogame</li>
              <li>Discord: Join our community server</li>
            </ul>
            
            <div className={styles.contactForm}>
              <h4>Send us a message</h4>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <input 
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={submitStatus === 'sending'}
                >
                  {submitStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                
                {submitStatus === 'success' && (
                  <p className={styles.successMessage}>Message sent successfully!</p>
                )}
                {submitStatus === 'error' && (
                  <p className={styles.errorMessage}>Failed to send message. Please try again.</p>
                )}
              </form>
            </div>
          </div>
        </section>

        <div className={styles.policyFooter}>
          <p>This policy is effective as of {currentDate} and was last updated on {currentDate}.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;