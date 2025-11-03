import { Grid3x3, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutSelectorProps {
  selectedLayout: "standard" | "custom";
  onLayoutChange: (layout: "standard" | "custom") => void;
  disabled?: boolean;
}

export const LayoutSelector = ({ 
  selectedLayout, 
  onLayoutChange,
  disabled = false 
}: LayoutSelectorProps) => {
  return (
    <div className="space-y-3 p-6 bg-card rounded-lg border border-border shadow-sm">
      <label className="text-sm font-medium text-foreground block">
        Print Layout
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={selectedLayout === "standard" ? "default" : "outline"}
          onClick={() => onLayoutChange("standard")}
          disabled={disabled}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <Grid3x3 className="w-6 h-6" />
          <div className="text-xs">
            <div className="font-semibold">Standard</div>
            <div className="text-muted-foreground">3×4 Passport</div>
          </div>
        </Button>
        <Button
          variant={selectedLayout === "custom" ? "default" : "outline"}
          onClick={() => onLayoutChange("custom")}
          disabled={disabled}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <Layout className="w-6 h-6" />
          <div className="text-xs">
            <div className="font-semibold">Custom</div>
            <div className="text-muted-foreground">Flexible Grid</div>
          </div>
        </Button>
      </div>
    </div>
  );
};
