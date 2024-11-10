import { useEffect, useRef, useState } from "react";
import { BallManager } from "../game/classes/BallManager";
import axios from "axios";
import { Button } from "../components/ui";
import { GoogleLoginComponent } from "../auth/google/googlelogin";
import { baseURL } from "../utils";
import { Link } from "react-router-dom";

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
      const response = await axios.post(`${baseURL}/demo-game`, {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-6">
        <canvas 
          ref={canvasRef} 
          width="800" 
          height="800"
          className="border border-gray-300 rounded-lg shadow-lg bg-white"
        ></canvas>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="ballPrice" className="text-gray-700 font-medium">
              Set Ball Price:
            </label>
            <input
              id="ballPrice"
              type="number"
              min="1"
              value={ballPrice}
              onChange={(e) => setBallPrice(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={addBallHandler}
          >
            Add balls
          </Button>

          <Link
            to="/adminupgrade"
            className="inline-flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            Request Admin Access
          </Link>
        </div>

        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Login Required
              </h3>
              <p className="text-gray-600">
                Ball drop limit reached. Please log in to continue playing.
              </p>
              <GoogleLoginComponent />
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}