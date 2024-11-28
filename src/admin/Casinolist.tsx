import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../contexts/admincontext';
import axios from 'axios';
import { baseURL } from '../utils';
import styles from './styles/CasinoList.module.css';
import { Star } from 'lucide-react';

interface Casino {
  _id: string;
  name: string;
  website: string;
  established: number;
  ourRating: number;
  isActive: boolean;
  orderInListing: number;
  offer?: string;
}

export function CasinoList() {
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAdminAuth();

  const fetchCasinos = async () => {
    try {
      const response = await axios.get(`${baseURL}/ads/casino`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCasinos(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch casinos');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCasinoStatus = async (casino: Casino) => {
    try {
      const response = await axios.put(
        `${baseURL}/ads/casino/${casino._id}`,
        {
          ...casino,
          isActive: !casino.isActive
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        await fetchCasinos();
      }
    } catch (error) {
      setError('Failed to update casino status');
      console.error('Error:', error);
    }
  };

  const handleDeleteCasino = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this casino? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${baseURL}/ads/casino/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCasinos(prevCasinos => prevCasinos.filter(casino => casino._id !== id));
    } catch (error) {
      setError('Failed to delete casino');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCasinos();
  }, [token]);

  if (isLoading) return <div className={styles.loading}>Loading casinos...</div>;

  if (casinos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Casinos</h2>
          <Link to="/admin/casinos/new" className={styles.addButton}>
            Add New Casino
          </Link>
        </div>
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No casinos found. Add your first casino to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
    <div className={styles.header}>
      <h2 className={styles.title}>Manage Casinos</h2>
      <Link to="/admin/casinos/new" className={styles.addButton}>
        Add New Casino
      </Link>
    </div>

    {error && <div className={styles.error}>{error}</div>}
    

      <div className={styles.grid}>
        {casinos.map((casino) => (
          <div key={casino._id} className={styles.card}>
  <div className={styles.cardContent}>
            <div className={styles.casinoName}>
              <span className={styles.casinoTitle}>{casino.name}</span>
              {casino.isActive && (
                <span className={styles.status}>Active</span>
              )}
            </div>
            
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Website:</span>
              <span className={styles.detailValue}>{casino.website}</span>
            </div>
            
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Established:</span>
              <span className={styles.detailValue}>{casino.established}</span>
            </div>
            
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Rating:</span>
              <span className={styles.detailValue}>
                <span className={styles.rating}>
                  <Star size={14} className={styles.ratingIcon} />
                  {casino.ourRating}/5
                </span>
              </span>
            </div>
            
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Order:</span>
              <span className={styles.detailValue}>{casino.orderInListing}</span>
            </div>
            
            <div className={styles.offerLabel}>Offer:</div>
            <div className={styles.offer}>
              {casino.offer || 'No offer available'}
            </div>

            <div className={styles.actions}>
              <button
                onClick={() => toggleCasinoStatus(casino)}
                className={`${styles.button} ${styles.deactivateButton}`}
              >
                {casino.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <Link
                to={`/admin/casinos/edit/${casino._id}`}
                className={`${styles.button} ${styles.editButton}`}
              >
                Edit
              </Link>
              <button
                onClick={() => handleDeleteCasino(casino._id)}
                className={`${styles.button} ${styles.deleteButton}`}
              >
                Delete
              </button>
            </div>
            </div>
          </div>
        ))}
      </div>
    
    </div>
  );
}