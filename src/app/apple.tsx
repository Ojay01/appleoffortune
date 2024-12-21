"use client";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";
import { X } from "lucide-react";

type GameState = "waiting" | "playing" | "won" | "lost" | "revealing";
type FruitType = "watermelon" | "strawberry" | "pawpaw" | "guava";
type CardContent = FruitType | "snake" | null;
type RevealedCards = Record<string, CardContent>;
type FruitPositions = Record<number, number>;

interface FruitFortuneGameProps {
  stake: number;
  onWin: (amount: number) => void;
  onLose: () => void;
}

const INITIAL_ROWS = 10;
const CARDS_PER_ROW = 5;

const FRUITS: FruitType[] = ["watermelon", "strawberry", "pawpaw", "guava"];

const FRUIT_EMOJIS: Record<FruitType, string> = {
  watermelon: "🍉",
  strawberry: "🍓",
  pawpaw: "🥑",
  guava: "🍈",
};

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
    },
  );
};

export default function FruitFortuneGame({
  stake,
  onWin,
  onLose,
}: FruitFortuneGameProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [currentRow, setCurrentRow] = useState(INITIAL_ROWS - 1);
  const [revealedCards, setRevealedCards] = useState<RevealedCards>({});
  const [fruitPositions, setFruitPositions] = useState<FruitPositions>({});
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [extraRows, setExtraRows] = useState(0);

  useEffect(() => {
    const positions: FruitPositions = {};
    for (let i = 0; i < INITIAL_ROWS; i++) {
      positions[i] = Math.floor(Math.random() * CARDS_PER_ROW);
    }
    setFruitPositions(positions);
  }, []);

  const addNewRow = () => {
    setExtraRows((prev) => prev + 1);
    const newRowIndex = -extraRows - 1; // Negative indices for new rows above
    setFruitPositions((prev) => ({
      ...prev,
      [newRowIndex]: Math.floor(Math.random() * CARDS_PER_ROW),
    }));
    setCurrentRow(newRowIndex);
  };

  const revealAllCards = () => {
    const allRevealed: RevealedCards = {};
    Object.keys(fruitPositions).forEach((rowIndex) => {
      const row = Number(rowIndex);
      for (let columnIndex = 0; columnIndex < CARDS_PER_ROW; columnIndex++) {
        const key = `${row}-${columnIndex}`;
        const fruitAtPosition =
          fruitPositions[row] === columnIndex
            ? FRUITS[Math.floor(Math.random() * FRUITS.length)]
            : "snake";
        allRevealed[key] = fruitAtPosition;
      }
    });
    setRevealedCards(allRevealed);
  };

  const handleCardClick = (rowIndex: number, columnIndex: number): void => {
    if (
      gameState !== "playing" ||
      rowIndex !== currentRow ||
      revealedCards[`${rowIndex}-${columnIndex}`]
    ) {
      return;
    }

    const fruitAtPosition =
      fruitPositions[rowIndex] === columnIndex
        ? FRUITS[Math.floor(Math.random() * FRUITS.length)]
        : "snake";

    setRevealedCards((prev) => ({
      ...prev,
      [`${rowIndex}-${columnIndex}`]: fruitAtPosition,
    }));

    if (fruitAtPosition === "snake") {
      setGameState("revealing");
      createToastWithClose(
        "Game Over! You hit a snake! Revealing all cards...",
        "🐍",
      );

      // Reveal all cards with a 3-second delay before ending the game
      revealAllCards();

      setTimeout(() => {
        setGameState("lost");
        onLose();
      }, 3000);
    } else if (
      rowIndex === Math.min(...Object.keys(fruitPositions).map(Number))
    ) {
      // When at the top row, add a new row and continue
     
      const newMultiplier = calculateMultiplier(rowIndex);
      setCurrentMultiplier(newMultiplier);
      addNewRow();
      createToastWithClose(
        `Perfect! New row added! Current multiplier: x${newMultiplier.toFixed(2)}`,
        "🎯",
      );
    } else {
      setCurrentRow(rowIndex - 1);
      const newMultiplier = calculateMultiplier(rowIndex - 1);
      setCurrentMultiplier(newMultiplier);
      createToastWithClose(
        ` Found! Current multiplier: x${newMultiplier.toFixed(2)}`,
        FRUIT_EMOJIS[fruitAtPosition as FruitType],
      );
    }
  };

  const calculateMultiplier = (rowIndex: number): number => {
    // For original rows (positive indices), keep the existing logic
    if (rowIndex >= 0) {
      const baseMultiplier = 1.25;
      const rowsAboveBase = INITIAL_ROWS - rowIndex - 1;
      return Number((baseMultiplier + rowsAboveBase * 0.25).toFixed(2));
    }
  
    // For new rows (negative indices)
    const newRowNumber = Math.abs(rowIndex);
    
    // First 10 new rows
    if (newRowNumber <= 10) {
      return Number((4.0 + (newRowNumber - 1) * 0.5).toFixed(2));
    }
    
    // After 10 rows
    const completedSets = Math.floor((newRowNumber - 11) / 10);
    const remainingRows = (newRowNumber - 11) % 10;
    
    // Base value after first 10 rows is 9.0
    // Add 20 for each completed set of 10 rows
    // Add 2 for each remaining row
    const multiplier = 9.0 + (completedSets * 20) + (remainingRows * 2) + 2;
    
    return Number(multiplier.toFixed(2));
  };

  const handleStart = (): void => {
    setGameState("playing");
    setCurrentRow(INITIAL_ROWS - 1);
    setRevealedCards({});
    setCurrentMultiplier(0);
    setExtraRows(0);

    const positions: FruitPositions = {};
    for (let i = 0; i < INITIAL_ROWS; i++) {
      positions[i] = Math.floor(Math.random() * CARDS_PER_ROW);
    }
    setFruitPositions(positions);
    createToastWithClose(
      "Game Started! Find the fruits and avoid the snakes. Good luck!",
      "🎮",
    );
  };

  const handleCashout = (): void => {
    if (gameState === "playing") {
      setGameState("won");
      const winAmount = stake * currentMultiplier;
      onWin(winAmount);
      createToastWithClose(
        `Cashed Out! You won ${(winAmount - stake).toFixed(2)}!`,
        "💰",
      );
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

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4 p-4">
      {/* Top Balance Display */}
      <div className="bg-green-100 rounded-xl p-4 shadow-lg flex justify-between items-center">
        <span className="text-lg md:text-2xl font-bold text-green-800">
          💰 {stake * (currentMultiplier || 1)}
        </span>
        {gameState === "playing" && (
          <Button
            onClick={handleCashout}
            className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
          >
            CASH OUT x{currentMultiplier}
          </Button>
        )}
      </div>

      {/* Game Grid */}
      <div className="flex-1 overflow-y-auto space-y-2 px-2">
        {getAllRowIndices().map((rowIndex) => (
          <div key={rowIndex} className="flex gap-2 items-center">
            <div className="w-12 md:w-16 text-right font-bold text-green-600 text-sm md:text-base">
              x{calculateMultiplier(rowIndex)}
            </div>
            <div className="flex-1 grid grid-cols-5 gap-1 md:gap-2">
              {Array.from({ length: CARDS_PER_ROW }).map((_, columnIndex) => {
                const revealedContent =
                  revealedCards[`${rowIndex}-${columnIndex}`];
                const isRevealed = !!revealedContent;

                const cardContent = isRevealed
                  ? revealedContent === "snake"
                    ? "🐍"
                    : FRUIT_EMOJIS[revealedContent as FruitType]
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
                      isRevealed
                    }
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-base md:text-2xl relative
                      ${
                        isRevealed
                          ? "bg-green-100 shadow-inner"
                          : "bg-green-200/50 shadow-md"
                      }
                      ${
                        currentRow === rowIndex && !isRevealed
                          ? "cursor-pointer hover:bg-green-100/50"
                          : "cursor-default"
                      }
                    `}
                  >
                    {cardContent}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Game Controls */}
      <div className="space-y-2">
        {gameState !== "playing" && gameState !== "revealing" && (
          <Button
            onClick={handleStart}
            className="w-full h-12 md:h-14 bg-green-600 hover:bg-green-700 text-white text-lg md:text-xl"
          >
            {gameState === "waiting" ? "START GAME" : "PLAY AGAIN"}
          </Button>
        )}

        {gameState === "won" && (
          <div className="text-center text-green-700 font-bold text-base md:text-xl">
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
