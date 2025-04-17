import { Apple } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Apple className="h-8 w-8 text-yellow-300" />
      <h1 className="text-2xl font-bold text-white">FortuneFruits</h1>
    </div>
  );
};