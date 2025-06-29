import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Users, DollarSign } from "lucide-react";
import { createApiClient } from "@/lib/api";

interface LiveBet {
  id: string;
  username: string;
  betAmount: number;
  timestamp: Date;
}

interface Cashout {
  id: string;
  username: string;
  investAmount: number;
  multiplier: number;
  cashoutAmount: number;
  timestamp: Date;
}

interface LiveBetsProps {
  className?: string;
  isMobile?: boolean;
  authToken?: string;
  useFakeData?: boolean;
}

type TabType = "playing" | "cashouts";

const LiveBets = ({ className = "", isMobile = false, authToken, useFakeData = false }: LiveBetsProps) => {
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [cashouts, setCashouts] = useState<Cashout[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("playing");
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  useEffect(() => {
    const usernames = [
      "CryptoKing", "LuckyPlayer", "BetMaster", "WinnerCircle", "GoldRush",
      "DiamondHands", "RocketMan", "MoonWalker", "StarPlayer", "ChampionBet",
      "MegaWin", "PowerPlay", "EliteGamer", "VictoryLap", "JackpotJoe",
      "BigWinner", "FortuneSeeker", "CashCow", "MoneyMaker", "RichPlayer",
      "BankRoller", "HighStakes", "WealthBuilder", "ProfitHunter", "CoinFlip"
    ];

    // Generate fake bets to ensure we always have data (within 5 minutes)
    const generateFakeBets = (minCount: number = 3) => {
      const numBets = Math.floor(Math.random() * 5) + minCount; // minCount to minCount+4 bets
      const bets: LiveBet[] = [];
      
      for (let i = 0; i < numBets; i++) {
        const randomUsername = usernames[Math.floor(Math.random() * usernames.length)];
          const randomAmount = (Math.floor(Math.random() * 1000) + 1) * 25; 
        const randomSecondsAgo = Math.floor(Math.random() * 300); 
        
        bets.push({
          id: `fake-bet-${Date.now()}-${i}`,
          username: randomUsername,
          betAmount: randomAmount,
          timestamp: new Date(Date.now() - randomSecondsAgo * 1000),
        });
      }
      
      return bets;
    };

    // API data fetchers
    const fetchLiveBets = async (): Promise<LiveBet[]> => {
      if (!authToken) return [];

      try {
        const api = createApiClient(authToken);
        const response = await api.get("/fruit-game/get-games");

        const data = response.data;
        const mapped = data.games.map((game: any) => ({
          id: game.id,
          username: game.username,
          betAmount: game.stake,
          timestamp: new Date(game.created_at),
        }));

        return mapped;
      } catch (error) {
        console.error("Failed to fetch live bets:", error);
        return [];
      }
    };

const fetchCashouts = async (): Promise<Cashout[]> => {
  if (!authToken) return [];

  try {
    const api = createApiClient(authToken);
    const response = await api.get("/fruit-game/get-cashouts");

    const data = response.data;
    const mapped = data.games.map((game: any) => ({
      id: game.id,
      username: game.username,
      investAmount: game.stake, 
      multiplier: game.score / game.stake || 1, 
      cashoutAmount: game.score, 
      timestamp: new Date(game.created_at),
    }));

    return mapped;
  } catch (error) {
    console.error("Failed to fetch cashouts:", error);
    return [];
  }
};

    const updateData = async () => {
      if (useFakeData) {
        // Pure fake data mode (original behavior)
        setLiveBets(generateFakeBets(3).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        setCashouts([]); // No cashouts in fake mode
      } else {
        // Mixed mode: API + fake data for bets, API only for cashouts
        const [apiBetsData, apiCashoutsData] = await Promise.all([
          fetchLiveBets(),
          fetchCashouts()
        ]);

        // For live bets: combine API data with fake data to ensure we always have content
        // Filter API bets to only include those within 5 minutes
        const recentApiBets = apiBetsData.filter(bet => {
          const minutesAgo = (new Date().getTime() - bet.timestamp.getTime()) / (1000 * 60);
          return minutesAgo <= 5;
        });

        const fakeBetsCount = Math.max(0, 3 - recentApiBets.length); // Generate fake bets to reach minimum of 3
        const fakeBets = generateFakeBets(fakeBetsCount);
        const combinedBets = [...recentApiBets, ...fakeBets];
        
        // Sort by timestamp (newest first) and limit to reasonable number
        const sortedBets = combinedBets
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 12); // Limit to 12 total bets

        setLiveBets(sortedBets);
        setCashouts(apiCashoutsData); // Cashouts only from API
      }
    };

    // Initial data load
    updateData();

    // Update data every 15 seconds for fake data, 10 seconds for real data
    const interval = setInterval(updateData, useFakeData ? 15000 : 10000);

    return () => clearInterval(interval);
  }, [authToken, useFakeData]);

const formatTimeAgo = (timestamp: Date) => {
  const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};


  const formatAmount = (amount: number) => {
    // if (amount >= 10000) return `XAF ${(amount / 10000).toFixed(1)}k`;
    return `XAF ${amount}`;
  };

  const handleHeaderClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  const renderBetList = (bets: LiveBet[]) => (
    <div className="space-y-2">
      {bets.map((bet, index) => (
        <div
          key={bet.id}
          className={`flex justify-between items-center py-2 ${
            index < bets.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-400 truncate">{bet.username}</p>
            <p className="text-xs text-gray-500">{formatTimeAgo(bet.timestamp)}</p>
          </div>
          <div className="text-right ml-2">
            <p className="text-sm font-bold text-green-200">{formatAmount(bet.betAmount)}</p>
          </div>
        </div>
      ))}
      {bets.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          No active bets right now
        </div>
      )}
    </div>
  );

const renderCashoutList = (cashouts: Cashout[]) => (
  <div className="space-y-2">
    {cashouts.map((cashout, index) => (
      <div
        key={cashout.id}
        className={`flex justify-between items-center py-2 ${
          index < cashouts.length - 1 ? "border-b border-gray-100" : ""
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-400 truncate">{cashout.username}</p>
          <p className="text-xs text-gray-500">{formatTimeAgo(cashout.timestamp)}</p>
        </div>
        <div className="text-right ml-2 space-y-1">
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-gray-500">Stake:</span>
            <span className="text-xs text-white">{formatAmount(cashout.investAmount)}</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-gray-500">×{cashout.multiplier.toFixed(2)}</span>
            <span className="text-sm font-bold text-yellow-400">{formatAmount(cashout.cashoutAmount)}</span>
          </div>
        </div>
      </div>
    ))}
    {cashouts.length === 0 && (
      <div className="text-center py-4 text-gray-400 text-sm">
        No recent cashouts
      </div>
    )}
  </div>
);

  const renderTabs = () => (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => setActiveTab("playing")}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
          activeTab === "playing"
            ? "bg-green-600/20 text-green-400 border-b-2 border-green-400"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <Users size={16} />
          <span>Now Playing</span>
          <span className="text-xs">({liveBets.length})</span>
        </div>
      </button>
      <button
        onClick={() => setActiveTab("cashouts")}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
          activeTab === "cashouts"
            ? "bg-yellow-600/20 text-yellow-400 border-b-2 border-yellow-400"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <DollarSign size={16} />
          <span>Cashouts</span>
          <span className="text-xs">({cashouts.length})</span>
        </div>
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div className={`bg-green-900/50 rounded-xl shadow-lg ${className}`}>
        <div
          onClick={handleHeaderClick}
          className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-green-900 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            <span className="font-semibold text-gray-300">Game Activity</span>
            <span className="text-sm text-gray-300">({liveBets.length + cashouts.length})</span>
          </div>
          {isExpanded ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
        </div>
        {isExpanded && (
          <div className="pb-4">
            {renderTabs()}
            <div className="px-4 pt-4 max-h-52 overflow-y-auto">
              {activeTab === "playing" ? renderBetList(liveBets) : renderCashoutList(cashouts)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className={`bg-gray-900/50 rounded-xl shadow-lg ${className}`}>
      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-green-600" />
          <h3 className="font-semibold text-gray-300">Game Activity</h3>
        </div>
        {renderTabs()}
      </div>
      <div className="p-4 max-h-80 overflow-y-auto">
        {activeTab === "playing" ? renderBetList(liveBets) : renderCashoutList(cashouts)}
      </div>
    </div>
  );
};

export default LiveBets;