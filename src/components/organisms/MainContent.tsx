import { Button } from "@/components/ui/button";
// import { BalanceSummary } from "./BalanceSummary";
import { SelectedWallet } from "../molecules/SelectedWallet";
import { Header } from "../molecules/Header";
import { GameControls } from "./GameControls";

type MainContentProps = {
  walletBalances: {
    balance: number;
    bonus: number;
    with_balance: number;
  };
  selectedWallet: string;
  currentBalance: number;
  inputValue: string;
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
  walletBalances,
  selectedWallet,
  currentBalance,
  inputValue,
  isInputValid,
  handleReset,
  handleInputChange,
  handleWalletChange,
  handleMin,
  handleMax,
  handleDouble,
  handleHalf,
  handleStart,
}: MainContentProps) => (
  <div className="min-h-screen bg-gradient-to-b from-green-50 to-white relative pb-40 md:pb-32">
    <Header />

    <div className="max-w-md mx-auto px-4 py-6 md:max-w-screen-md lg:max-w-screen-lg">
      {/* <BalanceSummary
        balance={walletBalances.balance}
        bonus={walletBalances.bonus}
        withBalance={walletBalances.with_balance}
      /> */}

      <SelectedWallet wallet={selectedWallet} balance={currentBalance} />

      <Button
        className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium text-lg shadow-md mb-6"
        onClick={handleReset}
      >
        RESET
      </Button>
    </div>
    <div className="my-16">
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
  </div>
);
