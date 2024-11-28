import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import { useAdminAuth } from "../contexts/admincontext";
import styles from "./styles/GameSettings.module.css";

// Add descriptions for each setting
const settingDescriptions = {
  ballLimit: "Maximum number of balls a player can have in their inventory at once. This helps control game economy and prevents hoarding.",
  initialBalance: "Starting balance for new players when they first join the game. This amount should be enough to get them started but not too much to affect the economy.",
  maxBallPrice: "Maximum price that can be set for a single ball. This prevents inflation and keeps the game balanced.",
  dropResetTime: "Time in milliseconds before the drop area resets. This controls how frequently players can drop balls.",
  totalCycleTime: "Total time in milliseconds for one complete rotation of all ads. Higher priority ads will be shown for longer portions of this cycle."
};

interface GameSettingsData {
  ballLimit: number;
  initialBalance: number;
  maxBallPrice: number;
  dropResetTime: number;
  totalCycleTime: number;
  lastSignedInBy: string;
}

const FormField = ({ 
  name, 
  label, 
  value, 
  onChange,
  description 
}: { 
  name: keyof GameSettingsData;
  label: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  description: string;
}) => (
  <div className={styles.formGroup}>
    <div className={styles.labelGroup}>
      <label className={styles.label}>
        {label}
      </label>
      <div className={styles.tooltipContainer}>
        <button 
          type="button" 
          className={styles.tooltipButton}
          aria-label={`Info about ${label}`}
        >
          ?
          <span className={styles.tooltip}>
            {description}
          </span>
        </button>
      </div>
    </div>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      className={styles.input}
    />
    {name === 'totalCycleTime' && (
      <p className={styles.helpText}>
        {(value / 1000 / 60).toFixed(1)} minutes - 
        Time for one complete rotation of ads. Higher priority ads will stay longer.
      </p>
    )}
  </div>
);

export const GameSettings = () => {
  const { token, adminData } = useAdminAuth();
  const [settings, setSettings] = useState<GameSettingsData>({
    ballLimit: 100,
    initialBalance: 200,
    maxBallPrice: 20,
    dropResetTime: 60000,
    totalCycleTime: 600000,
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
      <div className={`${styles.message} ${styles.error}`}>
        You must be logged in as an admin to access this page.
      </div>
    );
  }

  return (
    <>
      <h2 className={styles.title}>Game Settings</h2>
      <div className={styles.container}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        )}
        
        {message && (
          <div className={`${styles.message} ${styles.success}`}>
            {message}
          </div>
        )}
        
        {error && (
          <div className={`${styles.message} ${styles.error}`}>
            {error}
          </div>
        )}
  
        <form onSubmit={handleSubmit} className={styles.form}>
        <FormField
          name="ballLimit"
          label="Ball Limit"
          value={settings.ballLimit}
          onChange={handleInputChange}
          description={settingDescriptions.ballLimit}
        />

        <FormField
          name="initialBalance"
          label="Initial Balance"
          value={settings.initialBalance}
          onChange={handleInputChange}
          description={settingDescriptions.initialBalance}
        />

        <FormField
          name="maxBallPrice"
          label="Max Ball Price"
          value={settings.maxBallPrice}
          onChange={handleInputChange}
          description={settingDescriptions.maxBallPrice}
        />

        <FormField
          name="dropResetTime"
          label="Drop Reset Time (ms)"
          value={settings.dropResetTime}
          onChange={handleInputChange}
          description={settingDescriptions.dropResetTime}
        />

        <FormField
          name="totalCycleTime"
          label="Total Cycle Time for Ads (ms)"
          value={settings.totalCycleTime}
          onChange={handleInputChange}
          description={settingDescriptions.totalCycleTime}
        />

        <button 
          type="submit" 
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
        </form>
  
        {settings.lastSignedInBy && (
          <div className={styles.lastUpdated}>
            Last updated by: {settings.lastSignedInBy}
          </div>
        )}
      </div>
    </>
  );
};

export default GameSettings;