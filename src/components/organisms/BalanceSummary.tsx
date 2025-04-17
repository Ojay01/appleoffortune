import { BalanceCard } from "../atoms/BalanceCard"

type BalanceSummaryProps = {
  balance: number;
  bonus: number;
  withBalance: number;
};

export const BalanceSummary = ({ balance, bonus, withBalance }: BalanceSummaryProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
    <BalanceCard title="Main Balance" amount={balance} iconColor="text-green-500" />
    <BalanceCard title="Bonus Balance" amount={bonus} iconColor="text-amber-500" />
    <BalanceCard title="Withdrawable" amount={withBalance} iconColor="text-blue-500" />
  </div>
);