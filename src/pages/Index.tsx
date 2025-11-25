import { useState } from "react";
import { Camera, ImageIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Step1Upload from "@/components/steps/Step1Upload";
import Step2Crop from "@/components/steps/Step2Crop";
import Step3Layout from "@/components/steps/Step3Layout";
import Step4Processing from "@/components/steps/Step4Processing";
import Step5BeforeAfter from "@/components/steps/Step5BeforeAfter";
import Step6Final from "@/components/steps/Step6Final";
import StepNavigation from "@/components/StepNavigation";
import { PaperTypeSelector } from "@/components/PaperTypeSelector";
// ❌ REMOVED: import { PolaroidCropper } from "@/components/PolaroidCropper";
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
  const [polaroidFont, setPolaroidFont] = useState<string>("Pacifico-Regular");
  const [polaroidPreviewImage, setPolaroidPreviewImage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NEW: Background processing state
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [processedImageData, setProcessedImageData] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

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
    setPolaroidFont("Pacifico-Regular");
    setPolaroidPreviewImage("");
    // NEW: Reset background processing states
    setIsImageProcessing(false);
    setProcessedImageData(null);
    setProcessingError(null);
    setIsGeneratingPreview(false);
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

// ✅ UPDATED: Handle polaroid crop complete - instant navigation with background processing
  const handlePolaroidCropComplete = async (croppedImage: string, cropCoords: CropData) => {
    console.log("✂️ Polaroid crop complete:", cropCoords);
    setCropData(cropCoords);
    setPhotoData({ ...photoData, cropped: croppedImage });
    
    // ⚡ INSTANT: Go to text customization immediately
    handleNext();
    
    // 🔄 BACKGROUND: Start processing image
    setIsImageProcessing(true);
    setProcessingError(null);
    
    console.log("🔄 Starting background image processing...");
    
    // Process in background (don't await, don't block UI)
    apiService.processPolaroidPhoto(photoData.imageId!, cropCoords)
      .then((result) => {
        if (result.success && result.data) {
          setProcessedImageData(result.data.processed_image);
          setIsImageProcessing(false);
          console.log("✅ Background processing complete!");
          
          toast({
            title: "Image Ready",
            description: "Your image has been processed and enhanced",
          });
        } else {
          throw new Error(result.error || "Processing failed");
        }
      })
      .catch((error) => {
        setProcessingError(error instanceof Error ? error.message : "Processing failed");
        setIsImageProcessing(false);
        console.error("❌ Background processing failed:", error);
        
        toast({
          title: "Processing Failed",
          description: "Image processing failed. Please try again or go back to crop.",
          variant: "destructive",
        });
      });
  };

// NEW: Handle text customization complete with smart loading
  const handleTextCustomizationComplete = async (text1: string, text2: string, fontName: string) => {
    console.log("📝 Text customization complete:", { text1, text2, fontName });
    setPolaroidText1(text1);
    setPolaroidText2(text2);
    setPolaroidFont(fontName);
    
    // Show loading screen
    setIsGeneratingPreview(true);

    try {
      // Wait for image processing if still running
      if (isImageProcessing) {
        let attempts = 0;
        while (isImageProcessing && !processingError && attempts < 60) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (processingError) {
          throw new Error(processingError);
        }
      }
      
      // STEP 2: Generate preview with text
      console.log("🎨 Generating polaroid sheet preview...");
      const result = await apiService.previewPolaroidSheet(photoData.imageId!, text1, text2, fontName);
      
      if (result.success && result.data) {
        setPolaroidPreviewImage(result.data.preview_sheet || result.data.preview);
        setPhotoData({ ...photoData, processed: processedImageData || result.data.preview });
        
        // Hide loading and go to preview
        setIsGeneratingPreview(false);
        handleNext();
        
        toast({
          title: "Preview Ready",
          description: "Your polaroid sheet is ready to print",
        });
      } else {
        throw new Error(result.error || "Preview generation failed");
      }
    } catch (error) {
      setIsGeneratingPreview(false);
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };
 // NEW: Handle polaroid edit text (go back to text customization)
  const handlePolaroidEditText = () => {
    console.log("✏️ Editing polaroid text - going back to step 4");
    setCurrentStep(4); // Go back to text customization step
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

  const handlePolaroidPrint = async () => {
    setIsProcessing(true);
    try {
      const result = await apiService.printPolaroidSheet(photoData.imageId!, null, 1);
      if (result.success) {
        toast({
          title: "✅ Print job sent",
          description: "Your polaroid is printing",
        });
      }
    } catch (error) {
      toast({
        title: "Print failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
          // ✅ UPDATED: Use Step2Crop with polaroid aspect ratio instead of PolaroidCropper
          return (
            <Step2Crop
              imageUrl={photoData.original!}
              onCropComplete={handlePolaroidCropComplete}
              onRetake={handleRetake}
              aspectRatio={2.3 / 2.5}
              title="Crop Your Polaroid Photo"
              subtitle="Position your image within the polaroid frame"
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
              isProcessing={isImageProcessing}
              processingError={processingError}
            />
          );
        
        case 5:
        case 6:
          return (
            <PolaroidPreview
              previewImage={polaroidPreviewImage}
              isGenerating={isProcessing}
              onPrint={handlePolaroidPrint}
              onEdit={handlePolaroidEditText}
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
        
        {/* Loading Overlay for Preview Generation */}
        {isGeneratingPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-border">
              <div className="text-center space-y-6">
                {/* Animated Icon */}
                <div className="relative">
                  <div className="w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-primary/30 rounded-2xl animate-pulse" />
                    <div className="absolute inset-2 border-4 border-primary border-t-transparent rounded-xl animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                </div>
                
                {/* Main Message */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Creating Your Polaroid...</h3>
                  <p className="text-muted-foreground text-lg">
                    This will take about <span className="font-semibold text-foreground">5 seconds</span>
                  </p>
                </div>
                
                {/* Progress Steps */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    Adding your custom text...
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary animate-pulse" />
                    Arranging polaroids...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
