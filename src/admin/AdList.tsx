import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import { AdForm } from "./AdForm";
import { useAdminAuth } from "../contexts/admincontext";

// Define proper types for admin data and authentication context
interface AdminData {
  email: string;
  uid: string;
  role: string;
}

interface AuthContext {
  token: string;
  isAuthenticated: boolean;
  adminData: AdminData | null;
}

interface Ad {
  _id: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  service: string;
  createdBy?: {
    email: string;
    timestamp: Date;
  };
  lastEditedBy?: {
    email: string;
    timestamp: Date;
  };
}

export function AdList() {
  const { token, isAuthenticated, adminData } = useAdminAuth() as AuthContext;
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authAxios = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAds();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  async function fetchAds() {
    try {
      setIsLoading(true);
      const response = await authAxios.get<Ad[]>(`/ads`);
      setAds(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching ads", error);
      setError("Failed to fetch ads");
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddAd = () => {
    setSelectedAdId(null);
    setShowForm(true);
  };

  const handleEditAd = (adId: string) => {
    setSelectedAdId(adId);
    setShowForm(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-red-600">
        Please log in as an admin to view and manage ads.
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading ads...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">All Ads</h1>
        <div className="text-sm text-gray-600">
          {adminData?.email ? `Logged in as: ${adminData.email}` : 'Verifying admin...'}
        </div>
      </div>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <button
        onClick={handleAddAd}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add New Ad
      </button>

      {ads.length === 0 ? (
        <p className="mt-4 text-gray-600">No ads found.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {ads.map((ad) => (
            <li key={ad._id} className="border p-4 rounded shadow-sm bg-white">
              <div>
                <h3 className="font-bold text-lg">{ad.title}</h3>
                <p className="text-gray-700 mt-1">{ad.description}</p>
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline block mt-2"
                >
                  {ad.link}
                </a>
                <div className="mt-3 text-sm text-gray-600">
                  {ad.createdBy?.email && (
                    <p>Created by: {ad.createdBy.email}</p>
                  )}
                  {ad.lastEditedBy?.email && (
                    <p>Last edited by: {ad.lastEditedBy.email}</p>
                  )}
                </div>
                <button
                  onClick={() => handleEditAd(ad._id)}
                  className="mt-3 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="mt-6">
          <AdForm adId={selectedAdId} />
        </div>
      )}
    </div>
  );
}