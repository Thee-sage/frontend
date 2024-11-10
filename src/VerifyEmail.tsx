
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const email = params.get('email');

        // Make the API call to verify the email
        const verifyEmail = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/verify-email?token=${token}&email=${email}`);
                const data = await response.json();

                if (response.ok) {
                    setMessage('Email verified successfully! You can now log in.');
                    setTimeout(() => navigate('/login'), 3000); // Redirect to login page after 3 seconds
                } else {
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (err) {
                setMessage('An error occurred during verification.');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [location.search, navigate]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>Verify Email</h2>
            <p>{message}</p>
        </div>
    );
};

export default VerifyEmail;
