import { useState } from 'react';
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/authcontext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import styles from './page.module.css';
import GoogleLogoWhite from './GoogleLogoWhite';
import GoogleLogoColored from './GoogleLogoColored';

const GoogleSignIn = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/game");
    }
  }, [user, navigate]);

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      loginWithGoogle(credentialResponse.credential);
    }
  };

  return (
    <div className={styles.buttonContainer}>
      <div className={styles.wrapper}>
        <div className={styles.googleButtonWrapper}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            width={220}
            onError={() => console.log("Login Failed")}
            useOneTap={false}
            text="signin_with"
            shape="rectangular"
            theme="filled_black"
          />
        </div>
        <button 
          className={styles.customButton}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={styles.textContent}>
            {isHovered ? <GoogleLogoWhite /> : <GoogleLogoColored />}
            <span className={styles.buttonText}>Sign in with Google</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default GoogleSignIn;