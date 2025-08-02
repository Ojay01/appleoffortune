import { Button } from "@/components/ui/button";
// import { BalanceSummary } from "./BalanceSummary";
import { SelectedWallet } from "../molecules/SelectedWallet";
import { Header } from "../molecules/Header";
import { GameControls } from "./GameControls";
import LiveBets from "./LiveBets";
import { useFruitSettings } from "@/lib/hooks/useSettings";

type MainContentProps = {
  walletBalances: {
    balance: number;
    bonus: number;
    with_balance: number;
    commission: number;
  };
  selectedWallet: string;
  currentBalance: number;
  inputValue: string;
  authToken: string;
  isInputValid: boolean;
  handleReset: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWalletChange: (value: string) => void;
  handleMin: () => void;
  handleMax: () => void;
  handleDouble: () => void;
  handleHalf: () => void;
  handleStart: () => void;
};
export const MainContent = ({
  selectedWallet,
  currentBalance,
  inputValue,
  isInputValid,
  authToken,
  handleReset,
  handleInputChange,
  handleWalletChange,
  handleMin,
  handleMax,
  handleDouble,
  handleHalf,
  handleStart,
}: MainContentProps) => {
const fruitSettings = useFruitSettings();
const minBet = fruitSettings.settings?.min_bet ?? 1;


  return (
    <div className="relative min-h-screen pb-40 md:pb-32 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/headerbg.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-75 z-0" />
      <div className="relative z-10">
        <Header />

        <div className="max-w-md mx-auto px-4 py-4 md:max-w-screen-md lg:max-w-screen-lg">
          <SelectedWallet wallet={selectedWallet} balance={currentBalance} />
          <Button
            className="w-full py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium text-lg shadow-md"
            onClick={handleReset}
          >
            RESET
          </Button>
        </div>

        <div className="max-w-md mx-auto px-4 md:max-w-screen-md lg:max-w-screen-lg">
          <GameControls
            selectedWallet={selectedWallet}
            onWalletChange={handleWalletChange}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onMin={handleMin}
            onMax={handleMax}
            onDouble={handleDouble}
            onHalf={handleHalf}
            onStart={handleStart}
            isInputValid={isInputValid}
            minBet={minBet} 
          />
        </div>

        <div className="max-w-md mx-auto px-4 mb-28 md:max-w-screen-md lg:max-w-screen-lg">
          <LiveBets isMobile={true} authToken={authToken} />
        </div>
      </div>
    </div>
  );
};