import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GamePage } from "./pages/Gamepage/Gamepage";
import VerifyEmail from './VerifyEmail';
import AdminPanel from './admin/admin';
import PlinkoLandingPage from "./pages/mainpage/mainpage";
import Loginpage from "./smallpages/completesignuppage";
import Layout from './Navbar/layout';
import AdminUpgradeForm from "./adminupgrade/adminupgrade";
import { WalletProvider } from "./contexts/Walletcontext";
import { AuthProvider } from "./contexts/authcontext";
import Abc from "./accountmangement/accountmangement";
import AuthContainer from "./smallpages/completesignuppage";
import { useEffect, useState, ReactNode } from 'react';
import { AdminAuthProvider } from "./contexts/admincontext";
import { ThemeProvider } from './contexts/ThemeContext';
import { PublicCasinoList, PublicCasinoDetail } from "./pages/casinolist/allcasinopage";
import { loadNunito } from './fonts';
import { PrivacyPolicy } from "./pages/policy/policy";
import { Footer } from "./Footer/Footer";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const location = useLocation();
  const shouldShowFooter = ['/game', '/casinos', '/', '/privacy-policy'].includes(location.pathname) || 
                        location.pathname.startsWith('/casinos/');

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {children}
      </div>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isMobile, setIsMobile] = useState(false);
  const currentPath = window.location.pathname;
  const isAdminRoute = currentPath.startsWith('/admin') || currentPath.startsWith('/adminlogin');

  useEffect(() => {
    loadNunito();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1400);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Missing Google Client ID in environment variables');
  }

  if (isMobile && !isAdminRoute) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0f1729] to-[#1a0f2e] p-4">
         <div className="relative w-full max-w-md">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative backdrop-blur-lg bg-white bg-opacity-5 border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-center text-white mb-4 text-shadow">
              Desktop Experience Required
            </h1>

            <p className="text-gray-300 text-center mb-6">
              The Plinko Challenge is optimized for desktop gameplay. For the best experience, please:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white bg-opacity-5 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-2">Option 1: Use Desktop</h3>
                <p className="text-gray-300 text-sm">Visit us on your computer for the optimal gaming experience.</p>
              </div>

              <div className="bg-white bg-opacity-5 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-2">Option 2: Desktop Mode</h3>
                <p className="text-gray-300 text-sm">Enable "Desktop site" in your mobile browser's menu to play now.</p>
              </div>
            </div>

            <div className="text-xs text-gray-400 text-center">
              <p className="mb-2">To enable desktop mode:</p>
              <p>Chrome: ⋮ Menu → Desktop site</p>
              <p>Safari: ᐧᐧᐧ Menu → Request Desktop Site</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-nunito">
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <WalletProvider>
                <AdminAuthProvider>
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<PageWrapper><PlinkoLandingPage /></PageWrapper>} />
                      <Route path="/game" element={<PageWrapper><GamePage /></PageWrapper>} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/complete" element={<Loginpage />} />
                      <Route path="/abc/*" element={<Abc />} />
                      <Route path="/casinos" element={<PageWrapper><PublicCasinoList /></PageWrapper>} />
                      <Route path="/casinos/:id" element={<PageWrapper><PublicCasinoDetail /></PageWrapper>} />
                      <Route path="/auth/*" element={<AuthContainer />} />
                      <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
                    </Route>
                    <Route path="/admin/*" element={<AdminPanel />} />
                    <Route path="/adminlogin" element={<AdminUpgradeForm />} />
                  </Routes>
                </AdminAuthProvider>
              </WalletProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;