"use client";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type GameState = "waiting" | "playing" | "won" | "lost" | "revealing";
type FruitType = "watermelon" | "strawberry" | "pawpaw" | "guava";
type CardContent = FruitType | "snake" | null;
type RevealedCards = Record<string, CardContent>;
type FlippingCards = Record<string, boolean>;
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

// Mock Button component
const Button = ({ children, onClick, className, disabled }: any) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded font-medium transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={disabled}
  >
    {children}
  </button>
);

// Mock toast function
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


// Calculate dynamic fruit count based on stake and successful rows
const calculateFruitCount = (stake: number, successfulRows: number): number => {
  let baseFruitCount: number;
  
  if (stake < 500) {
    baseFruitCount = Math.random() < 0.5 ? 3 : 4;
  } else if (stake < 1000) {
    baseFruitCount = Math.random() < 0.5 ? 2 : 3;
  } else if (stake < 5000) {
    const rand = Math.random();
    if (rand < 0.33) baseFruitCount = 1;
    else if (rand < 0.66) baseFruitCount = 2;
    else baseFruitCount = 3;
  } else {
    baseFruitCount = Math.random() < 0.5 ? 1 : 2;
  }
  
  if (successfulRows >= 5) {
    baseFruitCount = Math.max(1, baseFruitCount - 1);
  }
  if (successfulRows >= 10) {
    baseFruitCount = 1;
  }
  
  return baseFruitCount;
};

// Generate row configuration with dynamic difficulty
const generateRowConfiguration = (stake: number, successfulRows: number): RowConfiguration => {
  const numFruits = calculateFruitCount(stake, successfulRows);
  const positions = Array.from({ length: CARDS_PER_ROW }, (_, i) => i);
  
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  const fruitPositions = positions.slice(0, numFruits);
  const snakePositions = positions.slice(numFruits);
  
  return { fruitPositions, snakePositions };
};

export default function FruitFortuneGame({
  stake = 1000,
  onWin = () => {},
  onLose = () => {},
}: FruitFortuneGameProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [currentRow, setCurrentRow] = useState(INITIAL_ROWS - 1);
  const [revealedCards, setRevealedCards] = useState<RevealedCards>({});
  const [flippingCards, setFlippingCards] = useState<FlippingCards>({});
  const [gameGrid, setGameGrid] = useState<GameGrid>({});
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [extraRows, setExtraRows] = useState(0);
  const [successfulRows, setSuccessfulRows] = useState(0);

  useEffect(() => {
    const grid: GameGrid = {};
    for (let i = 0; i < INITIAL_ROWS; i++) {
      grid[i] = generateRowConfiguration(stake, 0);
    }
    setGameGrid(grid);
  }, [stake]);

  const addNewRow = () => {
    setExtraRows((prev) => prev + 1);
    const newRowIndex = -extraRows - 1;
    setGameGrid((prev) => ({
      ...prev,
      [newRowIndex]: generateRowConfiguration(stake, successfulRows),
    }));
    setCurrentRow(newRowIndex);
  };

  const revealAllCards = () => {
    const allRevealed: RevealedCards = {};
    const allFlipping: FlippingCards = {};
    
    Object.keys(gameGrid).forEach((rowIndex) => {
      const row = Number(rowIndex);
      const config = gameGrid[row];
      
      for (let columnIndex = 0; columnIndex < CARDS_PER_ROW; columnIndex++) {
        const key = `${row}-${columnIndex}`;
        
        if (!revealedCards[key]) {
          allFlipping[key] = true;
          
          if (config.fruitPositions.includes(columnIndex)) {
            allRevealed[key] = FRUITS[Math.floor(Math.random() * FRUITS.length)];
          } else {
            allRevealed[key] = "snake";
          }
        }
      }
    });
    
    setFlippingCards(allFlipping);
    
    setTimeout(() => {
      setRevealedCards(prev => ({ ...prev, ...allRevealed }));
      setFlippingCards({});
    }, 600);
  };

  const handleCardClick = (rowIndex: number, columnIndex: number): void => {
    if (
      gameState !== "playing" ||
      rowIndex !== currentRow ||
      revealedCards[`${rowIndex}-${columnIndex}`] ||
      flippingCards[`${rowIndex}-${columnIndex}`]
    ) {
      return;
    }

    const config = gameGrid[rowIndex];
    const isFruit = config.fruitPositions.includes(columnIndex);
    
    const cardContent = isFruit
      ? FRUITS[Math.floor(Math.random() * FRUITS.length)]
      : "snake";

    const cardKey = `${rowIndex}-${columnIndex}`;
    
    // Set both flipping and revealed immediately
    setFlippingCards(prev => ({ ...prev, [cardKey]: true }));
    setRevealedCards((prev) => ({
      ...prev,
      [cardKey]: cardContent,
    }));
    
    // Only remove the flipping state after animation completes
    setTimeout(() => {
      setFlippingCards(prev => {
        const newFlipping = { ...prev };
        delete newFlipping[cardKey];
        return newFlipping;
      });

      if (cardContent === "snake") {
        setGameState("revealing");
        createToastWithClose(
          "Game Over! You hit a snake! Revealing all cards...",
          "🐍"
        );

        setTimeout(() => {
          revealAllCards();
        }, 500);

        setTimeout(() => {
          setGameState("lost");
          onLose();
        }, 3500);
      } else {
        setSuccessfulRows(prev => prev + 1);
        
        if (rowIndex === Math.min(...Object.keys(gameGrid).map(Number))) {
          const newMultiplier = calculateMultiplier(rowIndex);
          setCurrentMultiplier(newMultiplier);

          addNewRow();
          createToastWithClose(
            `Perfect! New row added! Current multiplier: x${newMultiplier.toFixed(2)}`,
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
      }
    }, 600);
  };

  const calculateMultiplier = (rowIndex: number): number => {
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
    setFlippingCards({});
    setCurrentMultiplier(0);
    setExtraRows(0);
    setSuccessfulRows(0);

    const grid: GameGrid = {};
    for (let i = 0; i < INITIAL_ROWS; i++) {
      grid[i] = generateRowConfiguration(stake, 0);
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

  const getAllRowIndices = () => {
    const indices = [];
    for (let i = -extraRows; i < INITIAL_ROWS; i++) {
      indices.push(i);
    }
    return indices;
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-screen gap-4 p-4">
      <style jsx>{`
        .card-container {
          perspective: 1000px;
          width: 100%;
          height: 100%;
        }
        
        .card-flip {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        .card-flip.flipping {
          transform: rotateY(180deg);
        }
        
        .card-face {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .card-back {
          transform: rotateY(0deg);
          background-image: url('/bg.JPG');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
        }
        
        .card-back::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 8px;
        }
        
        .card-back-content {
          position: relative;
          z-index: 1;
          color: white;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .card-front {
          transform: rotateY(180deg);
        }
        
        .debug-hint {
          position: absolute;
          bottom: 4px;
          right: 4px;
          font-size: 10px;
          z-index: 2;
        }
      `}</style>
      
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
            <div className="w-12 md:w-16 text-right font-bold text-green-400 text-sm md:text-base">
              x{calculateMultiplier(rowIndex)}
            </div>
            <div className="flex-1 grid grid-cols-5 gap-1 md:gap-2">
              {Array.from({ length: CARDS_PER_ROW }).map((_, columnIndex) => {
                const cardKey = `${rowIndex}-${columnIndex}`;
                const revealedContent = revealedCards[cardKey];
                const isRevealed = !!revealedContent;
                const isFlipping = flippingCards[cardKey];
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
                      isRevealed ||
                      isFlipping
                    }
                    className={`
                      aspect-square rounded-lg relative overflow-hidden
                      ${currentRow === rowIndex && !isRevealed && !isFlipping ? 'hover:brightness-110 hover:scale-105 cursor-pointer' : 'cursor-default'}
                      transition-all duration-200
                    `}
                  >
                    <div className="card-container">
                      <div className={`card-flip ${isFlipping || isRevealed ? 'flipping' : ''}`}>
                        {/* Card Back (Hidden/Unrevealed) */}
                        <div className="card-face card-back">
                          <div className="card-back-content text-base md:text-2xl">
                            {!isRevealed && !isFlipping && cardContent}
                          </div>
                          {/* Debug hint */}
                          {process.env.NODE_ENV === 'development' && !isRevealed && !isFlipping && isFruitPosition && (
                            <div className="debug-hint text-white">
                              🍎
                            </div>
                          )}
                        </div>
                        
                        {/* Card Front (Revealed) */}
                        <div 
                          className={`card-face card-front text-base md:text-2xl ${
                            isRevealed
                              ? revealedContent === "snake"
                                ? "bg-red-100 shadow-inner"
                                : "bg-green-100 shadow-inner"
                              : 'bg-gray-100'
                          }`}
                        >
                          {isRevealed && (
                            <span>
                              {revealedContent === "snake"
                                ? "🐍"
                                : FRUIT_EMOJIS[revealedContent as FruitType]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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
          <div className="text-center text-green-400 font-bold text-base md:text-xl">
            You won! +{(stake * currentMultiplier - stake).toFixed(2)}
          </div>
        )}

        {gameState === "lost" && (
          <div className="text-center text-red-400 font-bold text-base md:text-xl">
            Game Over! Try again!
          </div>
        )}
      </div>
    </div>
  );
}