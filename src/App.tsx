import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Game } from "./pages/Game";
import { GoogleLoginComponent } from "./auth/google/googlelogin";
import VerifyEmail from './VerifyEmail';
import AdminPanel from './admin/admin';
import { Demo } from "./pages/Demo";
import Loginpage from "./smallpages/completesignuppage";
import Layout from './Navbar/layout';
import AdminUpgradeForm from "./adminupgrade";
import { WalletProvider } from "./contexts/Walletcontext";
import { AuthProvider } from "./contexts/authcontext";
import Abc from "./abc";
import { AdminAuthProvider } from "./contexts/admincontext";

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Missing Google Client ID in environment variables');
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <WalletProvider>
            {/* AdminAuthProvider wrapped outside Routes for admin-related routes */}
            <AdminAuthProvider>
              <Routes>
                {/* Layout routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Demo />} />
                  <Route path="/game" element={<Game />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/complete" element={<Loginpage />} />
                  <Route path="/auth/google" element={<GoogleLoginComponent />} />
                  <Route path="/abc/*" element={<Abc />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminPanel />} />
                <Route path="/adminupgrade" element={<AdminUpgradeForm />} />
              </Routes>
            </AdminAuthProvider>
          </WalletProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;