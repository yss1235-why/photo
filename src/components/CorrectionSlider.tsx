import { Slider } from "@/components/ui/slider";

interface CorrectionSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

export const CorrectionSlider = ({ 
  value, 
  onChange, 
  label = "Color Enhancement",
  disabled = false 
}: CorrectionSliderProps) => {
  return (
    <div className="space-y-3 p-6 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {value}%
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={100}
        step={1}
        disabled={disabled}
        className="py-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Natural</span>
        <span>Enhanced</span>
      </div>
    </div>
  );
};
