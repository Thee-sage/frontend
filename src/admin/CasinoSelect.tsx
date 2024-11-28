import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import { useAdminAuth } from "../contexts/admincontext";

interface Casino {
  _id: string;
  name: string;
  logo: string;
  description: string;
}

interface CasinoSelectProps {
  value?: string;
  onChange: (casinoId: string) => void;
  error?: string;
}

export function CasinoSelect({ value, onChange, error }: CasinoSelectProps) {
  const { token } = useAdminAuth();
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCasinos = async () => {
      try {
        const response = await axios.get(`${baseURL}/ads/casino`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCasinos(response.data);
      } catch (err) {
        console.error('Error fetching casinos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCasinos();
  }, [token]);

  if (isLoading) {
    return <div className="text-gray-500">Loading casinos...</div>;
  }

  return (
    <div className="space-y-2">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">Select a Casino</option>
        {casinos.map((casino) => (
          <option key={casino._id} value={casino._id}>
            {casino.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {casinos.length === 0 && (
        <p className="text-sm text-gray-500">No casinos available. Please create a casino first.</p>
      )}
    </div>
  );
}