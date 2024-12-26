import { useEffect, useRef, useState } from "react";
import { BallManager } from "../../game/classes/BallManager";
import axios from "axios";
import { baseURL } from "../../utils";
import { useWallet } from "../../contexts/Walletcontext"; 
import styles from "./Game.module.css";
import Zixoslogo from "../../assets/zixos";

interface GameSettings {
  maxBallPrice: number;
  minBallPrice: number;
}

export function Game() {
  const [ballManager, setBallManager] = useState<BallManager>();
  const [ballPrice, setBallPrice] = useState<number>(1);
  const [backendData, setBackendData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastMultipliers, setLastMultipliers] = useState<number[]>([]);
  const [isDropping, setIsDropping] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const pendingResponseRef = useRef<any>(null);
  const canvasRef = useRef<any>();
  
  const { setBalance, setRemainingZixos } = useWallet();

  // Fetch game settings
  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const response = await axios.get(`${baseURL}/settings`);
        setGameSettings(response.data);
      } catch (error) {
        console.error("Error fetching game settings:", error);
      }
    };
    
    fetchGameSettings();
  }, []);

  const ZixosWithTooltip = () => (
    <div className={styles.tooltipContainer}>
      <Zixoslogo />
      <span className={styles.tooltip}>
        Zixos is an in-game currency with no real-world value
      </span>
    </div>
  );

  useEffect(() => {
    if (canvasRef.current) {
      const manager = new BallManager(
        canvasRef.current as unknown as HTMLCanvasElement,
        () => {
          if (pendingResponseRef.current) {
            const response = pendingResponseRef.current;
            setBackendData(response);
            setBalance(prevBalance => prevBalance + response.winnings);
            setRemainingZixos(response.remainingZixos);
            setLastMultipliers(prev => [response.multiplier, ...prev].slice(0, 3));
            setIsDropping(false);
            pendingResponseRef.current = null;
          }
        }
      );
      setBallManager(manager);
    }
  }, [canvasRef, setBalance, setRemainingZixos]);

  const handlePrice = (value: number) => {
    if (gameSettings && value <= gameSettings.maxBallPrice) {
      setBallPrice(value);
    }
  };

  const handleAddBall = async () => {
    if (isDropping) return;

    try {
      setIsDropping(true);
      
      const userId = localStorage.getItem("uid");
      if (!userId) {
        setErrorMessage("User ID is missing. Please log in.");
        setIsDropping(false);
        return;
      }

      const response = await axios.post(`${baseURL}/game`, {
        ballPrice,
        uid: userId,
      });

      if (ballManager) {
        pendingResponseRef.current = response.data;
        ballManager.addBall(response.data.point);
      }

      setErrorMessage("");
    } catch (error: any) {
      console.error("Error adding ball:", error);
      setErrorMessage(error.response?.data?.message || "Error adding ball. Please try again.");
      setIsDropping(false);
      pendingResponseRef.current = null;
    }
  };

  return (
    <div>
      <div className={styles.gameContainer}>
        <div className={styles.innerContainer}>
          <div className={styles.gameContent}>
            <div className={styles.canvasContainer}>
              <canvas
                ref={canvasRef}
                width={800}
                height={800}
                className={styles.canvas}
              />
            </div>

            <div className={styles.controlsPanel}>
              <div className={styles.inputGroup}>
                <label htmlFor="ballPrice" className={styles.label}>
                  Set Ball Price:
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="ballPrice"
                    type="number"
                    min={gameSettings?.minBallPrice || 1}
                    max={gameSettings?.maxBallPrice}
                    value={ballPrice}
                    onChange={(e) => handlePrice(Number(e.target.value))}
                    className={styles.input}
                    disabled={isDropping}
                  />
                  <span className={styles.inputValue}>
                  <ZixosWithTooltip />
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddBall}
                className={`${styles.button} ${isDropping ? styles.buttonDisabled : ''}`}
                disabled={isDropping}
              >
                {isDropping ? 'Dropping...' : 'Drop Ball'}
              </button>

              <div className={styles.resultsContainer}>
                <h3 className={styles.resultsTitle}>Game Results</h3>
                <div className={styles.resultItem}>
                  <span>Ball Price:</span>
                  <span className={styles.resultValue}>
                    {backendData?.ballPrice || 0} <ZixosWithTooltip />
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span>Winnings:</span>
                  <span className={styles.resultValue}>
                    {isDropping ? '...' : backendData?.winnings || 0} <ZixosWithTooltip />
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span>Multiplier:</span>
                  <span className={styles.resultValue}>
                    {isDropping ? '...' : (backendData?.multiplier || 0)}x
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span>Remaining:</span>
                  <span className={styles.resultValue}>
                    {isDropping ? '...' : Number(backendData?.remainingZixos || 0).toFixed(2)} <ZixosWithTooltip />
                  </span>
                </div>
              </div>

              {lastMultipliers.length > 0 && (
                <div className={styles.lastMultipliersContainer}>
                  <h4 className={styles.lastMultipliersTitle}>Last Multipliers</h4>
                  <div className={styles.multipliersGrid}>
                    {lastMultipliers.map((multiplier, index) => (
                      <div key={index} className={styles.multiplierBadge}>
                        {multiplier}x
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className={styles.errorMessage}>
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}