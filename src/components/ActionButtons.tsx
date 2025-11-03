import { Download, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onDownload: () => void;
  onPrint: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export const ActionButtons = ({ 
  onDownload, 
  onPrint, 
  onReset,
  disabled = false 
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        onClick={onDownload} 
        disabled={disabled}
        className="flex-1 min-w-[160px] gap-2"
        size="lg"
      >
        <Download className="w-5 h-5" />
        Download PNG
      </Button>
      <Button 
        onClick={onPrint} 
        disabled={disabled}
        variant="secondary"
        className="flex-1 min-w-[160px] gap-2"
        size="lg"
      >
        <Printer className="w-5 h-5" />
        Print
      </Button>
      <Button 
        onClick={onReset} 
        disabled={disabled}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Reset
      </Button>
    </div>
  );
};
