import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import { useAdminAuth } from "../contexts/admincontext";

interface AdFormProps {
  adId: string | null;
}

export function AdForm({ adId }: AdFormProps) {
  const { token, isAuthenticated } = useAdminAuth();
  const [ad, setAd] = useState({
    title: '',
    description: '',
    link: '',
    imageUrl: '',
    service: 'GoogleAdSense',
    location: 'Header'
  });
  const [message, setMessage] = useState("");

  // Configure axios with authentication
  const authAxios = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAd(prevAd => ({
      ...prevAd,
      [name]: value
    }));
  };

  useEffect(() => {
    if (adId && isAuthenticated) {
      async function fetchAd() {
        try {
          const response = await authAxios.get(`/ads/${adId}`);
          setAd(response.data);
        } catch (error) {
          console.error('Error fetching ad:', error);
          setMessage("Failed to fetch ad details");
        }
      }
      fetchAd();
    }
  }, [adId, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setMessage("You must be authenticated as an admin to perform this action");
      return;
    }

    try {
      let response;
      if (adId) {
        response = await authAxios.put(`/ads/id/${adId}`, ad);
        setMessage(response.data.message || "Ad updated successfully");
      } else {
        response = await authAxios.post(`/ads`, ad);
        setMessage(response.data.message || "Ad created successfully");
        setAd({ title: '', description: '', link: '', imageUrl: '', service: 'GoogleAdSense', location: 'Header' });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error handling ad", error.response || error.message);
        setMessage(error.response?.data?.message || "Error handling ad");
      } else {
        console.error("Unexpected error", error);
        setMessage("Unexpected error occurred.");
      }
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in as an admin to manage ads.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{adId ? "Edit Ad" : "Create Ad"}</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={ad.title}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Description:
          <input
            type="text"
            name="description"
            value={ad.description}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Link:
          <input
            type="text"
            name="link"
            value={ad.link}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Image URL:
          <input
            type="text"
            name="imageUrl"
            value={ad.imageUrl}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        {/* Service Selection */}
        <label>
          Service:
          <select name="service" value={ad.service} onChange={handleChange} required>
            <option value="GoogleAdSense">Google AdSense</option>
            <option value="OtherAds">Other Ads</option>
            {/* Add more services as needed */}
          </select>
        </label>
        <br />
        {/* Location Selection */}
        <label>
          Ad Location:
          <select name="location" value={ad.location} onChange={handleChange} required>
            <option value="Header">Header</option>
            <option value="Sidebar">Sidebar</option>
            <option value="Footer">Footer</option>
            <option value="MainContent">Main Content</option>
            {/* Add more locations as needed */}
          </select>
        </label>
        <br />
        <button type="submit">{adId ? "Update Ad" : "Create Ad"}</button>
      </form>
    </div>
  );
}