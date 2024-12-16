import React, { createContext, useContext, useState, useEffect } from "react";
import { googleLogout } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../utils";
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  uid: string;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  initiateDeleteAccount: (password: string) => Promise<{ success: boolean; message: string }>;
  confirmDeleteAccount: (token: string) => Promise<void>;
  initiatePasswordReset: (password: string) => Promise<{ success: boolean; message: string }>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUid = localStorage.getItem("uid");
    console.log("Stored UID on load:", storedUid);
    if (storedUid) {
      fetchUserProfile(storedUid);
    }
  }, []);

  const fetchUserProfile = async (uid: string) => {
    console.log("Fetching user profile with UID:", uid);
  
    try {
      // Retrieve the JWT token from localStorage
      const token = localStorage.getItem("token");
      
      const res = await axios.get(`${baseURL}/account/user/${uid}`, { 
        headers: {
          Authorization: `Bearer ${token}`,  // Include the token in the request header
        },
        withCredentials: true 
      });
      
      console.log("User profile fetched successfully:", res.data);
      
      setProfile({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        email: res.data.email,
        role: res.data.role,
        uid: res.data.uid,
      });
      setUser(uid);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      localStorage.removeItem("uid");
      setUser(null);
      setProfile(null);
    }
  };
  

  const loginWithGoogle = async (credential: string) => {
    try {
      console.log("Attempting Google login with credential:", credential);
      const res = await axios.post(
        `${baseURL}/api/auth/google/callback`,
        { token: credential },
        { withCredentials: true }
      );
      console.log("Google login success, profile data:", res.data);
  
      // Store the JWT token in localStorage
      localStorage.setItem("token", res.data.token);  // Assuming `res.data.token` contains the JWT
  
      await fetchUserProfile(res.data.uid);
      
      setUser(res.data.uid);
      localStorage.setItem("uid", res.data.uid);
      navigate("/game");
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  
  const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
        console.log("Attempting email login with email:", email);
        const res = await axios.post(`${baseURL}/api/auth/login`, { email, password });
        console.log("Email login success, profile data:", res.data);
        
        // Store the JWT token
        localStorage.setItem("token", res.data.token);
        
        // Set user profile using the correct response structure
        setProfile({
            firstName: res.data.user.firstName,
            lastName: res.data.user.lastName,
            email: res.data.user.email,
            role: res.data.user.role,
            uid: res.data.uid
        });
        
        setUser(res.data.uid);
        localStorage.setItem('uid', res.data.uid);
        navigate('/game');
    } catch (error: any) {
        console.error('Email login failed', error);
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};
  

  const initiateDeleteAccount = async (password: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!user) throw new Error('No user logged in');
      console.log("Initiating account deletion for UID:", user);
      const res = await axios.post(`${baseURL}/account/delete-account-initiate`, {
        uid: user,
        password
      }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
      
      console.log("Account deletion initiation response:", res.data);
      return { success: true, message: res.data.message || 'Please check your email for the confirmation token' };
    } catch (error: any) {
      console.error('Failed to initiate account deletion', error);
      throw new Error(error.response?.data?.message || 'Failed to initiate account deletion');
    }
  };

  const confirmDeleteAccount = async (token: string): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');
      console.log("Confirming account deletion for UID:", user, "with token:", token);
      const res = await axios.post(`${baseURL}/account/verify-delete`, {
        uid: user,
        otp: token.trim()
      }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
      
      if (res.data && (res.data.success || res.data.message.includes('successfully'))) {
        console.log("Account deletion confirmed:", res.data);
        setUser(null);
        setProfile(null);
        localStorage.removeItem("uid");
        
        try {
          googleLogout();
        } catch (error) {
          console.log('Google logout not applicable or failed');
        }
        
        navigate("/");
      } else {
        throw new Error(res.data.message || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Delete account error:', error.response || error);
      
      if (error.response?.status === 404) {
        setUser(null);
        setProfile(null);
        localStorage.removeItem("uid");
        navigate("/");
        return;
      }
      
      throw new Error(error.response?.data?.message || 'Failed to confirm account deletion');
    }
  };

  const initiatePasswordReset = async (password: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!user || !profile) {
        navigate('/login');
        throw new Error('Please login first to reset your password');
      }

      console.log("Initiating password reset for UID:", user);
      const res = await axios.post(
        `${baseURL}/account/password-reset-request`,
        {
          uid: user,
          email: profile.email,
          password
        },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log("Password reset initiation response:", res.data);
      return { success: true, message: res.data.message || 'Please check your email for the confirmation token' };
    } catch (error: any) {
      console.error('Failed to initiate password reset', error);
      throw new Error(error.response?.data?.message || 'Failed to initiate password reset');
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string): Promise<void> => {
    try {
      if (!user || !profile) {
        navigate('/login');
        throw new Error('Please login first to reset your password');
      }

      console.log("Confirming password reset for UID:", user, "with token:", token);
      const res = await axios.post(
        `${baseURL}/account/password-reset-confirm`,
        {
          uid: user,
          email: profile.email,
          otp: token.trim(),
          newPassword
        },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (res.data && (res.data.success || res.data.message.includes('successfully'))) {
        console.log("Password reset confirmed:", res.data);
        logout();
      } else {
        throw new Error(res.data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Password reset error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to confirm password reset');
    }
  };

  const logout = () => {
    console.log("Logging out user:", user);
    setUser(null);
    setProfile(null);
    localStorage.removeItem("uid");

    try {
      googleLogout();
    } catch (error) {
      console.log("Google logout not applicable or failed");
    }

    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loginWithGoogle, 
      loginWithEmailAndPassword,
      initiateDeleteAccount,
      confirmDeleteAccount,
      initiatePasswordReset,
      confirmPasswordReset,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
