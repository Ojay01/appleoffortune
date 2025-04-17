"use client";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { createApiClient } from "@/lib/api";
import { LoadingSpinner } from "../components/atoms/LoadingSpinner";
import { MainContent } from "../components/organisms/MainContent";
import AppleFortuneGame from "./apple";
import { createToastWithClose } from "../components/molecules/ToastNotification";

interface WalletBalances {
  balance: number;
  bonus: number;
  with_balance: number;
}

export default function FortuneGamePage() {
  const [walletBalances, setWalletBalances] = useState<WalletBalances>({
    balance: 100,
    bonus: 0,
    with_balance: 0,
  });
  const [selectedWallet, setSelectedWallet] = useState<string>("balance");
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
    const fetchBalances = async () => {
      setIsLoading(true);
      try {
        if (authToken) {
          const api = createApiClient(authToken);
          const response = await api.get("/fruit-game/balance");
          setWalletBalances({
            balance: response.data.balance,
            bonus: response.data.bonus,
            with_balance: response.data.with_balance,
          });
        } else {
          // For unauthenticated users, use default balances
          setWalletBalances({
            balance: 100,
            bonus: 0,
            with_balance: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
        // Fallback to default balances on error
        setWalletBalances({
          balance: 100,
          bonus: 0,
          with_balance: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [authToken]);

  const handleReset = () => {
    setInputValue("");
    setGameActive(false);
    createToastWithClose(`Wallet balances reset!`, "🔄");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleWalletChange = (value: string) => {
    setSelectedWallet(value);
    // Reset input value when changing wallets
    setInputValue("");
  };

  const handleStartUnauthenticated = () => {
    const amount = parseInt(inputValue) || 0;
    const currentBalance =
      walletBalances[selectedWallet as keyof WalletBalances];

    if (amount <= currentBalance) {
      // Update the selected wallet balance
      setWalletBalances({
        ...walletBalances,
        [selectedWallet]: currentBalance - amount,
      });
      setGameActive(true);
      createToastWithClose(
        `Starting game with ${amount} coins from ${selectedWallet}`,
        "🎮"
      );
    } else {
      createToastWithClose(`Insufficient ${selectedWallet} balance!`, "⚠️");
    }
  };

  const handleGameWinUnauth = (winAmount: number) => {
    // Apply the same rules as the backend for unauthenticated users
    const updatedBalances = { ...walletBalances };
    const stake = parseInt(inputValue) || 0;

    if (selectedWallet === "balance" || selectedWallet === "with_balance") {
      // If using balance or with_balance wallet, winnings go to with_balance
      updatedBalances.with_balance += winAmount;
    } else if (selectedWallet === "bonus") {
      // If using bonus wallet, check for 50% rule
      if (winAmount > stake * 1.5) {
        // If winnings are more than 50% of stake, add to with_balance
        updatedBalances.with_balance += winAmount;
      } else {
        // Otherwise, add back to bonus wallet
        updatedBalances.bonus += winAmount;
      }
    }

    setWalletBalances(updatedBalances);
    setGameActive(false);
  };

  const handleGameLoseUnauth = () => {
    setGameActive(false);
  };

  const handleStart = async () => {
    const amount = parseInt(inputValue) || 0;
    const currentBalance =
      walletBalances[selectedWallet as keyof WalletBalances];

    if (amount <= currentBalance) {
      if (authToken) {
        try {
          const api = createApiClient(authToken);
          const response = await api.post("/fruit-game/start", {
            stake: amount,
            walletType: selectedWallet,
          });

          if (response.status === 200) {
            // Update all balances with the response from the API
            setWalletBalances({
              balance: response.data.balance,
              bonus: response.data.bonus,
              with_balance: response.data.with_balance,
            });
            setGameActive(true);
            createToastWithClose(
              `Starting game with ${amount} coins from ${selectedWallet}`,
              "🎮"
            );
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
      createToastWithClose(`Insufficient ${selectedWallet} balance!`, "⚠️");
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
          // Update the frontend balances
          setWalletBalances({
            balance: response.data.balance,
            bonus: response.data.bonus,
            with_balance: response.data.with_balance,
          });
          setGameActive(false);
          createToastWithClose(`You won ${winAmount} coins!`, "🎉");
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          // Handle unauthenticated users
          handleGameWinUnauth(winAmount);
        } else {
          // Handle error (e.g., server or network issues)
          const errorMsg =
            error?.response?.data?.message || error.message || "Unknown error";
          createToastWithClose(
            `An error occurred during cashout: ${errorMsg}`,
            "⚠️"
          );
          console.error("Cashout error:", error); // optional logging
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
        const response = await api.post("/fruit-game/lose", {
          score: null,
          data: null,
        });

        // Update balances
        setWalletBalances({
          balance: response.data.balance,
          bonus: response.data.bonus,
          with_balance: response.data.with_balance,
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
    setInputValue("10");
    createToastWithClose("Set to minimum bet", "⬇️");
  };

  const handleMax = () => {
    const currentBalance =
      walletBalances[selectedWallet as keyof WalletBalances];
    setInputValue(currentBalance.toString());
    createToastWithClose("Set to maximum bet", "⬆️");
  };

  const handleDouble = () => {
    const currentBalance =
      walletBalances[selectedWallet as keyof WalletBalances];
    const current = parseInt(inputValue) || 0;
    const newValue = Math.min(current * 2, currentBalance);
    setInputValue(newValue.toString());
    createToastWithClose("Doubled bet amount", "✖️");
  };

  const handleHalf = () => {
    const current = parseInt(inputValue) || 0;
    const newValue = Math.floor(current / 2);
    setInputValue(newValue.toString());
    createToastWithClose("Halved bet amount", "➗");
  };

  const currentBalance = walletBalances[selectedWallet as keyof WalletBalances];
  const isInputValid = Boolean(
    inputValue &&
      !isNaN(Number(inputValue)) &&
      parseInt(inputValue) > 0 &&
      parseInt(inputValue) <= currentBalance
  );

  // Loading Screen
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const mainContent = gameActive ? (
    <AppleFortuneGame
      stake={parseInt(inputValue)}
      onWin={handleGameWin}
      onLose={handleGameLose}
    />
  ) : (
    <MainContent
      walletBalances={walletBalances}
      selectedWallet={selectedWallet}
      currentBalance={currentBalance}
      inputValue={inputValue}
      isInputValid={isInputValid}
      handleReset={handleReset}
      handleInputChange={handleInputChange}
      handleWalletChange={handleWalletChange}
      handleMin={handleMin}
      handleMax={handleMax}
      handleDouble={handleDouble}
      handleHalf={handleHalf}
      handleStart={handleStart}
    />
  );

  return (
    <>
      <Toaster position="top-center" />
      {mainContent}
    </>
  );
}
