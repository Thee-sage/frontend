import { useState } from 'react';

const ForgotPassword = () => {
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
            const response = await fetch('http://localhost:3001/account/password-reset-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage(data.message);
                setShowTokenInput(true);
            } else {
                throw new Error(data.message);
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
            const response = await fetch('http://localhost:3001/account/password-reset-confirm', {
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
                // Reset all fields
                setEmail('');
                setToken('');
                setNewPassword('');
                setShowTokenInput(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 p-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Forgot Password?</h3>
            
            {!showTokenInput ? (
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
            )}

            {message && (
                <div className={`mt-4 p-3 rounded ${
                    message.includes('successful') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;