import { ProcessingMode } from "@/types";
import { ModeSelector } from "@/components/ModeSelector";

interface Step2ModeSelectProps {
  onModeSelect: (mode: ProcessingMode) => void;
  selectedMode: ProcessingMode;
}

const Step2ModeSelect = ({ onModeSelect, selectedMode }: Step2ModeSelectProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Choose Processing Mode
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Select how you want to process your photo
        </p>
      </div>

      <ModeSelector 
        selectedMode={selectedMode} 
        onModeSelect={onModeSelect} 
      />

      {/* Info Section */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="text-lg">ℹ️</span>
          What's the difference?
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Passport Mode:</strong> Automatic processing with standard settings. 
            Best for official documents and quick results.
          </div>
          <div>
            <strong className="text-foreground">Studio Mode:</strong> Full control over enhancement levels. 
            Perfect for custom adjustments and professional results.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2ModeSelect;
