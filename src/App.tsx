import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GamePage } from "./pages/Gamepage";
import VerifyEmail from './VerifyEmail';
import AdminPanel from './admin/admin';
import PlinkoLandingPage from "./pages/mainpage";
import Loginpage from "./smallpages/completesignuppage";
import Layout from './Navbar/layout';
import AdminUpgradeForm from "./adminupgrade/adminupgrade";
import { WalletProvider } from "./contexts/Walletcontext";
import { AuthProvider } from "./contexts/authcontext";
import Abc from "./abc";
import AuthContainer from "./smallpages/completesignuppage";
import { AdminAuthProvider } from "./contexts/admincontext";
import { ThemeProvider } from './contexts/ThemeContext';
import { PublicCasinoList,PublicCasinoDetail } from "./pages/allcasinopage";

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Missing Google Client ID in environment variables');
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <WalletProvider>
            {/* AdminAuthProvider wrapped outside Routes for admin-related routes */}
            <AdminAuthProvider>
              <Routes>
                {/* Layout routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<PlinkoLandingPage />} />
                  <Route path="/game" element={<GamePage />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/complete" element={<Loginpage />} />
                  <Route path="/abc/*" element={<Abc />} />
                  <Route path="/casinos" element={<PublicCasinoList />} />
<Route path="/casinos/:id" element={<PublicCasinoDetail />} />
                  <Route path="/auth/*" element={<AuthContainer />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminPanel />} />
                <Route path="/adminlogin" element={<AdminUpgradeForm />} />
              </Routes>
            </AdminAuthProvider>
          </WalletProvider>
        </AuthProvider>
      </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;