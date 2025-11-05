import { useEffect, useState } from "react";
import { CheckCircle, Printer } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    generateSheetPreview();
  }, [imageId, layout]);

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
          description: `${response.data.layout_info.photos_count} photos arranged`,
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

  // ✅ SIMPLE: Just send print request to backend
  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.printSheet(imageId, apiLayout, 1);

      if (response.success && response.data) {
        toast({
          title: "✅ Print job sent",
          description: `Printing to ${response.data.printer}`,
        });
        onPrint();
      } else {
        // Backend returns error if no printer available
        toast({
          title: "❌ Print failed",
          description: response.error || "No printer available. Please download and print manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "❌ Print failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.downloadSheet(imageId, apiLayout);
      
      if (response.success && response.data) {
        // Open print dialog with downloaded sheet
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
          title: "✅ Opening print dialog",
          description: "Print dialog opened in new window",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
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
              style={{ imageRendering: 'high-quality' }}
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

      {/* Action Buttons - SIMPLE! */}
      <div className="max-w-2xl mx-auto space-y-3">
        <Button
          onClick={handlePrint}
          disabled={isGenerating || isPrinting}
          className="w-full gap-2"
          size="lg"
        >
          <Printer className="w-5 h-5" />
          {isPrinting ? "Sending to Printer..." : "Print Photo Sheet"}
        </Button>
        
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          variant="outline"
          className="w-full gap-2"
          size="lg"
        >
          <Printer className="w-5 h-5" />
          Download & Print Manually
        </Button>
        
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
    </div>
  );
};

export default Step6Preview;
