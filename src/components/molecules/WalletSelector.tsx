import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WalletSelectorProps = {
  selectedWallet: string;
  onWalletChange: (value: string) => void;
};

export const WalletSelector = ({ selectedWallet, onWalletChange }: WalletSelectorProps) => (
  <Select value={selectedWallet} onValueChange={onWalletChange}>
    <SelectTrigger className="w-full h-12 rounded-xl bg-green-800 border-2 border-green-700">
      <SelectValue placeholder="Select Wallet" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="balance">Main Balance</SelectItem>
      <SelectItem value="bonus">Bonus Balance</SelectItem>
      <SelectItem value="with_balance">Withdrawable Balance</SelectItem>
    </SelectContent>
  </Select>
);
