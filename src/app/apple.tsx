"use client";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";
import { X } from "lucide-react";

type GameState = "waiting" | "playing" | "won" | "lost" | "revealing";
type FruitType = "watermelon" | "strawberry" | "pawpaw" | "guava";
type CardContent = FruitType | "snake" | null;
type RevealedCards = Record<string, CardContent>;
type RowConfiguration = {
  fruitPositions: number[];
  snakePositions: number[];
};
type GameGrid = Record<number, RowConfiguration>;

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

// Generate random row configuration with 1-4 fruits (never 0 or 5)
const generateRowConfiguration = (): RowConfiguration => {
  const numFruits = Math.floor(Math.random() * 4) + 1; // 1, 2, 3, or 4 fruits
  const positions = Array.from({ length: CARDS_PER_ROW }, (_, i) => i);
  
  // Shuffle positions array
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  const fruitPositions = positions.slice(0, numFruits);
  const snakePositions = positions.slice(numFruits);
  
  return { fruitPositions, snakePositions };
};

export default function FruitFortuneGame({
  stake,
  onWin,
  onLose,
}: FruitFortuneGameProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [currentRow, setCurrentRow] = useState(INITIAL_ROWS - 1);
  const [revealedCards, setRevealedCards] = useState<RevealedCards>({});
  const [gameGrid, setGameGrid] = useState<GameGrid>({});
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [extraRows, setExtraRows] = useState(0);

  useEffect(() => {
    const grid: GameGrid = {};
    for (let i = 0; i < INITIAL_ROWS; i++) {
      grid[i] = generateRowConfiguration();
    }
    setGameGrid(grid);
  }, []);

  const addNewRow = () => {
    setExtraRows((prev) => prev + 1);
    const newRowIndex = -extraRows - 1; // Negative indices for new rows above
    setGameGrid((prev) => ({
      ...prev,
      [newRowIndex]: generateRowConfiguration(),
    }));
    setCurrentRow(newRowIndex);
  };

  const revealAllCards = () => {
    const allRevealed: RevealedCards = {};
    Object.keys(gameGrid).forEach((rowIndex) => {
      const row = Number(rowIndex);
      const config = gameGrid[row];
      
      for (let columnIndex = 0; columnIndex < CARDS_PER_ROW; columnIndex++) {
        const key = `${row}-${columnIndex}`;
        
        if (config.fruitPositions.includes(columnIndex)) {
          // Random fruit at this position
          allRevealed[key] = FRUITS[Math.floor(Math.random() * FRUITS.length)];
        } else {
          // Snake at this position
          allRevealed[key] = "snake";
        }
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

    const config = gameGrid[rowIndex];
    const isFruit = config.fruitPositions.includes(columnIndex);
    
    const cardContent = isFruit
      ? FRUITS[Math.floor(Math.random() * FRUITS.length)]
      : "snake";

    setRevealedCards((prev) => ({
      ...prev,
      [`${rowIndex}-${columnIndex}`]: cardContent,
    }));

    if (cardContent === "snake") {
      setGameState("revealing");
      createToastWithClose(
        "Game Over! You hit a snake! Revealing all cards...",
        "🐍"
      );

      // Reveal all cards with a 3-second delay before ending the game
      revealAllCards();

      setTimeout(() => {
        setGameState("lost");
        onLose();
      }, 3000);
    } else if (
      rowIndex === Math.min(...Object.keys(gameGrid).map(Number))
    ) {
      // When at the top row, add a new row and continue
      const newMultiplier = calculateMultiplier(rowIndex);
      setCurrentMultiplier(newMultiplier);

      addNewRow();
      createToastWithClose(
        `Perfect! New row added! Current multiplier: x${newMultiplier.toFixed(
          2
        )}`,
        "🎯"
      );
    } else {
      const newMultiplier = calculateMultiplier(rowIndex);
      setCurrentMultiplier(newMultiplier);
      setCurrentRow(rowIndex - 1);
      createToastWithClose(
        `Fruit Found! Current multiplier: x${newMultiplier.toFixed(2)}`,
        FRUIT_EMOJIS[cardContent as FruitType]
      );
    }
  };

  const calculateMultiplier = (rowIndex: number): number => {
    // For original rows (positive indices), keep the existing logic
    if (rowIndex >= 8) {
      const baseMultiplier = 1.25;
      const rowsAboveBase = INITIAL_ROWS - rowIndex - 1;
      return Number((baseMultiplier + rowsAboveBase * 0.25).toFixed(2));
    }
    if (rowIndex >= 6) {
      const baseMultiplier = 1.0;
      const rowsAboveBase = INITIAL_ROWS - rowIndex - 1;
      return Number((baseMultiplier + rowsAboveBase * 0.5).toFixed(2));
    }
    if (rowIndex >= 3 && rowIndex <= 5) {
      const baseMultiplier = 0.5;
      const rowsAboveBase = INITIAL_ROWS - rowIndex - 2;
      return Number((baseMultiplier + rowsAboveBase * 1).toFixed(2));
    }
    if (rowIndex >= 0 && rowIndex <= 3) {
      const baseMultiplier = 1.5;
      const rowsAboveBase = INITIAL_ROWS - rowIndex - 5;
      return Number((baseMultiplier + rowsAboveBase * 2).toFixed(2));
    }
    if (rowIndex < 0) {
      const absoluteIndex = Math.abs(rowIndex);
      const baseValue = 13;
      const value = baseValue + (absoluteIndex * (absoluteIndex + 1)) / 2;
      return Number(value.toFixed(2));
    }

    return 0;
  };

  const handleStart = (): void => {
    setGameState("playing");
    setCurrentRow(INITIAL_ROWS - 1);
    setRevealedCards({});
    setCurrentMultiplier(0);
    setExtraRows(0);

    const grid: GameGrid = {};
    for (let i = 0; i < INITIAL_ROWS; i++) {
      grid[i] = generateRowConfiguration();
    }
    setGameGrid(grid);
    
    createToastWithClose(
      "Game Started! Find the fruits and avoid the snakes. Good luck!",
      "🎮"
    );
  };

  const handleCashout = (): void => {
    if (gameState === "playing") {
      setGameState("won");
      const winAmount = stake * currentMultiplier;
      onWin(winAmount);
      createToastWithClose(
        `Cashed Out! You won ${(winAmount - stake).toFixed(2)}!`,
        "💰"
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

  // Get win probability for display (fruits/total cards)
  const getWinProbability = (rowIndex: number): string => {
    const config = gameGrid[rowIndex];
    if (!config) return "0/5";
    return `${config.fruitPositions.length}/5`;
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
            <div className="w-8 text-center text-xs text-gray-500">
              {getWinProbability(rowIndex)}
            </div>
            <div className="flex-1 grid grid-cols-5 gap-1 md:gap-2">
              {Array.from({ length: CARDS_PER_ROW }).map((_, columnIndex) => {
                const revealedContent =
                  revealedCards[`${rowIndex}-${columnIndex}`];
                const isRevealed = !!revealedContent;
                const config = gameGrid[rowIndex];
                const isFruitPosition = config?.fruitPositions.includes(columnIndex);

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
                          ? revealedContent === "snake"
                            ? "bg-red-100 shadow-inner"
                            : "bg-green-100 shadow-inner"
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
                    {/* Debug hint - remove in production */}
                    {process.env.NODE_ENV === 'development' && !isRevealed && isFruitPosition && (
                      <span className="absolute text-[8px] md:text-xs bottom-1 right-1 text-green-600">
                        🍎
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