import { Button } from "@/components/ui/button";
import { WalletSelector } from "../molecules/WalletSelector";
import { BetControls } from "../molecules/BetControls";
import { BetInput } from "../molecules/BetInput";

type GameControlsProps = {
  selectedWallet: string;
  onWalletChange: (value: string) => void;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMin: () => void;
  onMax: () => void;
  onDouble: () => void;
  onHalf: () => void;
  onStart: () => void;
  isInputValid: boolean;
  minBet: number;
};

export const GameControls = ({
  selectedWallet,
  onWalletChange,
  inputValue,
  onInputChange,
  onMin,
  onMax,
  onDouble,
  onHalf,
  onStart,
  isInputValid,
  minBet,
}: GameControlsProps) => (
  <div className="fixed bottom-0 left-0 right-0 border-t border-green-950 bg-green-950 shadow-lg pt-3 pb-6 px-4">
    <div className="max-w-md mx-auto space-y-3 md:max-w-screen-md lg:max-w-screen-lg">
      <WalletSelector
        selectedWallet={selectedWallet}
        onWalletChange={onWalletChange}
      />
      <BetControls
        onMin={onMin}
        onMax={onMax}
        onDouble={onDouble}
        onHalf={onHalf}
      />
      <BetInput value={inputValue} onChange={onInputChange} minBet={minBet} />
      <Button
        className="w-full h-12 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white rounded-xl font-medium text-lg shadow-md"
        onClick={onStart}
        disabled={!isInputValid}
      >
        START HARVESTING
      </Button>
    </div>
  </div>
);
