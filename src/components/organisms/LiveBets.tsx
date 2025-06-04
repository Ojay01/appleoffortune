import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";

interface LiveBet {
  id: string;
  username: string;
  betAmount: number;
  timestamp: Date;
}

interface LiveBetsProps {
  className?: string;
  isMobile?: boolean;
}

const LiveBets = ({ className = "", isMobile = false }: LiveBetsProps) => {
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  // Mock data generator for demo - replace with real data source
  useEffect(() => {
    const generateMockBet = (): LiveBet => {
      const usernames = [
        "FruitHunter92", "SnakeSlayer", "LuckyPlayer", "BigBetter", 
        "CasinoKing", "GamerX", "WinnerTM", "Player123", "ProGamer",
        "BetMaster", "Challenger", "RiskTaker", "FortuneSeeker"
      ];
      
      const betAmounts = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        username: usernames[Math.floor(Math.random() * usernames.length)],
        betAmount: betAmounts[Math.floor(Math.random() * betAmounts.length)],
        timestamp: new Date()
      };
    };

    // Initial bets
    const initialBets = Array.from({ length: 8 }, generateMockBet);
    setLiveBets(initialBets);

    // Add new bet every 3-8 seconds
    const interval = setInterval(() => {
      setLiveBets(prev => {
        const newBet = generateMockBet();
        const updated = [newBet, ...prev];
        return updated.slice(0, 20); // Keep only last 20 bets
      });
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, []);

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

  if (isMobile) {
    return (
      <div className={`bg-white rounded-xl shadow-lg ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            <span className="font-semibold text-gray-800">Live Bets</span>
            <span className="text-sm text-gray-500">({liveBets.length})</span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {liveBets.slice(0, 6).map((bet) => (
                <div key={bet.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {bet.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(bet.timestamp)}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold text-green-600">
                      {formatAmount(bet.betAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-green-600" />
          <h3 className="font-semibold text-gray-800">Live Bets</h3>
          <span className="text-sm text-gray-500">({liveBets.length})</span>
        </div>
      </div>
      
      <div className="p-4 max-h-80 overflow-y-auto">
        <div className="space-y-3">
          {liveBets.map((bet) => (
            <div key={bet.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {bet.username}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(bet.timestamp)}
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="text-sm font-bold text-green-600">
                  {formatAmount(bet.betAmount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveBets;