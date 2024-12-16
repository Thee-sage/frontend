import { useState } from 'react';
import { baseURL } from './utils';
import styles from './forgotPassword.module.css';

const ForgotPassword = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTokenInput, setShowTokenInput] = useState(false);

    const handleInitiateReset = async () => {
        if (!email) {
            setMessage('Please enter your email');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${baseURL}/account/password-reset-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('OTP sent to your email for password reset.');
                setShowTokenInput(true);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'An error occurred');
            setShowTokenInput(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmReset = async () => {
        if (!token || !newPassword) {
            setMessage('Please enter both the confirmation token and new password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${baseURL}/account/password-reset-confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp: token.trim(),
                    newPassword
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Password reset successful. Please login with your new password.');
                setEmail('');
                setToken('');
                setNewPassword('');
                setShowTokenInput(false);
                setIsOpen(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const getMessageType = (msg: string) => {
        if (msg.includes('OTP sent')) return 'infoMessage';
        if (msg.includes('successful')) return 'successMessage';
        return 'errorMessage';
    };
    if (!isOpen) {
        return (
            <div className={styles.forgotButtonWrapper}>
                <button 
                    onClick={() => setIsOpen(true)}
                    className={styles.forgotButton}
                >
                    Forgot Password?
                </button>
            </div>
        );
    }

    return (
        <div className={styles.forgotContainer}>
            <h3 className={styles.formTitle}>Forgot Password</h3>

            {!showTokenInput ? (
                <>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Your Email Address</label>
                        <input
                            type="email"
                            placeholder="abc@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleInitiateReset}
                        disabled={isLoading}
                        className={styles.resetButton}
                    >
                        {isLoading ? 'Processing...' : 'Reset Password'}
                    </button>
                </>
            ) : (
                <>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Confirmation Token</label>
                        <input
                            type="text"
                            placeholder="Enter the token sent to your email"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className={styles.input}
                            disabled={isLoading}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>New Password</label>
                        <input
                            type="password"
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles.input}
                            disabled={isLoading}
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button
                            onClick={handleConfirmReset}
                            disabled={isLoading}
                            className={styles.resetButton}
                        >
                            {isLoading ? 'Processing...' : 'Confirm Reset'}
                        </button>
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                setShowTokenInput(false);
                                setMessage('');
                                setEmail('');
                                setToken('');
                                setNewPassword('');
                            }}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}

            {message && (
                <div className={`${styles.message} ${styles[getMessageType(message)]}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;