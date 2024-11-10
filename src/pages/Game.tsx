import { useEffect, useRef, useState } from "react";
import { BallManager } from "../game/classes/BallManager";
import axios from "axios";
import { Button } from "../components/ui";
import { baseURL } from "../utils";
import { useWallet } from "../contexts/Walletcontext"; 
export function Game() {
  const [ballManager, setBallManager] = useState<BallManager>();
  const [ballPrice, setBallPrice] = useState<number>(1); // Default ball price
  const [backendData, setBackendData] = useState<any>(null); // State to store backend values
  const [ads, setAds] = useState<any[]>([]); // State to store ads
  
  const [requestAmount, setRequestAmount] = useState<number>(0); // State for wallet request amount
  const [requestMessage, setRequestMessage] = useState<string>(""); // State for request message
  const canvasRef = useRef<any>();

  const { balance, setBalance, setRemainingZixos } = useWallet();

  useEffect(() => {
    if (canvasRef.current) {
      const ballManager = new BallManager(
        canvasRef.current as unknown as HTMLCanvasElement
      );
      setBallManager(ballManager);
    }

    // Fetch ads from the backend
    const fetchAds = async () => {
      try {
        const response = await axios.get(`${baseURL}/public`);
        setAds(response.data); // Store ads in state
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAds();
  }, [canvasRef]);

  const handleAddBall = async () => {
    try {
      const userId = localStorage.getItem("uid");
      if (!userId) {
        console.error("User ID is missing. Please log in.");
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

      // Update balance and remainingZixos in the context
      setBalance(prevBalance => prevBalance + response.data.winnings);
      setRemainingZixos(response.data.remainingZixos); // Update remainingZixos in the WalletContext
    } catch (error) {
      console.error("Error adding ball:", error);
    }
  };




  // Filter ads by location
  const filterAdsByLocation = (location: string) => {
    return ads.filter(ad => ad.location === location);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <canvas ref={canvasRef} width="800" height="800"></canvas>

      {/* Input field for ball price */}
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

      {/* Button to add ball with the custom price */}
      <Button className="px-10 mb-4" onClick={handleAddBall}>
        Add balls
      </Button>
      
      {/* Input field for wallet request amount */}
      <div className="mb-4">
        <label htmlFor="requestAmount" className="mr-2">Request Amount:</label>
        <input
          id="requestAmount"
          type="number"
          min="1"
          value={requestAmount}
          onChange={(e) => setRequestAmount(Number(e.target.value))}
          className="border px-2 py-1"
        />
      </div>



      {/* Display backend response data */}
      {backendData && (
        <div className="mt-4">
          <h3 className="font-bold">Game Results:</h3>
          <p>Ball Price: {backendData.ballPrice}</p>
          <p>Winnings: {backendData.winnings}</p>
          <p>Multiplier: {backendData.multiplier}</p>
          <p>Pattern: {backendData.pattern.join(", ")}</p>
          <p>Remaining Zixos: {backendData.remainingZixos}</p>
        </div>
      )}

      {/* Display Ads based on their locations */}
      <div className="mt-8">
        <h3 className="font-bold text-xl">Advertisements:</h3>

        {/* Header Ad Section */}
        <div className="mb-4">
          <h4 className="font-bold">Header Ad</h4>
          {filterAdsByLocation("Header").map((ad, index) => (
            <div key={index} className="border p-4 mb-4">
              <h4 className="font-bold">{ad.title}</h4>
              <p>{ad.description}</p>
              <a href={ad.link} target="_blank" rel="noopener noreferrer">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto" />
              </a>
            </div>
          ))}
        </div>

        {/* Sidebar Ad Section */}
        <div className="mb-4">
          <h4 className="font-bold">Sidebar Ad</h4>
          {filterAdsByLocation("Sidebar").map((ad, index) => (
            <div key={index} className="border p-4 mb-4">
              <h4 className="font-bold">{ad.title}</h4>
              <p>{ad.description}</p>
              <a href={ad.link} target="_blank" rel="noopener noreferrer">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto" />
              </a>
            </div>
          ))}
        </div>

        {/* Main Content Ad Section */}
        <div className="mb-4">
          <h4 className="font-bold">Main Content Ad</h4>
          {filterAdsByLocation("MainContent").map((ad, index) => (
            <div key={index} className="border p-4 mb-4">
              <h4 className="font-bold">{ad.title}</h4>
              <p>{ad.description}</p>
              <a href={ad.link} target="_blank" rel="noopener noreferrer">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto" />
              </a>
            </div>
          ))}
        </div>

        {/* Footer Ad Section */}
        <div className="mb-4">
          <h4 className="font-bold">Footer Ad</h4>
          {filterAdsByLocation("Footer").map((ad, index) => (
            <div key={index} className="border p-4 mb-4">
              <h4 className="font-bold">{ad.title}</h4>
              <p>{ad.description}</p>
              <a href={ad.link} target="_blank" rel="noopener noreferrer">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {requestMessage && (
        <div className="mt-4">
          <p>{requestMessage}</p>
        </div>
      )}
    </div>
  );
}
