import { useEffect, useRef, useState } from "react";
import { BallManager } from "../game/classes/BallManager";
import axios from "axios";
import { Button } from "../components/ui";
import { GoogleLoginComponent } from "../auth/google/googlelogin";

const backendURL = "http://localhost:3001"; // Base path for the demo API

export function Demo() {
  const [ballManager, setBallManager] = useState<BallManager>();
  const [ballPrice, setBallPrice] = useState<number>(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const canvasRef = useRef<any>();

  useEffect(() => {
    if (canvasRef.current) {
      const manager = new BallManager(canvasRef.current as HTMLCanvasElement);
      setBallManager(manager);
    }
  }, [canvasRef]);

  const addBallHandler = async () => {
    try {
      const response = await axios.post(`${backendURL}/demo-game`, {
        userId: "sampleUserId",
        ballPrice,
      });
      if (ballManager) {
        ballManager.addBall(response.data.point);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        setShowLoginPrompt(true);
      } else {
        console.error("Error in adding ball:", error);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <canvas ref={canvasRef} width="800" height="800"></canvas>

      <div className="mb-4">
        <label htmlFor="ballPrice" className="mr-2">Set Ball Price:</label>
        <input
          id="ballPrice"
          type="number"
          min="1"
          value={ballPrice}
          onChange={(e) => setBallPrice(Number(e.target.value))}
          className="border px-2 py-1"
        />
      </div>

      <Button
        className="px-10 mb-4"
        onClick={addBallHandler}
      >
        Add balls
      </Button>

      {showLoginPrompt && (
        <div className="popup">
          <p>Ball drop limit reached. Please log in to continue playing.</p>
          <GoogleLoginComponent />
          <button onClick={() => setShowLoginPrompt(false)}>Close</button>
        </div>
      )}
    </div>
  );
}
