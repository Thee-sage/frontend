import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import { Label } from '../compo/ui/label';
import { cn } from '../compo/lib/utils';
import { Input } from '../compo/ui/input';
import GoogleLoginComponent  from '../auth/google/googlelogin';
import { useAuth } from "../contexts/authcontext";
import ForgotPassword from '../forgotpassword';
import { baseURL } from '../utils';
import styles from './page.module.css';
import logo from "../assets/logo.svg";

const AuthContainer = () => {
  const location = useLocation();
  const isLoginRoute = location.pathname === '/auth/login';

  return (
    <div className={styles.pageContainer}>
      {/* Background overlay */}
      <div className={styles.backgroundOverlay} />
      
      {/* Main content */}
      <div className={styles.contentContainer}>
        <div className={styles.formContainer}>
          {/* Logo */}
          <div className={styles.logo}>
            <img src={logo} alt="Logo" className="h-12 w-auto mb-8" />
          </div>

          {/* Header */}
          <h2 className="font-bold text-2xl text-white mb-2">
            {isLoginRoute ? 'Welcome back' : 'Join us'}
          </h2>
          <p className="text-neutral-400 text-sm mb-8">
            {isLoginRoute 
              ? "Sign in to your account to continue"
              : "Create an account to get started"
            }
          </p>

          {/* Auth Forms */}
          <Routes>
            <Route path="login" element={<LoginForm />} />
            <Route path="signup" element={<SignupForm />} />
          </Routes>

          {/* Divider */}
          <div className={styles.divider}>
            <span className="text-neutral-500 text-sm px-4 bg-[#0d0d15]">
              or continue with
            </span>
          </div>

          {/* Google Login */}
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <div className={styles.gg}>
                <GoogleLoginComponent />
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <p className="text-neutral-400 text-sm mt-6 text-center">
            {isLoginRoute ? "Don't have an account?" : 'Already have an account?'}
            <Link 
              to={isLoginRoute ? '/auth/signup' : '/auth/login'} 
              className="ml-1 text-purple-400 hover:text-purple-300 font-medium"
            >
              {isLoginRoute ? 'Sign Up' : 'Login'}
            </Link>
          </p>
          {isLoginRoute && <ForgotPassword />}
        </div>
      </div>
    </div>
  );
};

const LoginForm = () => {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
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
      await loginWithEmailAndPassword(loginEmail, loginPassword);
      setLoginSuccess('Login successful! Redirecting...');
      setLoginError('');
      navigate('/game');
    } catch (error: any) {
      setLoginError(error.message || 'Invalid login credentials');
    }
  };

  return (
    <form className="space-y-4" onSubmit={step === 'email' ? handleLoginEmailSubmit : handleSubmit}>
      {step === 'email' ? (
        <LabelInputContainer>
          <Label htmlFor="email" className="text-neutral-200">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            className={styles.input}
          />
        </LabelInputContainer>
      ) : (
        <LabelInputContainer>
          <Label htmlFor="password" className="text-neutral-200">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            className={styles.input}
          />
        </LabelInputContainer>
      )}

      <button
        className={cn(
          "w-full h-12 rounded-lg font-medium text-white",
          "bg-gradient-to-r from-purple-600 to-purple-400",
          "hover:from-purple-500 hover:to-purple-300",
          "transition-all duration-200",
          styles.submitButton
        )}
        type="submit"
      >
        {step === 'email' ? 'Continue' : 'Login'} →
        <BottomGradient />
      </button>

      {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
      {loginSuccess && <p className="text-green-400 text-sm">{loginSuccess}</p>}
    </form>
  );
};

const SignupForm = () => {
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
        setSignupSuccess('Sign-up successful! Please check your email.');
        setSignupError('');
        setSignupFirstName('');
        setSignupLastName('');
        setSignupEmail('');
        setSignupPassword('');
        setTimeout(() => navigate('/auth/login'), 2000);
      } else {
        const data = await response.json();
        setSignupError(data.message || 'Sign-up failed. Please try again.');
      }
    } catch (err: any) {
      setSignupError(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LabelInputContainer>
          <Label htmlFor="firstname" className="text-neutral-200">First name</Label>
          <Input
            id="firstname"
            type="text"
            placeholder="John"
            value={signupFirstName}
            onChange={(e) => setSignupFirstName(e.target.value)}
            required
            className={styles.input}
          />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="lastname" className="text-neutral-200">Last name</Label>
          <Input
            id="lastname"
            type="text"
            placeholder="Doe"
            value={signupLastName}
            onChange={(e) => setSignupLastName(e.target.value)}
            required
            className={styles.input}
          />
        </LabelInputContainer>
      </div>

      <LabelInputContainer>
        <Label htmlFor="email" className="text-neutral-200">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          required
          className={styles.input}
        />
      </LabelInputContainer>

      <LabelInputContainer>
        <Label htmlFor="password" className="text-neutral-200">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          required
          className={styles.input}
        />
      </LabelInputContainer>

      <button
        className={cn(
          "w-full h-12 rounded-lg font-medium text-white",
          "bg-gradient-to-r from-purple-600 to-purple-400",
          "hover:from-purple-500 hover:to-purple-300",
          "transition-all duration-200",
          styles.submitButton
        )}
        type="submit"
      >
        Sign up →
        <BottomGradient />
      </button>

      {signupError && <p className="text-red-400 text-sm">{signupError}</p>}
      {signupSuccess && <p className="text-green-400 text-sm">{signupSuccess}</p>}
    </form>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className={cn(
        "absolute inset-x-0 -bottom-px h-px w-full",
        "bg-gradient-to-r from-transparent via-purple-400 to-transparent",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        styles.bottomGradient
      )} />
      <span className={cn(
        "absolute inset-x-10 -bottom-px h-px w-1/2 mx-auto",
        "bg-gradient-to-r from-transparent via-purple-300 to-transparent",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm",
        styles.bottomGradientBlur
      )} />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default AuthContainer;