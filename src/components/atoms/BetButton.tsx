import { Button } from "@/components/ui/button";

type BetButtonProps = {
  label: string;
  onClick: () => void;
};

export const BetButton = ({ label, onClick }: BetButtonProps) => (
  <Button
    variant="secondary"
    className="h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm sm:text-base shadow-sm"
    onClick={onClick}
  >
    {label}
  </Button>
);
