import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { A4RowSelector } from "@/components/A4RowSelector";
import { A4SheetPreview } from "@/components/A4SheetPreview";
// ❌ REMOVED: import { PolaroidCropper } from "@/components/PolaroidCropper";
import { TextCustomization } from "@/components/TextCustomization";
import { PolaroidPreview } from "@/components/PolaroidPreview";
import { PhotoData, CropData, PaperType, FrontendConfig, FrontendFeatures } from "@/types";
import { apiService } from "@/services/api";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
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
  
 // NEW: A4 sheet-specific state
  const [a4Rows, setA4Rows] = useState<number>(1);
  const [a4PreviewImage, setA4PreviewImage] = useState<string>("");
  
  // NEW: Background processing state
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [processedImageData, setProcessedImageData] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // NEW: Admin controlled features
  const [frontendConfig, setFrontendConfig] = useState<FrontendConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [isMobileDevice, setIsMobileDevice] = useState(true);

 // Fetch frontend config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await apiService.getFrontendConfig();
        if (response.success && response.data) {
          console.log("⚙️ Frontend config loaded:", response.data);
          setFrontendConfig(response.data);
          
          // Check session if one-time link mode is enabled
          if (response.data.one_time_link_mode) {
            const sessionToken = searchParams.get("session");
            
            if (!sessionToken) {
              console.log("❌ No session token, redirecting...");
              navigate("/invalid-session?reason=session_required");
              return;
            }
            
            // Validate session with backend
            const validation = await apiService.validateSession(sessionToken);
            
            if (!validation.valid) {
              console.log("❌ Invalid session:", validation.reason);
              navigate(`/invalid-session?reason=${validation.reason}`);
              return;
            }
            
            // Session is valid, store token for API requests
            apiService.setSessionToken(sessionToken);
            console.log("✅ Session validated successfully");
            setSessionValidated(true);
          } else {
            // One-time link mode is disabled, no session needed
            setSessionValidated(true);
          }
        } else {
          // Couldn't load config, assume no session needed
          setSessionValidated(true);
        }
      } catch (error) {
        console.error("Failed to load frontend config:", error);
        setSessionValidated(true);
      } finally {
        setConfigLoading(false);
        setSessionChecking(false);
      }
    };

    // Check if mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobileDevice(isMobile);
    };

    fetchConfig();
    checkMobile();
  }, [searchParams, navigate]);

  // Helper function to show appropriate toast for print response
  const showPrintToast = (response: { success: boolean; data?: { queued?: boolean; job_id?: string; printer?: string; message?: string }; error?: string }) => {
    if (response.success && response.data) {
      if (response.data.queued) {
        toast({
          title: "⏳ Print Request Queued",
          description: response.data.message || "Your print request is waiting for admin approval.",
        });
      } else {
        toast({
          title: "✅ Print job sent",
          description: response.data.message || `Sent to ${response.data.printer}`,
        });
      }
    } else {
      toast({
        title: "Print failed",
        description: response.error || "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const totalSteps = selectedPaperType === "polaroid" ? 6 : selectedPaperType === "passport-a4" ? 8 : 7;

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
   // NEW: Reset A4 sheet states
    setA4Rows(1);
    setA4PreviewImage("");
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
    } else if (paperType === "passport-a4") {
      setSelectedLayout("standard"); // Use standard crop for A4
    }
  };

  // NEW: Handle A4 row selection
  const handleA4RowSelect = (rows: number) => {
    console.log("📄 A4 rows selected:", rows);
    setA4Rows(rows);
  };

  // NEW: Handle A4 preview complete
  const handleA4PreviewComplete = (previewImage: string) => {
    console.log("📄 A4 preview generated");
    setA4PreviewImage(previewImage);
    handleNext();
  };

 // NEW: Handle A4 print
  const handleA4Print = async () => {
    console.log("🖨️ Printing A4 sheet...");
    try {
      const imageId = processedImageId || photoData.imageId!;
      const response = await apiService.printA4Sheet(imageId, a4Rows, null, 1);
      showPrintToast(response);
    } catch (error) {
      console.error("A4 print error:", error);
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Handle Polaroid print
  const handlePolaroidPrint = async () => {
    console.log("🖨️ Printing polaroid sheet...");
    try {
      const imageId = processedImageId || photoData.imageId!;
      const response = await apiService.printPolaroidSheet(
        imageId,
        polaroidText1,
        polaroidText2,
        polaroidFont,
        null,
        1
      );
      showPrintToast(response);
    } catch (error) {
      console.error("Polaroid print error:", error);
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Handle Passport 4x6 print
  const handlePassportPrint = async (layout: "3x4" | "2x3") => {
    console.log(`🖨️ Printing passport sheet (${layout})...`);
    try {
      const imageId = processedImageId || photoData.imageId!;
      const response = await apiService.printPassportSheet(imageId, layout, null, 1);
      showPrintToast(response);
    } catch (error) {
      console.error("Passport print error:", error);
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Check if mobile only mode is blocking access
  if (!configLoading && frontendConfig?.mobile_only_mode && !isMobileDevice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mobile Only</h1>
          <p className="text-gray-600">
            This application is currently only available on mobile devices. 
            Please scan the QR code or visit this page from your phone.
          </p>
        </div>
      </div>
    );
  }

  // Show loading while config loads
  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

   // Get enabled features for passing to components
  const enabledFeatures: FrontendFeatures = frontendConfig?.features || {
    passport_4x6: true,
    passport_a4: true,
    polaroid: true,
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

  const handleProcessingComplete = (beforeImage: string, afterImage: string, processedId: string) => {
    console.log("✨ Processing complete:");
    console.log(`   Before Image: ${beforeImage.substring(0, 50)}...`);
    console.log(`   After Image: ${afterImage.substring(0, 50)}...`);
    console.log(`   Processed Image ID: ${processedId}`);
    
    setPhotoData({ ...photoData, cropped: beforeImage, processed: afterImage });
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
              enabledFeatures={enabledFeatures}
            />
          );
        
        case 3:
          return (
            <Step2Crop
              imageUrl={photoData.original!}
              onCropComplete={handleCropComplete}
              onRetake={handleRetake}
              aspectRatio={32.42 / 40.0}
              title="Crop Your A4 Passport Photo"
              subtitle="Position your face within the A4 passport frame"
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

  // For A4 passport workflow
    if (selectedPaperType === "passport-a4") {
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
              enabledFeatures={enabledFeatures}
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
            <Step4Processing
              imageId={photoData.imageId!}
              cropData={cropData}
              onProcessingComplete={handleProcessingComplete}
            />
          );
        
        case 5:
          return (
            <Step5BeforeAfter
              originalImage={photoData.cropped || photoData.original!}
              processedImage={photoData.processed!}
              onContinue={handleNext}
              onRetake={handleRetake}
            />
          );
        
        case 6:
          return (
            <A4RowSelector
              selectedRows={a4Rows}
              onRowsChange={handleA4RowSelect}
              onContinue={handleNext}
              onBack={handleBack}
            />
          );
        
        case 7:
        case 8:
          const a4ImageId = processedImageId || photoData.imageId!;
          return (
            <A4SheetPreview
              imageId={a4ImageId}
              rows={a4Rows}
              onPrint={handleA4Print}
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
            enabledFeatures={enabledFeatures}
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

 // Show loading while checking session
  if (sessionChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    );
  }

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
                Photo Studio
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
                {/* Circular Progress Indicator */}
                <div className="w-32 h-32 mx-auto relative">
                  <div className="w-full h-full border-8 border-primary/20 rounded-full" />
                  <div 
                    className="absolute inset-0 border-8 border-primary border-t-transparent rounded-full animate-spin"
                    style={{
                      animationDuration: "1s"
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {Math.min(90, Math.floor((Date.now() % 5000) / 50))}%
                    </span>
                  </div>
                </div>
                
                {/* Main Message */}
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">Creating Your Polaroid...</h3>
                  <p className="text-muted-foreground text-lg">
                    This will take about <span className="font-semibold text-foreground">5 seconds</span>
                  </p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 ease-out animate-pulse"
                    style={{ width: `${Math.min(90, Math.floor((Date.now() % 5000) / 50))}%` }}
                  />
                </div>
                
                {/* Status Message */}
                <p className="text-lg text-muted-foreground">
                  Adding your custom text and arranging polaroids...
                </p>
                
                <p className="text-sm text-muted-foreground/70">
                  Using professional print standards
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
