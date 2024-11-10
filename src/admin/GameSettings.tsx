import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import { useAdminAuth } from "../contexts/admincontext";

interface GameSettingsData {
  ballLimit: number;
  initialBalance: number;
  maxBallPrice: number;
  dropResetTime: number;
  lastSignedInBy: string;
}

export const GameSettings = () => {
  const { token, adminData } = useAdminAuth();
  const [settings, setSettings] = useState<GameSettingsData>({
    ballLimit: 100,
    initialBalance: 200,
    maxBallPrice: 20,
    dropResetTime: 60000,
    lastSignedInBy: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSettings(response.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch settings. Please try again.");
        }
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!adminData || !(adminData as any)?.email) {
        throw new Error('Admin data not available');
      }

      const updatedSettings = {
        ...settings,
        lastSignedInBy: (adminData as any)?.email
      };

      const response = await axios.post(
        `${baseURL}/settings`,
        updatedSettings,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage("Settings updated successfully!");
      setSettings(response.data.settings);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error updating settings:", err);
        setError(err.message);
      } else if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to update settings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  if (!token) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        You must be logged in as an admin to access this page.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Game Settings</h2>
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ball Limit
          </label>
          <input
            type="number"
            name="ballLimit"
            value={settings.ballLimit}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Balance
          </label>
          <input
            type="number"
            name="initialBalance"
            value={settings.initialBalance}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Ball Price
          </label>
          <input
            type="number"
            name="maxBallPrice"
            value={settings.maxBallPrice}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drop Reset Time (ms)
          </label>
          <input
            type="number"
            name="dropResetTime"
            value={settings.dropResetTime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>

      {settings.lastSignedInBy && (
        <p className="text-sm text-gray-500 mt-4">
          Last updated by: {settings.lastSignedInBy}
        </p>
      )}
    </div>
  );
};

export default GameSettings;
