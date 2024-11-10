import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './contexts/admincontext';
import { useNavigate } from 'react-router-dom';

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
      const response = await login(identifier, loginPassword);
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
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Management System</h1>
      <div className="flex mb-4">
        <button 
          onClick={() => setActiveTab('login')} 
          className={`p-2 flex-1 ${activeTab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          disabled={loading}
        >
          Admin Login
        </button>
        <button 
          onClick={() => setActiveTab('upgrade')} 
          className={`p-2 flex-1 ${activeTab === 'upgrade' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          disabled={loading}
        >
          Request Admin Upgrade
        </button>
      </div>

      {activeTab === 'login' && (
        <form onSubmit={isOtpVerificationRequired ? handleOtpVerification : handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2">Email or UID</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isOtpVerificationRequired || loading}
              required
            />
          </div>
          
          {!isOtpVerificationRequired && (
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          {isOtpVerificationRequired && (
            <div>
              <label className="block mb-2">Enter OTP</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
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
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isOtpVerificationRequired ? 'Verify OTP' : 'Login')}
          </button>
        </form>
      )}

      {activeTab === 'upgrade' && (
        <div>
          {!isOtpRequested ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block mb-2">User Email (UID)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Request OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpgradeSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Enter OTP Parts</label>
                <div className="grid grid-cols-4 gap-2">
                  {otp.map((part, index) => (
                    <input
                      key={index}
                      type="text"
                      className="w-full p-2 border rounded text-center"
                      maxLength={3}
                      value={part}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      disabled={loading}
                      required
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-2">Approval Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upgrade to Admin'}
              </button>
            </form>
          )}
        </div>
      )}

      {(message || error) && (
        <div className={`mt-4 p-4 rounded ${error ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {error || message}
        </div>
      )}
    </div>
  );
};

export default AdminManagement;