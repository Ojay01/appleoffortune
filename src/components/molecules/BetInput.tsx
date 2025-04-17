import { Input } from "@/components/ui/input";

type BetInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const BetInput = ({ value, onChange }: BetInputProps) => (
  <Input
    type="text"
    value={value}
    onChange={onChange}
    className="w-full h-12 bg-green-900 text-white rounded-xl px-4 text-center text-xl font-medium border-0 shadow-md"
    placeholder="Enter amount"
  />
);