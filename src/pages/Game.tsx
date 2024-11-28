import { useEffect, useRef, useState } from "react";
import { BallManager } from "../game/classes/BallManager";
import axios from "axios";
import { baseURL } from "../utils";
import { useWallet } from "../contexts/Walletcontext"; 
import styles from "./Game.module.css";
import Zixoslogo from "../assets/zixos";
export function Game() {
  const [ballManager, setBallManager] = useState<BallManager>();
  const [ballPrice, setBallPrice] = useState<number>(1);
  const [backendData, setBackendData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>(""); // Added missing error message state
  const canvasRef = useRef<any>();

  const { setBalance, setRemainingZixos } = useWallet();

  useEffect(() => {
    if (canvasRef.current) {
      const ballManager = new BallManager(
        canvasRef.current as unknown as HTMLCanvasElement
      );
      setBallManager(ballManager);
    }
  }, [canvasRef]);

  const handleAddBall = async () => {
    try {
      const userId = localStorage.getItem("uid");
      if (!userId) {
        setErrorMessage("User ID is missing. Please log in.");
        return;
      }

      const response = await axios.post(`${baseURL}/game`, {
        ballPrice,
        uid: userId,
      });

      if (ballManager) {
        ballManager.addBall(response.data.point);
      }

      setBackendData(response.data);
      setBalance(prevBalance => prevBalance + response.data.winnings);
      setRemainingZixos(response.data.remainingZixos);
      setErrorMessage(""); // Clear any previous error messages
    } catch (error) {
      console.error("Error adding ball:", error);
      setErrorMessage("Error adding ball. Please try again.");
    }
  };

  return (
    <div >
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
                        <input
                            id="ballPrice"
                            type="number"
                            min="1"
                            value={ballPrice}
                            onChange={(e) => setBallPrice(Number(e.target.value))}
                            className={styles.input}
                        />
                    </div>

                    <button
                        onClick={handleAddBall}
                        className={styles.button}
                    >
                        Drop Ball
                    </button>

                    {backendData && (
                        <div className={styles.resultsContainer}>
                            <h3 className={styles.resultsTitle}>Game Results</h3>
                            <div className={styles.resultItem}>
                                <span>Ball Price:</span>
                                <span className={styles.resultValue}>{backendData.ballPrice} <Zixoslogo/></span>
                            </div>
                            <div className={styles.resultItem}>
                                <span>Winnings:</span>
                                <span className={styles.resultValue}>{backendData.winnings} <Zixoslogo/></span>
                            </div>
                            <div className={styles.resultItem}>
                                <span>Multiplier:</span>
                                <span className={styles.resultValue}>{backendData.multiplier}x</span>
                            </div>
                            <div className={styles.resultItem}>
    <span>Remaining:</span>
    <span className={styles.resultValue}>
        {Number(backendData.remainingZixos).toFixed(2)} <Zixoslogo/>
    </span>
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