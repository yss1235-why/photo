import { useEffect, useState } from "react";
import { ActionButtons } from "@/components/ActionButtons";
import { CheckCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Step6PreviewProps {
  imageId: string;
  processedImage: string;
  layout: "standard" | "custom";
  onPrint: () => void;
  onBack: () => void;
}

const Step6Preview = ({ imageId, processedImage, layout, onPrint, onBack }: Step6PreviewProps) => {
  const { toast } = useToast();
  const [sheetPreview, setSheetPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

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
        toast({
          title: "✅ Preview ready",
          description: `${apiLayout} layout generated`,
        });
      } else {
        throw new Error(response.error || "Preview generation failed");
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Preview generation failed",
        description: error instanceof Error ? error.message : "Using processed image",
        variant: "destructive",
      });
      // Fallback: use processed image
      setSheetPreview(processedImage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.downloadSheet(imageId, apiLayout);
      
      if (response.success && response.data) {
        // Open print dialog with the downloaded sheet
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Passport Photo</title>
                <style>
                  @page {
                    size: 4in 6in;
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
                      width: 4in;
                      height: 6in;
                      object-fit: contain;
                      display: block;
                    }
                  }
                </style>
              </head>
              <body>
                <img src="${response.data.file}" alt="Passport Photo Sheet" />
              </body>
            </html>
          `);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
        
        toast({
          title: "Printing...",
          description: "Print dialog opened",
        });
      } else {
        throw new Error(response.error || "Download failed");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
    
    onPrint();
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
          Review your photo sheet before printing
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
              </div>
            </div>
          ) : sheetPreview ? (
            <img
              src={sheetPreview}
              alt="Print sheet preview"
              className="w-full h-auto"
            />
          ) : null}
        </div>
      </div>

      {/* Sheet Info */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {layout === "standard" ? "12" : "6"}
          </div>
          <p className="text-sm text-muted-foreground">Photos per sheet</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            4×6"
          </div>
          <p className="text-sm text-muted-foreground">Paper size</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            300
          </div>
          <p className="text-sm text-muted-foreground">DPI quality</p>
        </div>
      </div>

      {/* Print Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border max-w-2xl mx-auto">
        <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
          <span>🖨️</span>
          Printing Tips:
        </h3>
        <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
          <li>• Use photo paper for best results</li>
          <li>• Set printer to "Best Quality" or "Photo" mode</li>
          <li>• Ensure "Fit to Page" is disabled</li>
          <li>• Cut along the grid lines carefully</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="max-w-2xl mx-auto">
        <ActionButtons
          onPrint={handlePrint}
          onBack={onBack}
          disabled={isGenerating}
          showBackButton={true}
        />
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
