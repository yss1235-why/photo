import { useEffect, useState } from "react";
import { ActionButtons } from "@/components/ActionButtons";
import { CheckCircle, Printer, Settings } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Step6PreviewProps {
  imageId: string;
  processedImage: string;
  layout: "standard" | "custom";
  onPrint: () => void;
  onBack: () => void;
}

const Step6Preview = ({ 
  imageId, 
  processedImage, 
  layout, 
  onPrint, 
  onBack 
}: Step6PreviewProps) => {
  const { toast } = useToast();
  const [sheetPreview, setSheetPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [layoutInfo, setLayoutInfo] = useState<{
    photos_count: number;
    orientation: string;
    type: string;
  } | null>(null);
  
  // Printer selection
  const [showPrinterDialog, setShowPrinterDialog] = useState(false);
  const [printers, setPrinters] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [printingAvailable, setPrintingAvailable] = useState(false);

  useEffect(() => {
    generateSheetPreview();
    checkPrintingAvailability();
  }, [imageId, layout]);

  const checkPrintingAvailability = async () => {
    try {
      const response = await apiService.listPrinters();
      if (response.success && response.data) {
        setPrintingAvailable(true);
        setPrinters(response.data.printers);
        
        // Auto-select default printer
        const defaultPrinter = response.data.printers.find(p => p.is_default);
        if (defaultPrinter) {
          setSelectedPrinter(defaultPrinter.name);
        } else if (response.data.printers.length > 0) {
          setSelectedPrinter(response.data.printers[0].name);
        }
      }
    } catch (error) {
      console.log("Printing not available on this system");
      setPrintingAvailable(false);
    }
  };

  const generateSheetPreview = async () => {
    setIsGenerating(true);
    
    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.previewSheet(imageId, apiLayout);
      
      if (response.success && response.data) {
        setSheetPreview(response.data.preview_sheet);
        setLayoutInfo(response.data.layout_info);
        
        toast({
          title: "✅ Preview ready",
          description: `${response.data.layout_info.photos_count} photos arranged on ${response.data.layout_info.orientation} sheet`,
        });
      } else {
        throw new Error(response.error || "Preview generation failed");
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Preview generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setSheetPreview(processedImage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = async () => {
    if (!printingAvailable) {
      toast({
        title: "Printing not available",
        description: "Please download and print manually",
        variant: "destructive",
      });
      return;
    }

    setIsPrinting(true);

    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.printSheet(
        imageId,
        apiLayout,
        selectedPrinter || undefined,
        1
      );

      if (response.success && response.data) {
        toast({
          title: "🖨️ Printing...",
          description: `Job sent to ${response.data.printer}`,
        });
        
        onPrint();
      } else {
        throw new Error(response.error || "Print failed");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadAndPrint = async () => {
    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.downloadSheet(imageId, apiLayout);
      
      if (response.success && response.data) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          const paperWidth = layout === "standard" ? "6in" : "4in";
          const paperHeight = layout === "standard" ? "4in" : "6in";
          
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Passport Photo Sheet</title>
                <style>
                  @page {
                    size: ${paperWidth} ${paperHeight};
                    margin: 0;
                  }
                  @media print {
                    body { 
                      margin: 0; 
                      padding: 0;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 100vh;
                    }
                    img { 
                      width: ${paperWidth};
                      height: ${paperHeight};
                      object-fit: contain;
                      display: block;
                    }
                  }
                  body {
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #f5f5f5;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  }
                </style>
              </head>
              <body>
                <img src="${response.data.file}" alt="Passport Photo Sheet" />
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                    }, 500);
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
        
        toast({
          title: "Opening print dialog...",
          description: "Check your browser's print dialog",
        });
      } else {
        throw new Error(response.error || "Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
    
    onPrint();
  };

  const getLayoutDescription = () => {
    if (!layoutInfo) return "";
    
    if (layout === "standard") {
      return "8 photos • 4×2 grid • Landscape • Exact 3.5×4.5cm";
    } else {
      return "12 photos • 3×4 grid • Portrait • Proportional size";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="w-8 h-8 text-success" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Ready to Print!
          </h2>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          {getLayoutDescription()}
        </p>
      </div>

      {/* Sheet Preview */}
      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-lg overflow-hidden bg-white border-2 border-border shadow-xl">
          {isGenerating ? (
            <div className="aspect-[2/3] flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Generating print sheet...</p>
                <p className="text-xs text-muted-foreground mt-2">Creating high-quality 300 DPI output</p>
              </div>
            </div>
          ) : sheetPreview ? (
            <img
              src={sheetPreview}
              alt="Print sheet preview"
              className="w-full h-auto"
              style={{
                imageRendering: 'high-quality'
              }}
            />
          ) : null}
        </div>
      </div>

      {/* Sheet Info */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {layoutInfo?.photos_count || (layout === "standard" ? "8" : "12")}
          </div>
          <p className="text-sm text-muted-foreground">Photos per sheet</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {layout === "standard" ? "6×4\"" : "4×6\""}
          </div>
          <p className="text-sm text-muted-foreground">
            Paper size ({layoutInfo?.orientation || "landscape"})
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            300
          </div>
          <p className="text-sm text-muted-foreground">DPI quality</p>
        </div>
      </div>

      {/* Printing Options */}
      {printingAvailable && (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1 text-sm">
                Direct Printing Available
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                {selectedPrinter ? `Selected: ${selectedPrinter}` : "No printer selected"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrinterDialog(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Select Printer ({printers.length} available)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Specific Info */}
      {layout === "standard" ? (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
          <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
            <span>📐</span>
            Standard Layout Features:
          </h3>
          <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
            <li>• Each photo is exactly 3.5cm × 4.5cm (official size)</li>
            <li>• Landscape orientation (6" wide × 4" tall)</li>
            <li>• Generous spacing for easy cutting</li>
            <li>• Meets official passport photo requirements</li>
          </ul>
        </div>
      ) : (
        <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800 max-w-2xl mx-auto">
          <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
            <span>✨</span>
            Custom Layout Features:
          </h3>
          <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
            <li>• 12 photos for maximum value</li>
            <li>• Portrait orientation (4" wide × 6" tall)</li>
            <li>• Minimal 3px gaps between photos</li>
            <li>• Proportional sizing maintains aspect ratio</li>
          </ul>
        </div>
      )}

      {/* Print Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border max-w-2xl mx-auto">
        <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
          <span>🖨️</span>
          Printing Tips:
        </h3>
        <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
          <li>• Use photo paper for best results</li>
          <li>• Set printer to "Best Quality" or "Photo" mode</li>
          <li>• Paper size: {layout === "standard" ? "6×4 inches" : "4×6 inches"}</li>
          <li>• Orientation: {layout === "standard" ? "Landscape" : "Portrait"}</li>
          <li>• Ensure "Fit to Page" is disabled (100% scale)</li>
          <li>• Cut along the black borders carefully</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="max-w-2xl mx-auto space-y-3">
        {printingAvailable ? (
          <>
            <Button
              onClick={handleDirectPrint}
              disabled={isGenerating || isPrinting || !selectedPrinter}
              className="w-full gap-2"
              size="lg"
            >
              <Printer className="w-5 h-5" />
              {isPrinting ? "Sending to Printer..." : "Print Now"}
            </Button>
            <Button
              onClick={handleDownloadAndPrint}
              disabled={isGenerating}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Printer className="w-5 h-5" />
              Download & Print (Browser)
            </Button>
          </>
        ) : (
          <Button
            onClick={handleDownloadAndPrint}
            disabled={isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            <Printer className="w-5 h-5" />
            Open Print Dialog
          </Button>
        )}
        
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full"
          size="lg"
        >
          Back to Edit
        </Button>
      </div>

      {/* Success Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          Photo processing complete
        </div>
      </div>

      {/* Printer Selection Dialog */}
      <Dialog open={showPrinterDialog} onOpenChange={setShowPrinterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Printer</DialogTitle>
            <DialogDescription>
              Choose which printer to use for this job
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            {printers.map((printer) => (
              <button
                key={printer.name}
                onClick={() => {
                  setSelectedPrinter(printer.name);
                  setShowPrinterDialog(false);
                  toast({
                    title: "Printer selected",
                    description: printer.name,
                  });
                }}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPrinter === printer.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-foreground">
                      {printer.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Status: {printer.status}
                      {printer.is_default && " • Default"}
                      {printer.supports_color && " • Color"}
                    </div>
                  </div>
                  {selectedPrinter === printer.name && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Step6Preview;
