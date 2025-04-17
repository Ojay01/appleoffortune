import { BetButton } from "../atoms/BetButton";


type BetControlsProps = {
  onMin: () => void;
  onMax: () => void;
  onDouble: () => void;
  onHalf: () => void;
};

export const BetControls = ({ onMin, onMax, onDouble, onHalf }: BetControlsProps) => (
  <div className="grid grid-cols-4 gap-2">
    <BetButton label="Min" onClick={onMin} />
    <BetButton label="X2" onClick={onDouble} />
    <BetButton label="X/2" onClick={onHalf} />
    <BetButton label="Max" onClick={onMax} />
  </div>
);