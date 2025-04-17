import { Disc } from "lucide-react";

type BalanceCardProps = {
  title: string;
  amount: number;
  iconColor: string;
};

export const BalanceCard = ({ title, amount, iconColor }: BalanceCardProps) => (
  <div className="bg-white rounded-xl p-4 shadow-md">
    <div className="flex justify-between items-center">
      <span className="text-green-700 font-medium">{title}</span>
      <Disc className={`w-5 h-5 ${iconColor}`} />
    </div>
    <span className="text-green-800 text-xl font-bold block mt-1">
      &#8355; {amount}
    </span>
  </div>
);