import { useEffect, useRef, useState } from 'react';
import { BallManager } from '../../game/classes/BallManager';
import axios, { AxiosError } from 'axios';
import GoogleLoginComponent from '../../auth/google/googlelogin';
import { baseURL } from '../../utils';
import styles from './Demo.module.css';
import { io, Socket } from 'socket.io-client';
import { Link } from "react-router-dom";
import { CiLogin } from "react-icons/ci";

export function Demo() {
  const [ballManager, setBallManager] = useState<BallManager | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [promptMessage, setPromptMessage] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(baseURL);
    setSocket(newSocket);

    if (canvasRef.current) {
      const manager = new BallManager(canvasRef.current);
      setBallManager(manager);
    }

    return () => {
      newSocket.close();
      if (ballManager) {
        ballManager.stop();
      }
    };
  }, [canvasRef]);

  const handlePriceChange = () => {
    setPromptMessage('Please log in to change ball price and access full game features.');
    setShowLoginPrompt(true);
  };

  const addBallHandler = async () => {
    if (!socket) return;

    try {
      const response = await axios.post(`${baseURL}/demo-game`, {
        userId: 'sampleUserId',
        ballPrice: 1,
        socketId: socket.id
      });
      
      if (ballManager) {
        ballManager.addBall(response.data.point);
      }
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 429) {
        setPromptMessage('Ball drop limit reached. Please log in to continue playing.');
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
              value={1}
              onChange={handlePriceChange}
              className={styles.input}
              min="1"
            />
          </div>

          <button
            onClick={addBallHandler}
            className={styles.addBallButton}
          >
            Drop Ball
          </button>
        </div>
      </div>

      {showLoginPrompt && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              Login/Sign-Up Required
            </h3>
            <p className={styles.modalText}>
              {promptMessage}
            </p>

            <div className={styles.glc}>
            <div>
              <GoogleLoginComponent />
            </div>
            <div>OR</div>
            <div className={styles.closeButton1}>
            <Link  className={styles.closeButton2} to="/auth/signup">
            <CiLogin size={24}/> Sign Up
            </Link>
            </div>
            </div>
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