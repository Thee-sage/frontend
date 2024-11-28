import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';
import { baseURL } from '../utils';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  adminData: AdminData | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  currentEmail: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  requestAdminUpgrade: (uid: string) => Promise<void>;
  submitAdminUpgrade: (uid: string, otp: string, password: string) => Promise<void>;
  clearError: () => void;
  clearMessage: () => void;
  refreshToken: () => Promise<string | null>;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const clearError = () => setError(null);
  const clearMessage = () => setMessage(null);

  // Refreshing token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing) return null;
    
    try {
      setIsRefreshing(true);
      console.log('Attempting to refresh token');
      
      const currentToken = localStorage.getItem('adminToken');
      if (!currentToken) {
        throw new Error('No token available for refresh');
      }

      const response = await axios.post(
        `${baseURL}/admin/refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      if (response.data.token) {
        console.log('Token refresh successful');
        const newToken = response.data.token;
        localStorage.setItem('adminToken', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
        return newToken;
      }
      return null;
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      throw new Error('Token refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const fetchDashboardData = async (authToken: string) => {
    try {
      console.log('Fetching dashboard data with token:', authToken ? 'exists' : 'null');
      const response = await axios.get(`${baseURL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.data.adminData) {
        setAdminData(response.data.adminData);
      } else {
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
      if (err.response?.status === 401) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            await fetchDashboardData(newToken);
            return;
          }
        } catch (refreshErr) {
          console.error('Refresh token failed during dashboard fetch:', refreshErr);
        }
        logout();
      }
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('adminToken');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Try to restore session from localStorage
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchDashboardData(storedToken).catch(console.error);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  useEffect(() => {
    console.log('Auth State Changed:', {
      isAuthenticated,
      token: token ? 'exists' : 'null',
      adminData,
      loading,
      currentEmail
    });
  }, [isAuthenticated, token, adminData, loading, currentEmail]);

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
      
      if (response.data.email) {
        console.log('Setting current email:', response.data.email);
        setCurrentEmail(response.data.email);
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(identifier)) {
          console.log('Setting current email from identifier:', identifier);
          setCurrentEmail(identifier);
        }
      }
      
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
      const emailToUse = email || currentEmail;
      
      if (!emailToUse) {
        throw new Error('No email available for OTP verification');
      }

      console.log('Verifying OTP for:', emailToUse);
      const response = await axios.post(`${baseURL}/admin/verify-otp`, {
        email: emailToUse,
        otp
      });

      if (response.data.token) {
        console.log('OTP verification successful, setting token');
        localStorage.setItem('adminToken', response.data.token);
        setToken(response.data.token);
        setIsAuthenticated(true);
        setMessage('Login successful');
        
        setAdminData({
          email: response.data.email,
          uid: response.data.uid,
          role: 'admin'
        });
        
        await fetchDashboardData(response.data.token);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
      setCurrentEmail(null);
    }
  };

  const logout = () => {
    console.log('Logging out, clearing auth state');
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
    setAdminData(null);
    setCurrentEmail(null);
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

  // Create axios instance with interceptors
  useEffect(() => {
    const axiosInstance = axios.create();
    
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && token) {
          try {
            const newToken = await refreshToken();
            if (newToken && error.config) {
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return axios(error.config);
            }
          } catch (refreshError) {
            console.error('Token refresh failed in interceptor:', refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }, [token, refreshToken]);

  const value = {
    isAuthenticated,
    token,
    adminData,
    loading,
    error,
    message,
    currentEmail,
    login,
    verifyOtp,
    logout,
    requestAdminUpgrade,
    submitAdminUpgrade,
    clearError,
    clearMessage,
    refreshToken
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;