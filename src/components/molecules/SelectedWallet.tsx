import { Wallet } from "lucide-react";

type SelectedWalletProps = {
  wallet: string;
  balance: number;
};

export const SelectedWallet = ({ wallet, balance }: SelectedWalletProps) => (
  <div className="bg-white rounded-xl p-4 shadow-md mb-6">
    <div className="flex items-center justify-between">
      <span className="text-green-700 font-medium">
        {wallet === "balance"
          ? "Main Balance"
          : wallet === "bonus"
          ? "Bonus Balance"
          : "Withdrawable Balance"}
      </span>
      <div className="flex items-center gap-2">
        <Wallet className="w-6 h-6 text-green-700" />
        <span className="text-green-800 text-2xl font-bold">
          &#8355; {balance}
        </span>
      </div>
    </div>
  </div>
);
