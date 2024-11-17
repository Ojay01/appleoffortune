"use client";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

type GameState = "waiting" | "playing" | "won" | "lost";
type CardContent = "apple" | "snake" | null;
type RevealedCards = Record<string, CardContent>;
type ApplePositions = Record<number, number>;

interface AppleFortuneGameProps {
  stake: number;
  onWin: (amount: number) => void;
  onLose: () => void;
}

const INITIAL_ROWS = 10;
const CARDS_PER_ROW = 5;

export default function AppleFortuneGame({
  stake,
  onWin,
  onLose,
}: AppleFortuneGameProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [currentRow, setCurrentRow] = useState(INITIAL_ROWS - 1);
  const [revealedCards, setRevealedCards] = useState<RevealedCards>({});
  const [applePositions, setApplePositions] = useState<ApplePositions>({});
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [extraRows, setExtraRows] = useState(0);

  useEffect(() => {
    const positions: ApplePositions = {};
    for (let i = 0; i < INITIAL_ROWS; i++) {
      positions[i] = Math.floor(Math.random() * CARDS_PER_ROW);
    }
    setApplePositions(positions);
  }, []);

  const addNewRow = () => {
    setExtraRows((prev) => prev + 1);
    const newRowIndex = -extraRows - 1; // Negative indices for new rows above
    setApplePositions((prev) => ({
      ...prev,
      [newRowIndex]: Math.floor(Math.random() * CARDS_PER_ROW),
    }));
    setCurrentRow(newRowIndex);
  };

  const handleCardClick = (rowIndex: number, columnIndex: number): void => {
    if (
      gameState !== "playing" ||
      rowIndex !== currentRow ||
      revealedCards[`${rowIndex}-${columnIndex}`]
    ) {
      return;
    }

    const isApple = applePositions[rowIndex] === columnIndex;
    setRevealedCards((prev) => ({
      ...prev,
      [`${rowIndex}-${columnIndex}`]: isApple ? "apple" : "snake",
    }));

    if (!isApple) {
      setGameState("lost");
      onLose();
      toast.error("Game Over! You hit a snake! Better luck next time.", {
        icon: "🐍",
        duration: 3000,
      });
    } else if (
      rowIndex === Math.min(...Object.keys(applePositions).map(Number))
    ) {
      // When at the top row, add a new row and continue
      addNewRow();
      const newMultiplier = calculateMultiplier(rowIndex) + 0.25;
      setCurrentMultiplier(newMultiplier);
      toast.success(
        `Perfect! New row added! Current multiplier: x${newMultiplier.toFixed(2)}`,
        {
          icon: "🎯",
          duration: 3000,
        },
      );
    } else {
      setCurrentRow(rowIndex - 1);
      const newMultiplier = calculateMultiplier(rowIndex - 1);
      setCurrentMultiplier(newMultiplier);
      toast.success(
        `Apple Found! Current multiplier: x${newMultiplier.toFixed(2)}`,
        {
          icon: "🍎",
          duration: 2000,
        },
      );
    }
  };

  const calculateMultiplier = (rowIndex: number): number => {
    const baseMultiplier = 1.25;
    const rowsAboveBase = INITIAL_ROWS - rowIndex - 1; // Calculate levels above the current row
    const extraLevels = rowIndex < 0 ? Math.abs(rowIndex) : rowsAboveBase;
    return Number((baseMultiplier + extraLevels * 0.25).toFixed(2));
  };

  const handleStart = (): void => {
    setGameState("playing");
    setCurrentRow(INITIAL_ROWS - 1);
    setRevealedCards({});
    setCurrentMultiplier(0);
    setExtraRows(0);

    const positions: ApplePositions = {};
    for (let i = 0; i < INITIAL_ROWS; i++) {
      positions[i] = Math.floor(Math.random() * CARDS_PER_ROW);
    }
    setApplePositions(positions);

    toast("Game Started! Find the apples and avoid the snakes. Good luck!", {
      icon: "🎮",
      duration: 3000,
    });
  };

  const handleCashout = (): void => {
    if (gameState === "playing") {
      setGameState("won");
      const winAmount = stake * currentMultiplier;
      onWin(winAmount);
      toast.success(`Cashed Out! You won ${(winAmount - stake).toFixed(2)}!`, {
        icon: "💰",
        duration: 3000,
      });
    }
  };

  // Get all row indices including negative ones for extra rows
  const getAllRowIndices = () => {
    const indices = [];
    for (let i = -extraRows; i < INITIAL_ROWS; i++) {
      indices.push(i);
    }
    return indices;
  };

  // Replace the return statement with this updated version
  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4 p-4">
      {/* Top Balance Display */}
      <div className="bg-white rounded-xl p-4 shadow-lg flex justify-between items-center">
        <span className="text-lg md:text-2xl font-bold">
          💰 {stake * (currentMultiplier || 1)}
        </span>
        {gameState === "playing" && (
          <Button
            onClick={handleCashout}
            className="bg-green-500 hover:bg-green-600 text-white text-sm md:text-base"
          >
            CASH OUT x{currentMultiplier}
          </Button>
        )}
      </div>

      {/* Game Grid - Now uses flex-1 to take remaining space */}
      <div className="flex-1 overflow-y-auto space-y-2 px-2">
        {getAllRowIndices().map((rowIndex) => (
          <div key={rowIndex} className="flex gap-2 items-center">
            <div className="w-12 md:w-16 text-right font-bold text-purple-600 text-sm md:text-base">
              x{calculateMultiplier(rowIndex)}
            </div>
            <div className="flex-1 grid grid-cols-5 gap-1 md:gap-2">
              {Array.from({ length: CARDS_PER_ROW }).map((_, columnIndex) => {
                const isRevealed = revealedCards[`${rowIndex}-${columnIndex}`];
                const isApple = applePositions[rowIndex] === columnIndex;
                const cardContent = isRevealed
                  ? revealedCards[`${rowIndex}-${columnIndex}`] === "apple"
                    ? "🍎"
                    : "🐍"
                  : currentRow === rowIndex
                    ? "?"
                    : "";

                return (
                  <button
                    key={columnIndex}
                    onClick={() => handleCardClick(rowIndex, columnIndex)}
                    disabled={
                      gameState !== "playing" ||
                      rowIndex !== currentRow ||
                      isRevealed === "apple"
                    }
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-base md:text-2xl relative
                      ${
                        isRevealed
                          ? "bg-white shadow-inner"
                          : isApple
                            ? "bg-green-200/50 shadow-md"
                            : "bg-red-200/50 shadow-md"
                      }
                      ${
                        currentRow === rowIndex && !isRevealed
                          ? "cursor-pointer hover:bg-gray-100/50"
                          : "cursor-default"
                      }
                    `}
                  >
                    {cardContent}
                    {!isRevealed && (
                      <span className="absolute text-[8px] md:text-xs bottom-1 right-1 text-gray-600">
                        {isApple ? "🍎" : "🐍"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Game Controls */}
      <div className="space-y-2">
        {gameState !== "playing" && (
          <Button
            onClick={handleStart}
            className="w-full h-12 md:h-14 bg-purple-600 hover:bg-purple-700 text-white text-lg md:text-xl"
          >
            {gameState === "waiting" ? "START GAME" : "PLAY AGAIN"}
          </Button>
        )}

        {gameState === "won" && (
          <div className="text-center text-green-600 font-bold text-base md:text-xl">
            You won! +{(stake * currentMultiplier - stake).toFixed(2)}
          </div>
        )}

        {gameState === "lost" && (
          <div className="text-center text-red-600 font-bold text-base md:text-xl">
            Game Over! Try again!
          </div>
        )}
      </div>
    </div>
  );
}
