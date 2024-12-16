import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authcontext';
import styles from "./AccountMangement.module.css"

const AccountManagement: React.FC = () => {
    const { profile, initiateDeleteAccount, confirmDeleteAccount, initiatePasswordReset, confirmPasswordReset,logout } = useAuth();
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteTokenInput, setShowDeleteTokenInput] = useState(false);
    const [showResetTokenInput, setShowResetTokenInput] = useState(false);
    const [action, setAction] = useState<'delete' | 'reset'>('delete');
    const [isiLoading, setIsiLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return 'Good Morning';
            if (hour >= 12 && hour < 17) return 'Good Afternoon';
            if (hour >= 17 && hour < 22) return 'Good Evening';
            return 'Happy Late Night';
        };
        setIsiLoading(false);
        setGreeting(getGreeting());
    }, [profile]);

    if (!profile) return <p>Loading...</p>;

    const handleActionChange = (newAction: 'delete' | 'reset') => {
        setAction(newAction);
        setToken('');
        setMessage('');
        setShowDeleteTokenInput(false);
        setShowResetTokenInput(false);
        setPassword('');
        setCurrentPassword('');
        setNewPassword('');
    };

    const handleInitiateDelete = async () => {
        if (!password) {
            setMessage('Please enter your password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await initiateDeleteAccount(password);
            if (response.success) {
                setMessage(response.message);
                setShowDeleteTokenInput(true);
                setPassword('');
            }
        } catch (error: any) {
            setMessage(error.message);
            setShowDeleteTokenInput(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!token) {
            setMessage('Please enter the confirmation token');
            return;
        }

        setIsLoading(true);
        try {
            await confirmDeleteAccount(token);
            setMessage('Account deleted successfully. Redirecting...');
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitiateReset = async () => {
        if (!currentPassword) {
            setMessage('Please enter your current password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await initiatePasswordReset(currentPassword);
            if (response.success) {
                setMessage(response.message);
                setShowResetTokenInput(true);
                setCurrentPassword('');
            }
        } catch (error: any) {
            setMessage(error.message);
            setShowResetTokenInput(false);
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
            await confirmPasswordReset(token, newPassword);
            setMessage('Password reset successful. You will be logged out...');
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.headerSection}>
                    {!isiLoading && profile && (
                        <>
                            <div className={styles.greetingWrapper}>
                                <h3 className={styles.greeting}>{greeting}</h3>
                                <p className={styles.name}>
                                    {profile.firstName} {profile.lastName},
                                </p>
                            </div>
                            <div className={styles.divider} />
                        </>
                    )}
                    <h2 className={styles.heading}>
                        {action === 'delete' ? 'Delete Account' : 'Reset Password'}
                    </h2>
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        onClick={() => handleActionChange('delete')}
                        className={`${styles.actionButton} ${action === 'delete' ? styles.buttonActive : styles.buttonInactive}`}
                    >
                        Delete Account
                    </button>
                    <button
                        onClick={() => handleActionChange('reset')}
                        className={`${styles.actionButton} ${action === 'reset' ? styles.buttonActive : styles.buttonInactive}`}
                    >
                        Reset Password
                    </button>
                </div>

                <div className={styles.contentSection}>
                    {action === 'delete' ? (
                        !showDeleteTokenInput ? (
                            <div className={styles.formGroup}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Enter your password to continue</label>
                                    <input
                                        type="password"
                                        placeholder="Current password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={styles.input}
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={handleInitiateDelete}
                                    disabled={isLoading}
                                    className={styles.deleteButton}
                                >
                                    {isLoading ? 'Processing...' : 'Delete Account'}
                                </button>
                            </div>
                        ) : (
                            <div className={styles.formGroup}>
                                <div className={styles.securityNotice}>
                                    <p className={styles.helperText}>
                                        A confirmation token has been sent to your email. Please enter it below to confirm account deletion.
                                    </p>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Confirmation Token</label>
                                    <input
                                        type="text"
                                        placeholder="Enter token"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className={styles.input}
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isLoading}
                                    className={styles.confirmDeleteButton}
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Deletion'}
                                </button>
                            </div>
                        )
                    ) : (
                        !showResetTokenInput ? (
                            <div className={styles.formGroup}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
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
                            </div>
                        ) : (
                            <div className={styles.formGroup}>
                                <div className={styles.securityNotice}>
                                    <p className={styles.helperText}>
                                        A confirmation token has been sent to your email. Please enter both the token and your new password.
                                    </p>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Confirmation Token</label>
                                    <input
                                        type="text"
                                        placeholder="Enter token"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className={styles.input}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={styles.input}
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={handleConfirmReset}
                                    disabled={isLoading}
                                    className={styles.confirmResetButton}
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Password Reset'}
                                </button>
                            </div>
                        )
                    )}
                </div>

                {message && (
    <div className={`${styles.messageContainer} ${
        message.includes('success') 
            ? styles.successMessage 
            : message.includes('sent') || message.includes('token')
                ? styles.infoMessage
                : styles.errorMessage
    }`}>
        {message}
    </div>
)}
                  <button onClick={logout} className={styles.logoutButton}>
                                    Log Out
                                </button>
            </div>
        </div>
    );
};

export default AccountManagement;