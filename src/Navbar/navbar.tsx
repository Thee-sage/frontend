import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import logo from "../assets/logo.svg";
import { baseURL } from "../utils";
import AccountManagement from "../accountmangement/accountmangement";
import { useWallet } from "../contexts/Walletcontext";
import { useAuth } from "../contexts/authcontext";
import styles from "./page.module.css";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from "../contexts/ThemeContext";

const socket = io(baseURL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: false
});

const Navbar: React.FC = () => {
  const location = useLocation();
  const requestFormRef = useRef<HTMLDivElement>(null);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isDemo = ['/demo', '/', '/auth/login', '/auth/signup', '/casinos'].includes(location.pathname) || 
               location.pathname.startsWith('/auth/');
  const { remainingZixos } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [requestAmount, setRequestAmount] = useState<number>(0);
  const [requestMessage, setRequestMessage] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRequestOpen, setIsRequestOpen] = useState<boolean>(false);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if the click was on a button that toggles menus
      if ((event.target as HTMLElement).closest('button[data-toggle]')) {
        return;
      }

      // Check if click is outside request form
      if (requestFormRef.current && !requestFormRef.current.contains(event.target as Node)) {
        setIsRequestOpen(false);
      }
      
      // Check if click is outside burger menu and menu button
      if (
        burgerMenuRef.current && 
        menuButtonRef.current &&
        !burgerMenuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.off("connect_error");
      socket.off("error");
      socket.off("walletRequestApproved");
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  const fetchWalletBalance = async () => {
    if (!user) return;

    try {
      const response = await axios.get(`${baseURL}/user-wallet`, {
        params: { uid: user, t: new Date().getTime() },
        withCredentials: true
      });
      setWalletBalance(response.data.balance);
      setIsInitialFetchDone(true);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  useEffect(() => {
    if (!isInitialFetchDone && user) {
      fetchWalletBalance();
    }
  }, [isInitialFetchDone, user]);

  useEffect(() => {
    if (isInitialFetchDone && remainingZixos !== null && walletBalance !== remainingZixos) {
      setWalletBalance(remainingZixos);
    }
  }, [isInitialFetchDone, remainingZixos, walletBalance]);

  useEffect(() => {
    const handleWalletRequestApproved = (data: { uid: string }) => {
      if (data.uid === user) {
        fetchWalletBalance();
        setRequestMessage("Your request was approved!");
      }
    };

    socket.on("walletRequestApproved", handleWalletRequestApproved);

    return () => {
      socket.off("walletRequestApproved", handleWalletRequestApproved);
    };
  }, [user]);

  const handleRequestMoney = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!user) return;

      const response = await axios.post(`${baseURL}/wallet/request`, {
        uid: user,
        requestedAmount: requestAmount,
      }, {
        withCredentials: true
      });

      setRequestMessage(response.data.message);
      setTimeout(() => fetchWalletBalance(), 1000);
    } catch (error) {
      const axiosError = error as any;
      setRequestMessage(axiosError.response?.data?.error || "An error occurred");
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  const handleRequestButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRequestOpen(true);
  };

  const handleCloseRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRequestOpen(false);
    setRequestMessage("");
    setRequestAmount(0);
  };

  const renderRequestForm = () => {
    if (!user) {
      return (
        <div ref={requestFormRef} className={`${styles.requestForm} ${isRequestOpen ? styles.show : ""}`}>
          <div className={styles.loginRequired}>
            <h4 className={styles.formTitle}>Login Required</h4>
            <p className={styles.loginMessage}>
              Please login or create an account to request Zixos and access all game features.
            </p>
            <div className={styles.loginButtons}>
              <Link to="/auth/login" className={styles.loginButton}>
                Login
              </Link>
              <Link to="/auth/signup" className={styles.signupButton}>
                Sign Up
              </Link>
            </div>
            <button 
              onClick={handleCloseRequest}
              className={styles.closeButton}
              data-toggle="request"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    if (requestMessage) {
      return (
        <div ref={requestFormRef} className={`${styles.requestForm} ${isRequestOpen ? styles.show : ""}`}>
          <h4 className={styles.formTitle}>Request Status</h4>
          <p className={styles.message}>{requestMessage}</p>
          <button 
            onClick={handleCloseRequest}
            className={styles.closeButton}
            data-toggle="request"
          >
            Close
          </button>
        </div>
      );
    }
  
    return (
      <div ref={requestFormRef} className={`${styles.requestForm} ${isRequestOpen ? styles.show : ""}`}>
        <h4 className={styles.formTitle}>Request More Zixos</h4>
        <input
          type="number"
          value={requestAmount}
          onChange={(e) => setRequestAmount(Number(e.target.value))}
          placeholder="Enter amount"
          className={styles.formInput}
          min="1"
        />
        <button 
          onClick={handleRequestMoney}
          className={styles.submitButton}
          data-toggle="request"
        >
          Submit Request
        </button>
        <button 
          onClick={handleCloseRequest}
          className={styles.closeButton}
          data-toggle="request"
        >
          Close
        </button>
      </div>
    );
  };

  const renderRequestButton = () => (
    <div className={styles.requestContainer}>
      <button 
        onClick={handleRequestButtonClick}
        className={styles.requestButton}
        disabled={isDemo}
        data-toggle="request"
      >
        {!user ? 'Login to Request Zixos' : 'Request Zixos'}
      </button>
    </div>
  );

  const renderBurgerMenu = () => (
    <div className={styles.menu}>
      <motion.button
        ref={menuButtonRef}
        className={styles.buttonOne}
        aria-controls="primary-navigation"
        aria-expanded={isExpanded}
        onClick={toggleMenu}
        data-toggle="menu"
        initial={false}
      >
        <motion.svg
          className={styles.hamburger}
          viewBox="0 0 100 100"
          width="50"
          height="50"
          initial={false}
          animate={{
            rotate: isExpanded ? 180 : 0,
            transition: { duration: 0.7 }
          }}
        >
          <motion.rect
            className={`${styles.line} ${styles.top}`}
            width="80"
            height="10"
            x={isExpanded ? -5 : 10}
            y={isExpanded ? 30 : 25}
            rx="5"
          />
          <motion.rect
            className={`${styles.line} ${styles.middle}`}
            width="80"
            height="10"
            x="40"
            y="45"
            rx="5"
          />
          <motion.rect
            className={`${styles.line} ${styles.bottom}`}
            width="80"
            height="10"
            x={isExpanded ? -1.8 : 10}
            y={isExpanded ? 60 : 65}
            rx="5"
          />
        </motion.svg>
      </motion.button>
    </div>
  );

  const renderBurgerMenuContent = () => {
    if (isExpanded) {
      return (
        <motion.div
          ref={burgerMenuRef}
          className={`${styles.burgerMenuContent2} ${
            !user ? styles.burgerMenuContent : styles.burgerMenuContent1
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          <div>
            {!user ? (
              <div className={styles.signn}>
                <Link to="/auth/login" className={styles.menuLink}>
                  Sign In
                </Link>
                <Link to="/auth/signup" className={styles.menuLink}>
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className={styles.accountManagementWrapper}>
                <AccountManagement />
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.nav className={styles.mainclass}>
      <a href="https://plinkochallenge.com" target="_blank" rel="noopener noreferrer" >
  <img src={logo} alt="Logo" className={styles.logo} />
</a>
      
      <div className={styles.wallet}>
        <p className={styles.balance}>
          Remaining Zixos: {walletBalance !== null ? Number(walletBalance).toFixed(2) : "Loading..."}
        </p>
        {renderRequestButton()}
      </div>

      <div className={styles.but}>
        <div className={styles.but1}>
          <button 
            onClick={toggleTheme} 
            className={styles.themeToggle} 
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className={styles.mand}>
            {renderBurgerMenu()}
            {renderBurgerMenuContent()}
            {isRequestOpen && renderRequestForm()}
          </div>
        </div>
      </div>
      
      <div 
        className={`${styles.backdrop} ${isRequestOpen ? styles.show : ''}`} 
        onClick={() => setIsRequestOpen(false)} 
      />
    </motion.nav>
  );
};

export default Navbar;