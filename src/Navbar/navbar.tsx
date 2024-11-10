import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import logo from "../assets/logo.svg";
import { baseURL } from "../utils";
import AccountManagement from "../abc";
import { useWallet } from "../contexts/Walletcontext";
import { useAuth } from "../contexts/authcontext";
import styles from "./page.module.css";

// Configure Socket.IO with proper options
const socket = io(baseURL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: false // Prevent automatic connection
});

const Navbar: React.FC = () => {
    const { remainingZixos } = useWallet();
    const { user, logout } = useAuth();
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [requestAmount, setRequestAmount] = useState<number>(0);
    const [requestMessage, setRequestMessage] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isRequestOpen, setIsRequestOpen] = useState<boolean>(false);
    const [isInitialFetchDone, setIsInitialFetchDone] = useState<boolean>(false);

    // Handle socket connection
    useEffect(() => {
        // Connect socket when component mounts
        if (!socket.connected) {
            socket.connect();
        }

        // Socket error handling
        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        // Cleanup on component unmount
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
                withCredentials: true // Add this for CORS
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
    }, [isInitialFetchDone, remainingZixos]);

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

    const handleRequestMoney = async () => {
        try {
            if (!user) return;

            const response = await axios.post(`${baseURL}/wallet/request`, {
                uid: user,
                requestedAmount: requestAmount,
            }, {
                withCredentials: true // Add this for CORS
            });

            setRequestMessage(response.data.message);
            setTimeout(() => fetchWalletBalance(), 1000);
        } catch (error) {
            const axiosError = error as any;
            setRequestMessage(axiosError.response?.data?.error || "An error occurred");
        }
    };

  const toggleMenu = () => setIsExpanded((prev) => !prev);

  const renderRequestForm = () => (
    <div className={`${styles.requestForm} ${isRequestOpen ? styles.show : ""}`}>
      <h4>Request More Zixos</h4>
      <input
        type="number"
        value={requestAmount}
        onChange={(e) => setRequestAmount(Number(e.target.value))}
        placeholder="Enter amount"
        className="p-2 rounded border"
      />
      <button onClick={handleRequestMoney} className="mt-2 p-2 bg-blue-500 text-white rounded">
        Submit Request
      </button>
      {requestMessage && <p className="mt-2">{requestMessage}</p>}
      <button onClick={() => setIsRequestOpen(false)} className="mt-4 text-red-500">
        Close
      </button>
    </div>
  );

  const renderBurgerMenu = () => (
    <div className={styles.menu}>
      <motion.button
        className={styles.buttonOne}
        aria-controls="primary-navigation"
        aria-expanded={isExpanded}
        onClick={toggleMenu}
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
            width="50"
            height="10"
            x="10"
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
          className={styles.burgerMenuContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "400px", padding: "16px" }}>
            {!user ? (
              <>
                <Link to="/complete" className="text-neutral-700 dark:text-neutral-200 hover:text-black transition-colors duration-300">
                  Sign In
                </Link>
                <Link to="/signup" className="text-neutral-700 dark:text-neutral-200 hover:text-black transition-colors duration-300">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <AccountManagement/>
                <button onClick={logout} className="mt-2 p-2 bg-red-500 text-white rounded">
                  Log Out
                </button>
              </>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.nav className={styles.mainclass}>
      <img src={logo} alt="Logo" width={40} height={40} className={styles.logo} />
      <p>Remaining Zixos: {walletBalance !== null ? walletBalance : "Loading..."}</p>
      <button onClick={() => setIsRequestOpen(true)} className={`${styles.requestButton} text-neutral-700 dark:text-neutral-200 hover:text-black transition-colors duration-300`}>
        Request Zixos
      </button>

      <div className={styles.mand}>
        {renderBurgerMenu()}
        {renderBurgerMenuContent()}
        {isRequestOpen && renderRequestForm()}
      </div>
    </motion.nav>
  );
};

export default Navbar;
