import { Button } from "@/components/ui/button";
// import { BalanceSummary } from "./BalanceSummary";
import { SelectedWallet } from "../molecules/SelectedWallet";
import { Header } from "../molecules/Header";
import { GameControls } from "./GameControls";
import LiveBets from "./LiveBets";

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
}: MainContentProps) => (
  <div className="relative min-h-screen pb-40 md:pb-32 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bgimg.jpg')" }}>
    {/* Overlay */}
    <div className="absolute inset-0 bg-black bg-opacity-75 z-0" />

    {/* Main Content */}
    <div className="relative z-10">
      <Header />

      <div className="max-w-md mx-auto px-4 py-6 md:max-w-screen-md lg:max-w-screen-lg">
        <SelectedWallet wallet={selectedWallet} balance={currentBalance} />

        <Button
          className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium text-lg shadow-md mb-6"
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
        />
      </div>

      <div className="max-w-md mx-auto px-4 mt-10 md:max-w-screen-md lg:max-w-screen-lg">
        <LiveBets isMobile={true} authToken={authToken} />
      </div>
    </div>
  </div>
);
