import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { GoogleLoginComponent } from '../auth/google/googlelogin';
import { useAuth } from "../contexts/authcontext"; // Adjust path if necessary
import ForgotPassword from '../forgotpassword';
import { baseURL } from '../utils';

const LoginPage = () => {
    const [formType, setFormType] = useState<'login' | 'signup'>('login');
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupFirstName, setSignupFirstName] = useState('');
    const [signupLastName, setSignupLastName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginSuccess, setLoginSuccess] = useState('');
    const [signupError, setSignupError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState('');
    const navigate = useNavigate();
    const { loginWithEmailAndPassword } = useAuth();



    const handleLoginEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginEmail) {
            setStep('password');
            setLoginError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginWithEmailAndPassword(loginEmail, loginPassword); // Use loginWithEmailAndPassword from AuthProvider
            setLoginSuccess('Login successful! Redirecting to your account...');
            setLoginError('');
            navigate('/game');
        } catch (error: any) {
            setLoginError(error.message || 'Invalid login credentials. Please try again.');
        }
    };

    const handleSSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${baseURL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: signupFirstName,
                    lastName: signupLastName,
                    email: signupEmail,
                    password: signupPassword
                }),
            });
            if (response.ok) {
                setSignupSuccess('Sign-up successful! Please check your email to verify your account.');
                setSignupError('');
                setSignupFirstName('');
                setSignupLastName('');
                setSignupEmail('');
                setSignupPassword('');
            } else {
                const data = await response.json();
                setSignupError(data.message || 'Sign-up failed. Please try a different email.');
            }
        } catch (err: any) {
            setSignupError(err.message || 'An error occurred during sign-up. Please try again later.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                {formType === 'login' ? 'Welcome back' : 'Sign Up'}
            </h2>

            {formType === 'login' ? (
                <form onSubmit={step === 'email' ? handleLoginEmailSubmit : handleSubmit}>
                    {step === 'email' ? (
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="email"
                                placeholder="Email address or phone number*"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        {step === 'email' ? 'Continue' : 'Login'}
                    </button>
                    {loginError && <p style={{ color: 'red', marginTop: '10px' }}>{loginError}</p>}
                    {loginSuccess && <p style={{ color: 'green', marginTop: '10px' }}>{loginSuccess}</p>}
                </form>
            ) : (
                <form onSubmit={handleSSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={signupFirstName}
                            onChange={(e) => setSignupFirstName(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={signupLastName}
                            onChange={(e) => setSignupLastName(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Sign Up
                    </button>
                    {signupError && <p style={{ color: 'red', marginTop: '10px' }}>{signupError}</p>}
                    {signupSuccess && <p style={{ color: 'green', marginTop: '10px' }}>{signupSuccess}</p>}
                </form>
            )}

            <p style={{ margin: '20px 0', color: '#666' }}>
                {formType === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button onClick={() => setFormType(formType === 'login' ? 'signup' : 'login')} style={{ marginLeft: '5px', cursor: 'pointer', color: '#007bff' }}>
                    {formType === 'login' ? 'Sign Up' : 'Login'}
                </button>
            </p>
            {formType === 'login' && <ForgotPassword />} 
            <GoogleLoginComponent />
        </div>
    );
};

export default LoginPage;
