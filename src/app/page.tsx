"use client";
import { useEffect, useState } from "react";
import { Layers, Disc, X, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import AppleFortuneGame from "./apple";
import toast, { Toaster } from "react-hot-toast";
import { createApiClient } from "@/components/lib/api";

export default function Component() {
  const [balance, setBalance] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("10");
  const [gameActive, setGameActive] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("authToken");
    setAuthToken(token);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        if (authToken) {
          const api = createApiClient(authToken);
          const response = await api.get("/fruit-game/balance");
          setBalance(response.data.balance);
        } else {
          // For unauthenticated users, use default balance
          setBalance(100);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        // Fallback to default balance on error
        setBalance(100);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [authToken]);

  const createToastWithClose = (message: string, icon?: string) => {
    const toastId = toast(
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {message}
        </div>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
          title="Close notification"
        >
          <X size={16} color="white" />
        </button>
      </div>,
      {
        duration: 2000,
        style: {
          background: "#2E8B57",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "12px",
        },
      }
    );
  };

  const handleReset = () => {
    if (balance !== null) {
      setInputValue("");
      setGameActive(false);
      createToastWithClose(`Balance reset to ${balance}!`, "🔄");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleStartUnauthenticated = () => {
    const amount = parseInt(inputValue) || 0;
    if (balance !== null && amount <= balance) {
      setBalance(balance - amount);
      setGameActive(true);
      createToastWithClose(`Starting game with ${amount} coins`, "🎮");
    } else {
      createToastWithClose("Insufficient balance!", "⚠️");
    }
  };

  const handleGameWinUnauth = (winAmount: number) => {
    if (balance !== null) {
      setBalance(balance + winAmount);
    }
    setGameActive(false);
  };

  const handleGameLoseUnauth = () => {
    setGameActive(false);
  };

  const handleStart = async () => {
    if (balance === null) return;
    
    const amount = parseInt(inputValue) || 0;
    if (amount <= balance) {
      if (authToken) {
        try {
          const api = createApiClient(authToken);
          const response = await api.post("/fruit-game/start", { stake: amount });

          if (response.status === 200) {
            // Update the balance with the response from the API
            setBalance(response.data.balance);
            setGameActive(true);
            createToastWithClose(`Starting game with ${amount} coins`, "🎮");
          }
        } catch (error: any) {
          if (error?.response?.status === 401) {
            // Handle unauthenticated users
            handleStartUnauthenticated();
          } else {
            // Handle other error responses from the API
            const errorMessage =
              error?.response?.data?.message ||
              "An error occurred. Please try again.";
            createToastWithClose(errorMessage, "⚠️");
          }
        }
      } else {
        // Handle unauthenticated users
        handleStartUnauthenticated();
      }
    } else {
      createToastWithClose("Insufficient balance!", "⚠️");
    }
  };

  const handleGameWin = async (winAmount: number) => {
    if (authToken) {
      try {
        const api = createApiClient(authToken);
        // Make API call to cash out and update balance
        const response = await api.post("/fruit-game/cashout", {
          amount: winAmount,
          score: winAmount,
          data: null,
        });

        if (response.status === 200) {
          // Update the frontend balance
          setBalance(response.data.balance);
          setGameActive(false);
          createToastWithClose(`You won ${winAmount} coins!`, "🎉");
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          // Handle unauthenticated users
          handleGameWinUnauth(winAmount);
        } else {
          // Handle error (e.g., server or network issues)
          createToastWithClose(
            "An error occurred during cashout. Please try again.",
            "⚠️"
          );
        }
      }
    } else {
      handleGameWinUnauth(winAmount);
    }
  };

  const handleGameLose = async () => {
    if (authToken) {
      try {
        const api = createApiClient(authToken);
        // Call the backend to mark the game as lost
        await api.post("/fruit-game/lose", {
          score: null,
          data: null,
        });

        setGameActive(false);
        createToastWithClose("You lost the game.", "⚠️");
      } catch (error: any) {
        if (error?.response?.status === 401) {
          // Handle unauthenticated users
          handleGameLoseUnauth();
        } else {
          // Handle error (e.g., server or network issues)
          createToastWithClose(
            "An error occurred while losing the game. Please try again.",
            "⚠️"
          );
        }
      }
    } else {
      handleGameLoseUnauth();
    }
  };

  const handleMin = () => {
    setInputValue("1");
    createToastWithClose("Set to minimum bet", "⬇️");
  };

  const handleMax = () => {
    if (balance !== null) {
      setInputValue(balance.toString());
      createToastWithClose("Set to maximum bet", "⬆️");
    }
  };

  const handleDouble = () => {
    if (balance !== null) {
      const current = parseInt(inputValue) || 0;
      const newValue = Math.min(current * 2, balance);
      setInputValue(newValue.toString());
      createToastWithClose("Doubled bet amount", "✖️");
    }
  };

  const handleHalf = () => {
    const current = parseInt(inputValue) || 0;
    const newValue = Math.floor(current / 2);
    setInputValue(newValue.toString());
    createToastWithClose("Halved bet amount", "➗");
  };

  const isInputValid =
    balance !== null && inputValue && parseInt(inputValue) > 0 && parseInt(inputValue) <= balance;

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-green-50 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
          <p className="text-xl font-medium text-green-800">Authenticating...</p>
        </div>
      </div>
    );
  }

  const mainContent = gameActive ? (
    <AppleFortuneGame
      stake={parseInt(inputValue)}
      onWin={handleGameWin}
      onLose={handleGameLose}
    />
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white relative mx-auto max-w-screen-lg">
      <div className="px-6 py-8 space-y-6">
        {/* Balance Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[#2E8B57] text-xl font-medium">
              Current Balance
            </span>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <Disc className="w-full h-full text-amber-500" />
              </div>
              <span className="text-[#2E8B57] text-4xl font-bold">
                {balance}
              </span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          className="w-full h-14 bg-[#2E8B57] hover:bg-[#228B22] text-white rounded-3xl font-medium text-xl shadow-lg"
          onClick={handleReset}
        >
          RESET TO &#8355; {balance}
        </Button>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 space-y-4 bg-gradient-to-t from-white to-transparent pt-8 mx-auto max-w-screen-lg">
        {/* Operation Buttons */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Min", onClick: handleMin },
            { label: "X2", onClick: handleDouble },
            { label: "X/2", onClick: handleHalf },
            { label: "Max", onClick: handleMax },
          ].map((btn) => (
            <Button
              key={btn.label}
              variant="secondary"
              className="h-12 bg-[#2E8B57] hover:bg-[#228B22] text-white rounded-2xl font-medium text-lg shadow-md"
              onClick={btn.onClick}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {/* Input Field */}
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="w-full h-14 bg-green-900 text-white rounded-3xl px-6 text-center text-2xl font-medium border-0 shadow-lg"
            placeholder="Enter amount"
          />
        </div>

        {/* Start Button */}
        <div className="relative">
          <Button
            className="w-full h-14 bg-[#2E8B57] hover:bg-[#228B22] disabled:bg-gray-400 text-white rounded-3xl font-medium text-xl shadow-lg"
            onClick={handleStart}
            disabled={!isInputValid}
          >
            START
          </Button>
          <div className="absolute right-4 bottom-4">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-center" />
      {mainContent}
    </>
  );
}