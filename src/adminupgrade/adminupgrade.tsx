import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/admincontext';
import { useNavigate } from 'react-router-dom';
import styles from "./page.module.css"
const AdminManagement: React.FC = () => {
  const navigate = useNavigate();
  // Form state
  const [uid, setUid] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(Array(4).fill(''));
  const [password, setPassword] = useState<string>('');
  const [isOtpRequested, setIsOtpRequested] = useState<boolean>(false);
  const [identifier, setIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginOtp, setLoginOtp] = useState<string>('');
  const [isOtpVerificationRequired, setIsOtpVerificationRequired] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'login' | 'upgrade'>('login');

  // Get auth context
  const {
    loading,
    error,
    message,
    isAuthenticated,
    login,
    verifyOtp,
    requestAdminUpgrade,
    submitAdminUpgrade,
    clearError,
    clearMessage
  } = useAdminAuth();

  // Redirect to admin dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      clearError();
      clearMessage();
    };
  }, [clearError, clearMessage]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 3);
    setOtp(newOtp);
  };

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await requestAdminUpgrade(uid);
      setIsOtpRequested(true);
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Remove the response variable since it's not used
      await login(identifier, loginPassword);
      setIsOtpVerificationRequired(true);
    } catch (err) {
      // Error is handled by context
    }
};

  const handleOtpVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await verifyOtp(identifier, loginOtp);
      // No need for explicit navigation here as the isAuthenticated effect will handle it
    } catch (err) {
      setLoginOtp('');
    }
  };

  const handleUpgradeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const otpString = otp.join('');
      await submitAdminUpgrade(uid, otpString, password);
      // After successful upgrade, show success message and redirect after a delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000); // 2 second delay to show the success message
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Admin Management System</h1>
        
        <div className={styles.tabContainer}>
          <button 
            onClick={() => setActiveTab('login')} 
            className={`${styles.tabButton} ${
              activeTab === 'login' ? styles.tabButtonActive : styles.tabButtonInactive
            }`}
            disabled={loading}
          >
            Admin Login
          </button>
          <button 
            onClick={() => setActiveTab('upgrade')} 
            className={`${styles.tabButton} ${
              activeTab === 'upgrade' ? styles.tabButtonActive : styles.tabButtonInactive
            }`}
            disabled={loading}
          >
            Request Admin Upgrade
          </button>
        </div>

        {activeTab === 'login' && (
          <form onSubmit={isOtpVerificationRequired ? handleOtpVerification : handleLogin} 
                className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="text"
                className={styles.input}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isOtpVerificationRequired || loading}
                required
              />
            </div>
            
            {!isOtpVerificationRequired && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            {isOtpVerificationRequired && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Enter OTP</label>
                <input
                  type="text"
                  className={styles.input}
                  maxLength={6}
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Processing...' : (isOtpVerificationRequired ? 'Verify OTP' : 'Login')}
            </button>
          </form>
        )}

        {activeTab === 'upgrade' && (
          <div>
            {!isOtpRequested ? (
              <form onSubmit={handleRequestOtp} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>User Id (UID)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.button}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Request OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUpgradeSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Enter OTP Parts</label>
                  <div className={styles.otpContainer}>
                    {otp.map((part, index) => (
                      <input
                        key={index}
                        type="text"
                        className={styles.otpInput}
                        maxLength={3}
                        value={part}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        disabled={loading}
                        required
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Approval Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.button}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Upgrade to Admin'}
                </button>
              </form>
            )}
          </div>
        )}

        {(message || error) && (
          <div className={`${styles.message} ${error ? styles.messageError : styles.messageSuccess}`}>
            {error || message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;