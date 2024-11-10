import { FC } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { GameSettings } from './GameSettings';
import { WalletRequests } from './WalletRequests';
import { AdList } from './AdList';
import { useAdminAuth } from '../contexts/admincontext';

// Define interface for admin data
interface AdminData {
  email: string;
  uid: string;
  [key: string]: any; // For any additional properties
}

const AdminPanel: FC = () => {
  const { adminData } = useAdminAuth();
  // Type assertion since we know the shape of adminData
  const typedAdminData = adminData as AdminData | null;
  const { email, uid /* will be used for future admin validation */ } = typedAdminData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                to="/admin/game-settings"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                Game Settings
              </Link>
              <Link
                to="/admin/wallet-requests"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                Wallet Requests
              </Link>
              <Link
                to="/admin/ads"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                Manage Ads
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                Admin: {email || 'Loading...'}
                { uid || 'loading'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome to the Admin Panel
                </h1>
                <p className="mt-2 text-gray-600">
                  Select a section from the navigation above to get started
                </p>
              </div>
            }
          />
          <Route
            path="/game-settings"
            element={<GameSettings />}
          />
          <Route
            path="/wallet-requests"
            element={<WalletRequests />}
          />
          <Route
            path="/ads"
            element={<AdList />}
          />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;