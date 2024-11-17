"use client";
import { useState } from "react";
import { Layers, Disc } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppleFortuneGame from "./apple";

export default function Component() {
  const [balance, setBalance] = useState(90);
  const [inputValue, setInputValue] = useState("10");
  const [gameActive, setGameActive] = useState(false);

  const handleReset = () => {
    setBalance(100);
    setInputValue("");
    setGameActive(false);
    toast.success("Balance reset to 100!", {
      icon: "🔄",
      duration: 2000,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleStart = () => {
    const amount = parseInt(inputValue) || 0;
    if (amount <= balance) {
      setBalance((prev) => prev - amount);
      setGameActive(true);
      toast(`Starting game with ${amount} coins`, {
        icon: "🎮",
        duration: 2000,
      });
    } else {
      toast.error("Insufficient balance!", {
        icon: "⚠️",
        duration: 2000,
      });
    }
  };

  const handleGameWin = (winAmount: number) => {
    setBalance((prev) => prev + winAmount);
    setGameActive(false);
  };

  const handleGameLose = () => {
    setGameActive(false);
  };

  const handleMin = () => {
    setInputValue("1");
    toast("Set to minimum bet", {
      icon: "⬇️",
      duration: 1000,
    });
  };

  const handleMax = () => {
    setInputValue(balance.toString());
    toast("Set to maximum bet", {
      icon: "⬆️",
      duration: 1000,
    });
  };

  const handleDouble = () => {
    const current = parseInt(inputValue) || 0;
    const newValue = Math.min(current * 2, balance);
    setInputValue(newValue.toString());
    toast("Doubled bet amount", {
      icon: "✖️",
      duration: 1000,
    });
  };

  const handleHalf = () => {
    const current = parseInt(inputValue) || 0;
    const newValue = Math.floor(current / 2);
    setInputValue(newValue.toString());
    toast("Halved bet amount", {
      icon: "➗",
      duration: 1000,
    });
  };

  const isInputValid =
    inputValue && parseInt(inputValue) > 0 && parseInt(inputValue) <= balance;

  const mainContent = gameActive ? (
    <AppleFortuneGame
      stake={parseInt(inputValue)}
      onWin={handleGameWin}
      onLose={handleGameLose}
    />
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white relative mx-auto max-w-screen-lg">
      <div className="px-6 py-8 space-y-6">
        {/* Balance Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[#8A2BE2] text-xl font-medium">
              Current Balance
            </span>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <Disc className="w-full h-full text-yellow-500" />
              </div>
              <span className="text-[#8A2BE2] text-4xl font-bold">
                {balance}
              </span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          className="w-full h-14 bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white rounded-3xl font-medium text-xl shadow-lg"
          onClick={handleReset}
        >
          RESET TO 100
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
              className="h-12 bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white rounded-2xl font-medium text-lg shadow-md"
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
            className="w-full h-14 bg-black text-white rounded-3xl px-6 text-center text-2xl font-medium border-0 shadow-lg"
            placeholder="Enter amount"
          />
        </div>

        {/* Start Button */}
        <div className="relative">
          <Button
            className="w-full h-14 bg-[#8A2BE2] hover:bg-[#7B1FA2] disabled:bg-gray-400 text-white rounded-3xl font-medium text-xl shadow-lg"
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
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
            fontSize: "16px",
            padding: "12px 20px",
            borderRadius: "12px",
          },
        }}
      />
      {mainContent}
    </>
  );
}
