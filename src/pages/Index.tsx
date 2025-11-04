import { useState } from "react";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Step1Upload from "@/components/steps/Step1Upload";
import Step2ModeSelect from "@/components/steps/Step2ModeSelect";
import Step3Crop from "@/components/steps/Step3Crop";
import Step4Enhance from "@/components/steps/Step4Enhance";
import Step5Layout from "@/components/steps/Step5Layout";
import Step6Preview from "@/components/steps/Step6Preview";
import StepNavigation from "@/components/StepNavigation";
import { PhotoData, ProcessingMode, CropData } from "@/types";

const Index = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoData, setPhotoData] = useState<PhotoData>({
    original: null,
    processed: null,
    cropped: null,
    final: null,
    imageId: undefined,
  });
  const [mode, setMode] = useState<ProcessingMode>("passport");
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [enhancementLevel, setEnhancementLevel] = useState(60);
  const [selectedLayout, setSelectedLayout] = useState<"standard" | "custom">("standard");

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUploadComplete = (imageUrl: string, imageId: string) => {
    setPhotoData({ ...photoData, original: imageUrl, imageId });
    handleNext();
  };

  const handleModeSelect = (selectedMode: ProcessingMode) => {
    setMode(selectedMode);
    handleNext();
  };

  const handleCropComplete = (croppedImage: string, cropCoords: CropData) => {
    setPhotoData({ ...photoData, cropped: croppedImage });
    setCropData(cropCoords);
    handleNext();
  };

  const handleEnhancementChange = (value: number) => {
    setEnhancementLevel(value);
  };

  const handleEnhancementComplete = (processedImage: string) => {
    setPhotoData({ ...photoData, processed: processedImage });
    handleNext();
  };

  const handleLayoutSelect = (layout: "standard" | "custom") => {
    setSelectedLayout(layout);
    handleNext();
  };

  const handlePrint = () => {
    toast({
      title: "✅ Print initiated",
      description: "Check your print dialog",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Upload onUploadComplete={handleUploadComplete} />;
      case 2:
        return <Step2ModeSelect onModeSelect={handleModeSelect} selectedMode={mode} />;
      case 3:
        return (
          <Step3Crop
            imageUrl={photoData.original!}
            imageId={photoData.imageId!}
            onCropComplete={handleCropComplete}
          />
        );
      case 4:
        return (
          <Step4Enhance
            originalImage={photoData.cropped || photoData.original!}
            imageId={photoData.imageId!}
            mode={mode}
            enhancementLevel={enhancementLevel}
            onEnhancementChange={handleEnhancementChange}
            onEnhancementComplete={handleEnhancementComplete}
          />
        );
      case 5:
        return (
          <Step5Layout
            selectedLayout={selectedLayout}
            onLayoutSelect={handleLayoutSelect}
          />
        );
      case 6:
        return (
          <Step6Preview
            imageId={photoData.imageId!}
            processedImage={photoData.processed || photoData.cropped!}
            layout={selectedLayout}
            onPrint={handlePrint}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Passport Photo Studio
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Professional photo processing in steps
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Navigation */}
      {currentStep > 1 && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          mode={mode}
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          {renderStep()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>© 2025 Passport Photo Studio. Professional photo processing made simple.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
