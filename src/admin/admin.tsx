import { FC, useState, useRef, useEffect } from 'react';
import { Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { GameSettings } from './GameSettings';
import { WalletRequests } from './WalletRequests';
import { AdList } from './AdList';
import { CasinoForm } from './Casino';
import { useAdminAuth } from '../contexts/admincontext';
import { useParams } from 'react-router-dom';
import { CasinoList } from './Casinolist';
import styles from "./styles/AdminPanel.module.css"

// Define interface for admin data
interface AdminData {
  email: string;
  uid: string;
  [key: string]: any; // For any additional properties
}

// AdminInfo Component
const AdminInfo: FC<{ email: string; uid: string }> = ({ email, uid }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        buttonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopupVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.adminInfoContainer}>
      <button 
        ref={buttonRef}
        className={styles.adminInfoButton}
        onClick={() => setIsPopupVisible(!isPopupVisible)}
      >
        <span>Admin: {email || 'Loading...'}</span>
      </button>
      
      {isPopupVisible && (
        <div ref={popupRef} className={styles.adminInfoPopup}>
          <div className={styles.popupContent}>
            <div className={styles.popupItem}>
              <span className={styles.popupLabel}>Email:</span>
              <span className={styles.popupValue}>{email}</span>
            </div>
            <div className={styles.popupItem}>
              <span className={styles.popupLabel}>UID:</span>
              <span className={styles.popupValue}>{uid}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ProtectedRoute wrapper component
const ProtectedRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
  const { adminData } = useAdminAuth();
  const location = useLocation();

  if (!adminData) {
    // Redirect to login page, saving the attempted URL
    return <Navigate to="/adminlogin" state={{ from: location }} replace />;
  }

  return element;
};

const AdminPanel: FC = () => {
  const { adminData } = useAdminAuth();
  const typedAdminData = adminData as AdminData | null;
  const { email, uid } = typedAdminData || {};
  const location = useLocation();

  function EditCasinoWrapper() {
    const { id } = useParams();
    return <CasinoForm casinoId={id || null} />;
  }

  if (!adminData && location.pathname !== '/adminlogin') {
    return <Navigate to="/adminlogin" replace />;
  }

  return (
    <div className={styles.adminContainer}>
      {adminData && (
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <div className={styles.navContent}>
              <div className={styles.navLinks}>
                <Link
                  to="/admin/game-settings"
                  className={styles.navLink}
                >
                  Game Settings
                </Link>
                <Link
                  to="/admin/wallet-requests"
                  className={styles.navLink}
                >
                  Wallet Requests
                </Link>
                <Link
                  to="/admin/ads"
                  className={styles.navLink}
                >
                  Manage Ads
                </Link>
                <Link
                  to="/admin/casinos"
                  className={styles.navLink}
                >
                  Manage Casinos
                </Link>
              </div>
              <AdminInfo email={email || ''} uid={uid || ''} />
            </div>
          </div>
        </nav>
      )}

      <main className={styles.mainContent}>
        <Routes>
          <Route
            path="/login"
            element={
              adminData ? (
                <Navigate to="/admin" replace />
              ) : (
                <div className={styles.card}>Your Login Component Here</div>
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute
                element={
                  <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>
                      Welcome to the Admin Panel
                    </h1>
                    <p className={styles.welcomeText}>
                      Select a section from the navigation above to get started
                    </p>
                  </div>
                }
              />
            }
          />
          <Route
            path="/game-settings"
            element={<ProtectedRoute element={<GameSettings />} />}
          />
          <Route
            path="/wallet-requests"
            element={<ProtectedRoute element={<WalletRequests />} />}
          />
          <Route
            path="/ads"
            element={<ProtectedRoute element={<AdList />} />}
          />
          <Route
            path="/casinos/*"
            element={
              <ProtectedRoute
                element={
                  <Routes>
                    <Route index element={<CasinoList />} />
                    <Route path="new" element={<CasinoForm casinoId={null} />} />
                    <Route path="edit/:id" element={<EditCasinoWrapper />} />
                  </Routes>
                }
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;