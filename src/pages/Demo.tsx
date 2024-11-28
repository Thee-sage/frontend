import { useEffect, useRef, useState } from 'react';
import { BallManager } from '../game/classes/BallManager';
import axios, { AxiosError } from 'axios';
import { Button } from '../components/ui';
import GoogleLoginComponent from '../auth/google/googlelogin';
import { baseURL } from '../utils';
import { Link } from 'react-router-dom';
import styles from './Demo.module.css';



export function Demo() {
  const [ballManager, setBallManager] = useState<BallManager | null>(null);
  const [ballPrice, setBallPrice] = useState<number>(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const manager = new BallManager(canvasRef.current);
      setBallManager(manager);
      
      // Cleanup function
      return () => {
        manager.stop();
      };
    }
  }, [canvasRef]);

  const addBallHandler = async () => {
    try {
      const response = await axios.post(`${baseURL}/demo-game`, {
        userId: 'sampleUserId',
        ballPrice,
      });
      if (ballManager) {
        ballManager.addBall(response.data.point);
      }
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 429) {
        setShowLoginPrompt(true);
      } else {
        console.error('Error in adding ball:', error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.flexContainer}>


        <canvas
          ref={canvasRef}
          width="800"
          height="800"
          className={styles.canvas}
        />

        <div className={styles.controlsContainer}>
          <div className={styles.inputGroup}>
            <label htmlFor="ballPrice" className={styles.label}>
              Set Ball Price:
            </label>
            <input
              id="ballPrice"
              type="number"
              min="1"
              value={ballPrice}
              onChange={(e) => setBallPrice(Number(e.target.value))}
              className={styles.input}
            />
          </div>

          <Button
            onClick={addBallHandler}
            className={styles.addBallButton}
          >
            Add Balls
          </Button>

          <Link
            to="/adminupgrade"
            className={styles.adminLink}
          >
            Request Admin Access
          </Link>
        </div>
      </div>

      {showLoginPrompt && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              Login Required
            </h3>
            <p className={styles.modalText}>
              Ball drop limit reached. Please log in to continue playing.
            </p>
            <GoogleLoginComponent />
            <button
              onClick={() => setShowLoginPrompt(false)}
              className={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}