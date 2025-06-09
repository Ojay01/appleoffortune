import { Wallet } from "lucide-react";

type SelectedWalletProps = {
  wallet: string;
  balance: number;
};

export const SelectedWallet = ({ wallet, balance }: SelectedWalletProps) => {
  const formattedBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  return (
    <div className="bg-green-900/50 rounded-xl p-4 shadow-md mb-6">
      <div className="flex items-center justify-between">
        <span className="text-gray-200 font-medium">
          {wallet === "balance"
            ? "Main Balance"
            : wallet === "bonus"
            ? "Bonus Balance"
            : wallet === "commission"
            ? "Commission Wallet"
            : "Withdrawable Balance"}
        </span>
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-gray-200" />
          <span className="text-gray-300 text-2xl font-bold">
            &#8355; {formattedBalance}
          </span>
        </div>
      </div>
    </div>
  );
};
