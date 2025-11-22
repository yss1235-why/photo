import { useState } from "react";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Step1Upload from "@/components/steps/Step1Upload";
import Step2Crop from "@/components/steps/Step2Crop";
import Step3Layout from "@/components/steps/Step3Layout";
import Step4Processing from "@/components/steps/Step4Processing";
import Step5BeforeAfter from "@/components/steps/Step5BeforeAfter";
import Step6Final from "@/components/steps/Step6Final";
import StepNavigation from "@/components/StepNavigation";
import { PaperTypeSelector } from "@/components/PaperTypeSelector";
import { PolaroidCropper } from "@/components/PolaroidCropper";
import { TextCustomization } from "@/components/TextCustomization";
import { PolaroidPreview } from "@/components/PolaroidPreview";
import { PhotoData, CropData, PaperType } from "@/types";
import { apiService } from "@/services/api";

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
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<"standard" | "custom">("standard");
  const [processedImageId, setProcessedImageId] = useState<string | undefined>(undefined);
  
  // NEW: Paper type selection state
  const [selectedPaperType, setSelectedPaperType] = useState<PaperType>("passport-standard");
  
  // NEW: Polaroid-specific state
  const [polaroidText1, setPolaroidText1] = useState<string>("");
  const [polaroidText2, setPolaroidText2] = useState<string>("");
  const [polaroidFont, setPolaroidFont] = useState<string>("default");
  const [polaroidPreviewImage, setPolaroidPreviewImage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleRetake = () => {
    console.log("🔄 Retaking photo, resetting all state");
    setCurrentStep(1);
    setPhotoData({
      original: null,
      processed: null,
      cropped: null,
      final: null,
      imageId: undefined,
    });
    setCropData(null);
    setSelectedLayout("standard");
    setProcessedImageId(undefined);
    setSelectedPaperType("passport-standard");
    setPolaroidText1("");
    setPolaroidText2("");
    setPolaroidFont("default");
    setPolaroidPreviewImage("");
  };

  const handleUploadComplete = (imageUrl: string, imageId: string) => {
    console.log("📤 Upload complete:");
    console.log(`   Image ID: ${imageId}`);
    console.log(`   Image URL: ${imageUrl.substring(0, 50)}...`);
    
    setPhotoData({ ...photoData, original: imageUrl, imageId });
    handleNext(); // Go to step 2: Paper Type Selection
  };

  // NEW: Handle paper type selection
  const handlePaperTypeSelect = (paperType: PaperType) => {
    console.log("📋 Paper type selected:", paperType);
    setSelectedPaperType(paperType);
    
    // Set layout for passport types
    if (paperType === "passport-standard") {
      setSelectedLayout("standard");
    } else if (paperType === "passport-custom") {
      setSelectedLayout("custom");
    }
  };

  const handlePaperTypeContinue = () => {
    console.log("➡️ Continuing with paper type:", selectedPaperType);
    handleNext(); // Go to step 3: Crop
  };

  const handleCropComplete = (croppedImage: string, cropCoords: CropData) => {
    console.log("✂️ Crop complete:");
    console.log(`   Crop data:`, cropCoords);
    
    setPhotoData({ ...photoData, cropped: croppedImage });
    setCropData(cropCoords);
    handleNext();
  };

  // NEW: Handle polaroid crop complete
  const handlePolaroidCropComplete = async (cropCoords: CropData) => {
    console.log("✂️ Polaroid crop complete:", cropCoords);
    setCropData(cropCoords);
    setIsProcessing(true);

    try {
      const result = await apiService.processPolaroidPhoto(photoData.imageId!, cropCoords);
      
      if (result.success && result.data) {
        setPhotoData({ ...photoData, processed: result.data.processed_image });
        handleNext(); // Go to text customization
        toast({
          title: "Crop Applied",
          description: "Now add custom text to your polaroids",
        });
      } else {
        throw new Error(result.error || "Processing failed");
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // NEW: Handle text customization complete
  const handleTextCustomizationComplete = async (text1: string, text2: string, fontName: string) => {
    console.log("📝 Text customization complete:", { text1, text2, fontName });
    setPolaroidText1(text1);
    setPolaroidText2(text2);
    setPolaroidFont(fontName);
    setIsProcessing(true);

    try {
      const result = await apiService.previewPolaroidSheet(photoData.imageId!, text1, text2, fontName);
      
      if (result.success && result.data) {
        setPolaroidPreviewImage(result.data.preview_sheet || result.data.preview);
        handleNext(); // Go to preview
        toast({
          title: "Preview Ready",
          description: "Your polaroid sheet is ready to download",
        });
      } else {
        throw new Error(result.error || "Preview generation failed");
      }
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // NEW: Handle polaroid download
  const handlePolaroidDownload = async () => {
    setIsProcessing(true);

    try {
      const result = await apiService.downloadPolaroidSheet(
        photoData.imageId!,
        polaroidText1,
        polaroidText2,
        polaroidFont
      );
      
      if (result.success && result.data) {
        const link = document.createElement("a");
        link.href = result.data.file;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download Complete",
          description: `Downloaded ${result.data.filename}`,
        });
      } else {
        throw new Error(result.error || "Download failed");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLayoutSelect = (layout: "standard" | "custom") => {
    console.log("📐 Layout selected:", layout);
    setSelectedLayout(layout);
    handleNext();
  };

  const handleProcessingComplete = (processedImageUrl: string, processedId: string) => {
    console.log("✨ Processing complete:");
    console.log(`   Processed Image ID: ${processedId}`);
    
    setPhotoData({ ...photoData, processed: processedImageUrl });
    setProcessedImageId(processedId);
    handleNext();
  };

  const handlePrint = () => {
    console.log("🖨️ Print initiated");
    toast({
      title: "Print Successful",
      description: "Your photos have been sent to the printer",
    });
  };

  const renderStep = () => {
    // For polaroid workflow
    if (selectedPaperType === "polaroid") {
      switch (currentStep) {
        case 1:
          return (
            <Step1Upload
              onUploadComplete={handleUploadComplete}
              onRetake={handleRetake}
            />
          );
        
        case 2:
          return (
            <PaperTypeSelector
              selectedType={selectedPaperType}
              onSelect={handlePaperTypeSelect}
              onContinue={handlePaperTypeContinue}
            />
          );
        
        case 3:
          return (
            <PolaroidCropper
              imageUrl={photoData.original!}
              onCropComplete={handlePolaroidCropComplete}
              onCancel={handleRetake}
            />
          );
        
        case 4:
          return (
            <TextCustomization
              onComplete={handleTextCustomizationComplete}
              onBack={handleBack}
              initialText1={polaroidText1}
              initialText2={polaroidText2}
              initialFont={polaroidFont}
            />
          );
        
        case 5:
        case 6:
          return (
            <PolaroidPreview
              previewImage={polaroidPreviewImage}
              isGenerating={isProcessing}
              onDownload={handlePolaroidDownload}
              onEdit={() => setCurrentStep(4)}
              onRetake={handleRetake}
            />
          );
        
        default:
          return null;
      }
    }

    // For passport workflow (standard and custom)
    switch (currentStep) {
      case 1:
        return (
          <Step1Upload
            onUploadComplete={handleUploadComplete}
            onRetake={handleRetake}
          />
        );
      
      case 2:
        return (
          <PaperTypeSelector
            selectedType={selectedPaperType}
            onSelect={handlePaperTypeSelect}
            onContinue={handlePaperTypeContinue}
          />
        );
      
      case 3:
        return (
          <Step2Crop
            imageUrl={photoData.original!}
            onCropComplete={handleCropComplete}
            onRetake={handleRetake}
          />
        );
      
      case 4:
        return (
          <Step3Layout
            selectedLayout={selectedLayout}
            onLayoutSelect={handleLayoutSelect}
          />
        );
      
      case 5:
        return (
          <Step4Processing
            imageId={photoData.imageId!}
            cropData={cropData}
            onProcessingComplete={handleProcessingComplete}
          />
        );
      
      case 6:
        return (
          <Step5BeforeAfter
            originalImage={photoData.cropped || photoData.original!}
            processedImage={photoData.processed!}
            onContinue={handleNext}
            onRetake={handleRetake}
          />
        );
      
      case 7:
        const imageIdForPrint = processedImageId || photoData.imageId!;
        console.log(`📄 Final step using image ID: ${imageIdForPrint}`);
        
        return (
          <Step6Final
            imageId={imageIdForPrint}
            layout={selectedLayout}
            onPrint={handlePrint}
            onRetake={handleRetake}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            </div>
          </div>
        </div>
      </header>

      {currentStep > 1 && currentStep < 6 && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          mode={selectedPaperType === "polaroid" ? "polaroid" : "passport"}
        />
      )}

      <main className="container mx-auto">
        {renderStep()}
      </main>
    </div>
  );
};

export default Index;
