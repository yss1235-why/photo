import { useState } from "react";
import { Camera } from "lucide-react";
import { UploadArea } from "@/components/UploadArea";
import { ImagePreview } from "@/components/ImagePreview";
import { CorrectionSlider } from "@/components/CorrectionSlider";
import { LayoutSelector } from "@/components/LayoutSelector";
import { ActionButtons } from "@/components/ActionButtons";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [correctionValue, setCorrectionValue] = useState(60);
  const [selectedLayout, setSelectedLayout] = useState<"standard" | "custom">("standard");

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    
    // Create preview of original
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate backend processing
    setTimeout(() => {
      // In production, this would call the actual backend API
      // For now, we'll use the original as processed for demo
      const reader2 = new FileReader();
      reader2.onload = (e) => {
        setProcessedImage(e.target?.result as string);
        setIsProcessing(false);
        toast({
          title: "✅ Photo processed",
          description: "Background removed and colors enhanced",
        });
      };
      reader2.readAsDataURL(file);
    }, 2000);
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `passport-photo-${Date.now()}.png`;
    link.click();
    
    toast({
      title: "✅ Download started",
      description: "Your processed photo is downloading",
    });
  };

  const handlePrint = () => {
    if (!processedImage) return;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Passport Photo</title>
            <style>
              @media print {
                body { margin: 0; }
                img { 
                  width: 100%; 
                  height: auto; 
                  display: block;
                }
              }
            </style>
          </head>
          <body>
            <img src="${processedImage}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setCorrectionValue(60);
    setSelectedLayout("standard");
    toast({
      title: "Reset complete",
      description: "Ready for a new photo",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Passport Photo Studio
              </h1>
              <p className="text-sm text-muted-foreground">
                Professional photo processing in seconds
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Upload Section */}
          {!originalImage && (
            <div className="max-w-2xl mx-auto">
              <UploadArea onUpload={handleUpload} isProcessing={isProcessing} />
            </div>
          )}

          {/* Processing Section */}
          {originalImage && (
            <>
              <ImagePreview 
                originalImage={originalImage}
                processedImage={processedImage}
              />

              {processedImage && (
                <div className="grid md:grid-cols-2 gap-6">
                  <CorrectionSlider
                    value={correctionValue}
                    onChange={setCorrectionValue}
                    disabled={isProcessing}
                  />
                  <LayoutSelector
                    selectedLayout={selectedLayout}
                    onLayoutChange={setSelectedLayout}
                    disabled={isProcessing}
                  />
                </div>
              )}

              {processedImage && (
                <ActionButtons
                  onDownload={handleDownload}
                  onPrint={handlePrint}
                  onReset={handleReset}
                  disabled={isProcessing}
                />
              )}
            </>
          )}

          {/* Info Cards */}
          {!originalImage && (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Auto Background Removal
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered background removal for clean results
                </p>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Color Enhancement
                </h3>
                <p className="text-sm text-muted-foreground">
                  Adjust brightness and skin tones perfectly
                </p>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📐</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Standard Formats
                </h3>
                <p className="text-sm text-muted-foreground">
                  3×4 passport format or custom layouts
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Passport Photo Studio. Professional photo processing made simple.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
