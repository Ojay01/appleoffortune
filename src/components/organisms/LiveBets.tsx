import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import { createApiClient } from "@/lib/api";

interface LiveBet {
  id: string;
  username: string;
  betAmount: number;
  timestamp: Date;
}

interface LiveBetsProps {
  className?: string;
  isMobile?: boolean;
  authToken: string;
}

const LiveBets = ({ className = "", isMobile = false, authToken}: LiveBetsProps) => {
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [isExpanded, setIsExpanded] = useState(isMobile);

useEffect(() => {
  const fetchLiveBets = async () => {
    if (!authToken) return;

    try {
      const api = createApiClient(authToken);
      const response = await api.get("/fruit-game/get-games");

      // const data = await response.json();
      const data = response.data;
      const mapped = data.games.map((game: any) => ({
        id: game.id,
        username: game.username,
        betAmount: game.stake,
        timestamp: new Date(game.created_at),
      }));

      setLiveBets(mapped);
    } catch (error) {
      console.error("Failed to fetch live bets:", error);
    }
  };

  fetchLiveBets();

  const interval = setInterval(fetchLiveBets, 10000); // refresh every 10s

  return () => clearInterval(interval);
}, [authToken]);


  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount}`;
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
            <p className="text-sm font-medium text-gray-900 truncate">{bet.username}</p>
            <p className="text-xs text-gray-500">{formatTimeAgo(bet.timestamp)}</p>
          </div>
          <div className="text-right ml-2">
            <p className="text-sm font-bold text-green-600">{formatAmount(bet.betAmount)}</p>
          </div>
        </div>
      ))}
      {bets.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No active bets right now
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className={`bg-white rounded-xl shadow-lg ${className}`}>
        <div
          onClick={handleHeaderClick}
          className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            <span className="font-semibold text-gray-800">Playing Now</span>
            <span className="text-sm text-gray-500">({liveBets.length})</span>
          </div>
          {isExpanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
        </div>
        {isExpanded && (
          <div className="px-4 pb-4 max-h-[624px] overflow-y-auto">
            {renderBetList(liveBets)}
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-green-600" />
          <h3 className="font-semibold text-gray-800">Live Bets</h3>
          <span className="text-sm text-gray-500">({liveBets.length})</span>
        </div>
      </div>
      <div className="p-4 max-h-80 overflow-y-auto">{renderBetList(liveBets)}</div>
    </div>
  );
};

export default LiveBets;
