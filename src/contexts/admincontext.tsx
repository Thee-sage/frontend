import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../utils';
interface AdminAuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  adminData: AdminData | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  requestAdminUpgrade: (uid: string) => Promise<void>;
  submitAdminUpgrade: (uid: string, otp: string, password: string) => Promise<void>;
  clearError: () => void;
  clearMessage: () => void;
}

interface AdminData {
  email: string;
  uid: string;
  role: string;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedToken = localStorage.getItem('adminToken');
    return !!storedToken;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('adminToken');
  });
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('Auth State Changed:', {
      isAuthenticated,
      token: token ? 'exists' : 'null',
      adminData,
      loading
    });
  }, [isAuthenticated, token, adminData, loading]);

  useEffect(() => {
    if (token) {
      fetchDashboardData(token).catch(console.error);
    }
  }, [token]);

  const clearError = () => setError(null);
  const clearMessage = () => setMessage(null);

  const fetchDashboardData = async (authToken: string) => {
    try {
      console.log('Fetching dashboard data with token:', authToken ? 'exists' : 'null');
      const response = await axios.get(`${baseURL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('Dashboard data received:', response.data);
      
      // Update adminData with the response data
      if (response.data.adminData) {
        setAdminData(response.data.adminData);
      } else {
        // If adminData is not in the dashboard response, try to decode it from the token
        try {
          const tokenData = JSON.parse(atob(authToken.split('.')[1]));
          setAdminData({
            email: tokenData.email,
            uid: tokenData.uid,
            role: tokenData.role
          });
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    clearError();
    clearMessage();
    
    try {
      console.log('Attempting login for:', identifier);
      const response = await axios.post(`${baseURL}/admin/admin-login`, {
        identifier,
        password
      });
      
      setMessage(response.data.message || 'Please check your email for OTP');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    clearError();
    clearMessage();

    try {
      console.log('Verifying OTP for:', email);
      const response = await axios.post(`${baseURL}/admin/verify-otp`, {
        email,
        otp
      });

      if (response.data.token) {
        console.log('OTP verification successful, setting token');
        localStorage.setItem('adminToken', response.data.token);
        setToken(response.data.token);
        setIsAuthenticated(true);
        setMessage('Login successful');
        
        // Set admin data immediately from the OTP verification response
        setAdminData({
          email: response.data.email,
          uid: response.data.uid,
          role: 'admin' // You can get this from response if available
        });
        
        await fetchDashboardData(response.data.token);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out, clearing auth state');
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
    setAdminData(null);
    clearError();
    clearMessage();
  };

  const requestAdminUpgrade = async (uid: string) => {
    setLoading(true);
    clearError();
    clearMessage();

    try {
      const response = await axios.post(`${baseURL}/admin/request-upgrade`, { uid });
      setMessage(response.data.message);
    } catch (err: any) {
      console.error('Admin upgrade request error:', err);
      setError(err.response?.data?.message || 'Failed to request admin upgrade');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAdminUpgrade = async (uid: string, otp: string, password: string) => {
    setLoading(true);
    clearError();
    clearMessage();

    try {
      const response = await axios.post(`${baseURL}/admin/upgrade-to-admin`, {
        uid,
        otp,
        password
      });
      
      setMessage('Successfully upgraded to admin! Redirecting to admin panel...');
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        setToken(response.data.token);
        setIsAuthenticated(true);
        await fetchDashboardData(response.data.token);
      }
    } catch (err: any) {
      console.error('Admin upgrade submission error:', err);
      setError(err.response?.data?.message || 'Failed to upgrade to admin');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    token,
    adminData,
    loading,
    error,
    message,
    login,
    verifyOtp,
    logout,
    requestAdminUpgrade,
    submitAdminUpgrade,
    clearError,
    clearMessage
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};