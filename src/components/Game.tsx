import { useEffect, useRef, useState } from "react";
import { BallManager } from "../game/classes/BallManager";
import axios from "axios";
import { baseURL } from "../utils";
export function Game() {
    const [ballManager, setBallManager] = useState<BallManager>();
    const [ballPrice, setBallPrice] = useState<number>(1); // Default ball price to 1 Zixo
    const canvasRef = useRef<any>();

    useEffect(() => {
        if (canvasRef.current) {
            const ballManager = new BallManager(canvasRef.current as unknown as HTMLCanvasElement);
            setBallManager(ballManager);
        }
    }, [canvasRef]);

    return (
        <div>
            <canvas ref={canvasRef} width="800" height="800"></canvas>
            
            {/* Input field for setting the ball price */}
            <div>
                <label htmlFor="ballPrice">Set Ball Price: </label>
                <input
                    id="ballPrice"
                    type="number"
                    min="1"
                    value={ballPrice}
                    onChange={(e) => setBallPrice(Number(e.target.value))}
                />
            </div>

            {/* Button to add ball */}
            <button
                onClick={async () => {
                    try {
                        // Sending ballPrice in the request body
                        const response = await axios.post(`${baseURL}/game`, {
                            userId: "user123", // Replace with the actual userId
                            ballPrice: ballPrice // Pass the user input ball price
                        });

                        if (ballManager) {
                            ballManager.addBall(response.data.point);
                        }
                    } catch (error) {
                        console.error("Error adding ball:", error);
                    }
                }}
            >
                Add balls
            </button>
        </div>
    );
}
