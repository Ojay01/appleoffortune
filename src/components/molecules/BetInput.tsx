import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type BetInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minBet: number;
};

export const BetInput = ({ value, onChange, minBet }: BetInputProps) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    const val = parseFloat(value);
    if (!isNaN(val) && val < minBet) {
      setError(true);
    } else {
      setError(false);
    }
  }, [value, minBet]);

  return (
    <div className="w-full">
      <Input
        type="number"
        value={value}
        onChange={onChange}
        min={minBet}
        className={`w-full h-12 bg-green-900 text-white rounded-xl px-4 text-center text-xl font-medium border-0 shadow-md ${
          error ? "border border-red-500" : ""
        }`}
        placeholder={`Min ${minBet}`}
      />
      {error && (
        <div className="mt-1 text-red-500 text-sm text-center">
          Amount must be at least {minBet} ₣ 
        </div>
      )}
    </div>
  );
};
