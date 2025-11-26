// src/components/A4SheetPreview.tsx

import React, { useEffect, useState } from "react";
import { Printer, RotateCcw, Download } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface A4SheetPreviewProps {
  imageId: string;
  rows: number;
  onPrint: () => void;
  onRetake: () => void;
}

export const A4SheetPreview: React.FC<A4SheetPreviewProps> = ({
  imageId,
  rows,
  onPrint,
  onRetake,
}) => {
  const { toast } = useToast();
  const [sheetPreview, setSheetPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const totalPhotos = rows * 6;

  useEffect(() => {
    generateSheetPreview();
  }, [imageId, rows]);

  const generateSheetPreview = async () => {
    setIsGenerating(true);

    try {
      console.log(`📄 Generating A4 sheet preview: ${rows} rows`);
      const response = await apiService.previewA4Sheet(imageId, rows);

      if (response.success && response.data) {
        setSheetPreview(response.data.preview_sheet || response.data.preview);
      } else {
        throw new Error(response.error || "Preview generation failed");
      }
    } catch (error) {
      console.error("A4 preview error:", error);
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      const response = await apiService.printA4Sheet(imageId, rows, null, 1);

      if (response.success && response.data) {
        toast({
          title: "✅ Print job sent",
          description: `Printing ${totalPhotos} photos to ${response.data.printer}`,
        });
        onPrint();
      } else {
        throw new Error(response.error || "Print job failed");
      }
    } catch (error) {
      console.error("A4 print error:", error);
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = () => {
    if (!sheetPreview) return;

    const link = document.createElement("a");
    link.href = sheetPreview;
    link.download = `passport_a4_sheet_${rows}rows.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "✅ Download started",
      description: `Downloading ${totalPhotos} photos A4 sheet`,
    });
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Preview Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-100 rounded-lg">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Generating A4 sheet preview...</p>
              <p className="text-sm text-muted-foreground mt-2">
                {totalPhotos} photos ({rows} rows × 6 columns)
              </p>
            </div>
          </div>
        ) : sheetPreview ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={sheetPreview}
              alt={`A4 Sheet Preview - ${totalPhotos} photos`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">Failed to generate preview</p>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="bg-green-50 border-t border-green-200 px-4 py-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <span className="text-green-700">
              <strong>{totalPhotos}</strong> photos
            </span>
            <span className="text-green-700">
              <strong>{rows}</strong> rows × <strong>6</strong> columns
            </span>
            <span className="text-green-700">
              <strong>A4</strong> (210×297mm)
            </span>
          </div>
          <span className="text-green-600 font-medium">300 DPI • High Quality Glossy</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-background border-t">
        <div className="flex gap-4 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={onRetake}
            className="flex-1 gap-2"
            size="lg"
          >
            <RotateCcw className="w-5 h-5" />
            Start Over
          </Button>

          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!sheetPreview || isGenerating}
            className="flex-1 gap-2"
            size="lg"
          >
            <Download className="w-5 h-5" />
            Download
          </Button>

          <Button
            onClick={handlePrint}
            disabled={isPrinting || isGenerating || !sheetPreview}
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isPrinting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="w-5 h-5" />
                Print A4 Sheet
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default A4SheetPreview;
