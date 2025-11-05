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
Select how your photos will be arranged
</p>
</div>
      {/* Layout Selector */}
  <div className="max-w-2xl mx-auto">
    <LayoutSelector
      selectedLayout={selectedLayout}
      onLayoutChange={onLayoutSelect}
    />
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
    {/* Standard Layout Card */}
    <div className="p-6 bg-card rounded-lg border border-border">
      <div className="mb-4">
        <div className="w-full aspect-[3/2] bg-muted rounded border-2 border-dashed border-border flex items-center justify-center relative">
          <div className="grid grid-cols-4 grid-rows-2 gap-1 p-2 w-full h-full">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-primary/20 rounded border border-primary/30" />
            ))}
          </div>
          <div className="absolute bottom-2 right-2 bg-background px-2 py-1 rounded text-xs font-semibold">
            4×2
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-foreground mb-2">Standard Layout</h3>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>• 8 passport photos (4×2 grid)</li>
        <li>• 6×4 inch sheet (landscape)</li>
        <li>• Exact size: 3.5×4.5cm per photo</li>
        <li>• Black borders for easy cutting</li>
        <li>• Official passport requirements</li>
      </ul>
    </div>

    {/* Custom Layout Card */}
    <div className="p-6 bg-card rounded-lg border border-border">
      <div className="mb-4">
        <div className="w-full aspect-[2/3] bg-muted rounded border-2 border-dashed border-border flex items-center justify-center relative">
          <div className="grid grid-cols-3 grid-rows-4 gap-0.5 p-2 w-full h-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-primary/20 rounded border border-primary/30" />
            ))}
          </div>
          <div className="absolute bottom-2 right-2 bg-background px-2 py-1 rounded text-xs font-semibold">
            3×4
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-foreground mb-2">Custom Layout</h3>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>• 12 passport photos (3×4 grid)</li>
        <li>• 4×6 inch sheet (portrait)</li>
        <li>• Proportional passport size</li>
        <li>• 3px gaps between photos</li>
        <li>• Maximum value per sheet</li>
      </ul>
    </div>
  </div>

  {/* Info Card */}
  <div className="bg-muted/50 rounded-lg p-4 border border-border max-w-2xl mx-auto">
    <p className="text-sm text-muted-foreground text-center">
      📏 All sheets printed at 300 DPI for professional quality
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
