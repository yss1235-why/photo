import { LayoutSelector } from "@/components/LayoutSelector";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Step5LayoutProps {
  selectedLayout: "standard" | "custom";
  onLayoutSelect: (layout: "standard" | "custom") => void;
}

const Step5Layout = ({ selectedLayout, onLayoutSelect }: Step5LayoutProps) => {
  const handleContinue = () => {
    onLayoutSelect(selectedLayout);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Choose Print Layout
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Select how your photos will be arranged on the sheet
        </p>
      </div>

      {/* Layout Selector */}
      <div className="max-w-2xl mx-auto">
        <LayoutSelector
          selectedLayout={selectedLayout}
          onLayoutChange={onLayoutSelect}
        />
      </div>

      {/* Layout Preview Info */}
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="mb-4">
            <div className="w-full aspect-[3/4] bg-muted rounded border-2 border-dashed border-border flex items-center justify-center relative">
              <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-primary/20 rounded border border-primary/30" />
                ))}
              </div>
              <div className="absolute bottom-2 right-2 bg-background px-2 py-1 rounded text-xs font-semibold">
                3×4
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Standard Layout</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• 12 passport photos (3×4 grid)</li>
            <li>• 4×6 inch sheet (10×15 cm)</li>
            <li>• Standard passport size</li>
            <li>• Ready to cut</li>
          </ul>
        </div>

        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="mb-4">
            <div className="w-full aspect-[3/4] bg-muted rounded border-2 border-dashed border-border flex items-center justify-center relative">
              <div className="grid grid-cols-2 gap-2 p-2 w-full h-full">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-primary/20 rounded border border-primary/30" />
                ))}
              </div>
              <div className="absolute bottom-2 right-2 bg-background px-2 py-1 rounded text-xs font-semibold">
                2×3
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Custom Layout</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• 6 larger photos (2×3 grid)</li>
            <li>• 4×6 inch sheet (10×15 cm)</li>
            <li>• Flexible sizing</li>
            <li>• More spacing</li>
          </ul>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground text-center">
          📏 All photos are cropped to standard passport dimensions (3.5cm × 4.5cm) and printed at 300 DPI for best quality
        </p>
      </div>

      {/* Continue Button */}
      <div className="max-w-md mx-auto">
        <Button
          onClick={handleContinue}
          className="w-full gap-2"
          size="lg"
        >
          Preview Final Sheet
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step5Layout;
