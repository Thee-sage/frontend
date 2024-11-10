import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/authcontext';

const AccountManagement: React.FC = () => {
    const {  user,profile, initiateDeleteAccount, confirmDeleteAccount, initiatePasswordReset, confirmPasswordReset } = useAuth();
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [action, setAction] = useState<'delete' | 'reset'>('delete');
    const [isiLoading, setIsiLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
      const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good Morning';
        if (hour >= 12 && hour < 17) return 'Good Afternoon';
        if (hour >= 17 && hour < 22) return 'Good Evening';
        return 'Good Night';
      };
      setIsiLoading(false);
      setGreeting(getGreeting());
    }, [profile]);
    if (!profile) return <p>Loading...</p>;
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
                setShowTokenInput(true);
                setPassword('');
            }
        } catch (error: any) {
            setMessage(error.message);
            setShowTokenInput(false);
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
                setShowTokenInput(true);
                setCurrentPassword('');
            }
        } catch (error: any) {
            setMessage(error.message);
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
            await confirmPasswordReset(token, newPassword);
            setMessage('Password reset successful. You will be logged out...');
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
                {action === 'delete' ? 'Delete Account' : 'Reset Password'}
            </h2>

            
    {greeting}
    {!isiLoading && profile && (
  <p className="text-lg mb-4">
    {profile.firstName}, {profile.lastName}!
  </p>
)}

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setAction('delete')}
                    className={`p-2 ${action === 'delete' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                >
                    Delete Account
                </button>
                <button
                    onClick={() => setAction('reset')}
                    className={`p-2 ${action === 'reset' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                >
                    Reset Password
                </button>
            </div>

            {action === 'delete' ? (
                !showTokenInput ? (
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleInitiateDelete}
                            disabled={isLoading}
                            className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
                        >
                            {isLoading ? 'Processing...' : 'Delete Account'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            A confirmation token has been sent to your email. Please enter it below to confirm account deletion.
                        </p>
                        <input
                            type="text"
                            placeholder="Enter confirmation token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isLoading}
                            className="w-full p-2 bg-red-800 text-white rounded hover:bg-red-900 disabled:bg-red-300"
                        >
                            {isLoading ? 'Processing...' : 'Confirm Deletion'}
                        </button>
                    </div>
                )
            ) : (
                !showTokenInput ? (
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter your current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleInitiateReset}
                            disabled={isLoading}
                            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isLoading ? 'Processing...' : 'Reset Password'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            A confirmation token has been sent to your email. Please enter it below along with your new password.
                        </p>
                        <input
                            type="text"
                            placeholder="Enter confirmation token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleConfirmReset}
                            disabled={isLoading}
                            className="w-full p-2 bg-blue-800 text-white rounded hover:bg-blue-900 disabled:bg-blue-300"
                        >
                            {isLoading ? 'Processing...' : 'Confirm Password Reset'}
                        </button>
                    </div>
                )
            )}

            {message && (
                <div className={`mt-4 p-3 rounded ${
                    message.includes('success') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default AccountManagement;
