// src/components/PolaroidWorkflow.tsx - Complete Polaroid Creation Workflow Component

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { PolaroidCropper } from "./PolaroidCropper";
import { TextCustomization } from "./TextCustomization";
import { PolaroidPreview } from "./PolaroidPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, ArrowLeft, ImagePlus } from "lucide-react";
import { PolaroidCropData } from "@/types";

type WorkflowStep = "upload" | "crop" | "text" | "preview";

export const PolaroidWorkflow: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageId, setImageId] = useState<string>("");
  const [cropData, setCropData] = useState<PolaroidCropData | null>(null);
  const [text1, setText1] = useState<string>("");
  const [text2, setText2] = useState<string>("");
  const [fontName, setFontName] = useState<string>("Pacifico-Regular");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const optimizeImageForUpload = (file: File): Promise<{ file: File; warning?: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        const originalSizeMB = file.size / 1024 / 1024;
        const isPNG = file.type === "image/png";

        // Print quality thresholds for polaroid (2.3" x 2.5" at 300 DPI)
        const maxDimension = 1400; // More than enough for 300 DPI printing
        const minDimension = 700;  // Minimum for acceptable print quality

        let finalWidth = originalWidth;
        let finalHeight = originalHeight;
        let warning: string | undefined;

        // Check if image is too small for quality printing
        const shortestSide = Math.min(originalWidth, originalHeight);
        if (shortestSide < minDimension) {
          warning = "Low resolution image - print quality may be reduced";
          console.log(`⚠️ Warning: Image resolution (${originalWidth}x${originalHeight}) may result in lower print quality`);
        }

        // Determine if we need to resize (image exceeds max useful dimension)
        const longestSide = Math.max(originalWidth, originalHeight);
        const needsResize = longestSide > maxDimension;

        // Determine if we need to convert (PNG to JPEG for smaller file size)
        const needsConvert = isPNG;

        // If no processing needed, return original
        if (!needsResize && !needsConvert) {
          console.log(`📦 Image already optimal: ${originalWidth}x${originalHeight}, ${originalSizeMB.toFixed(2)}MB`);
          resolve({ file, warning });
          URL.revokeObjectURL(img.src);
          return;
        }

        // Calculate new dimensions if resizing needed
        if (needsResize) {
          const ratio = maxDimension / longestSide;
          finalWidth = Math.floor(originalWidth * ratio);
          finalHeight = Math.floor(originalHeight * ratio);
          console.log(`🔄 Resizing: ${originalWidth}x${originalHeight} → ${finalWidth}x${finalHeight}`);
        }

        if (needsConvert) {
          console.log(`🔄 Converting PNG to JPEG for smaller file size`);
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Use high-quality rendering
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        }

        // Convert to JPEG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Update filename extension if converted from PNG
              let newFilename = file.name;
              if (isPNG) {
                newFilename = file.name.replace(/\.png$/i, ".jpg");
              }

              const optimizedFile = new File([blob], newFilename, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              const newSizeMB = optimizedFile.size / 1024 / 1024;
              const savings = ((1 - optimizedFile.size / file.size) * 100).toFixed(0);

              console.log(`✅ Optimized: ${finalWidth}x${finalHeight}, ${newSizeMB.toFixed(2)}MB (${savings}% smaller)`);

              URL.revokeObjectURL(img.src);
              resolve({ file: optimizedFile, warning });
            } else {
              URL.revokeObjectURL(img.src);
              reject(new Error("Failed to create optimized image"));
            }
          },
          "image/jpeg",
          0.92 // High quality JPEG - optimal for print
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image for optimization"));
      };

      img.src = URL.createObjectURL(file);
    });
  };
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG or PNG image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max before resize)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 10MB. Please compress or choose a smaller image.",
        variant: "destructive",
      });
      return;
    }

try {
      // Optimize image: resize if too large, convert PNG to JPEG
      const { file: processedFile, warning } = await optimizeImageForUpload(file);
      
      setImageFile(processedFile);
      const url = URL.createObjectURL(processedFile);
      setImageUrl(url);
      
      const sizeInfo = processedFile.size < file.size 
        ? ` (optimized from ${(file.size / 1024 / 1024).toFixed(1)}MB to ${(processedFile.size / 1024 / 1024).toFixed(1)}MB)`
        : "";
      
      if (warning) {
        toast({
          title: "Image Selected",
          description: warning,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Image Selected",
          description: `${file.name} ready to upload${sizeInfo}`,
        });
      }
    } catch (error) {
      console.error("Image processing error:", error);
      // Fallback to original file if optimization fails
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      toast({
        title: "Image Selected",
        description: `${file.name} ready to upload`,
      });
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    try {
      const result = await apiService.uploadPolaroidPhoto(imageFile);
      
      if (result.success && result.data) {
        setImageId(result.data.image_id);
        setStep("crop");
        toast({
          title: "Upload Successful",
          description: "Now crop your photo to fit the polaroid frame",
        });
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropComplete = async (crop: PolaroidCropData) => {
    setCropData(crop);
    setIsProcessing(true);

    try {
      const result = await apiService.processPolaroidPhoto(imageId, crop);
      
      if (result.success) {
        setStep("text");
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

  const handleTextComplete = async (t1: string, t2: string, font: string) => {
    setText1(t1);
    setText2(t2);
    setFontName(font);
    setIsProcessing(true);

    try {
      const result = await apiService.previewPolaroidSheet(imageId, t1, t2, font);
      
      if (result.success && result.data) {
        setPreviewImage(result.data.preview);
        setStep("preview");
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

const handlePrint = async () => {
    setIsProcessing(true);

    try {
      const result = await apiService.printPolaroidSheet(imageId, text1, text2, fontName, null, 1);
      
      if (result.success && result.data) {
        toast({
          title: "Print Job Sent",
          description: `Printing to ${result.data.printer || 'default printer'}`,
        });
      } else {
        throw new Error(result.error || "Print failed");
      }
    } catch (error) {
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditText = () => {
    setStep("text");
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setStep("upload");
    setImageFile(null);
    setImageUrl("");
    setImageId("");
    setCropData(null);
    setText1("");
    setText2("");
    setFontName("default");
    setPreviewImage("");
    toast({
      title: "Workflow Reset",
      description: "Start fresh with a new photo",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center justify-center gap-2">
          {["Upload", "Crop", "Text", "Preview"].map((label, index) => {
            const stepNames: WorkflowStep[] = ["upload", "crop", "text", "preview"];
            const stepIndex = stepNames.indexOf(step);
            const isActive = index === stepIndex;
            const isCompleted = index < stepIndex;

            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      transition-all duration-300
                      ${isActive ? "bg-primary text-primary-foreground scale-110 shadow-lg" : ""}
                      ${isCompleted ? "bg-green-500 text-white shadow-md" : ""}
                      ${!isActive && !isCompleted ? "bg-gray-200 text-gray-500" : ""}
                    `}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 w-16 rounded-full transition-all duration-300 ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {step === "upload" && (
        <Card className="p-10 max-w-2xl mx-auto">
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Upload Your Photo</h2>
              <p className="text-muted-foreground text-lg">
                Choose a photo to create your polaroid prints
              </p>
            </div>

            <div className="space-y-5">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-16 cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200"
              >
                <ImagePlus className="w-16 h-16 text-muted-foreground mb-4" />
                <span className="font-semibold text-lg">Click to select image</span>
                <span className="text-sm text-muted-foreground mt-2">
                  or drag and drop your photo here
                </span>
                <span className="text-xs text-muted-foreground mt-3 px-4 py-1 bg-gray-100 rounded-full">
                  JPG or PNG • Max 10MB
                </span>
              </label>

              {imageUrl && (
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={imageUrl}
                    alt="Selected"
                    className="w-full rounded-lg"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (imageUrl) {
                          URL.revokeObjectURL(imageUrl);
                        }
                        setImageFile(null);
                        setImageUrl("");
                      }}
                      className="shadow-lg"
                    >
                      Change Photo
                    </Button>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {imageFile?.name}
                  </div>
                </div>
              )}

              {imageFile && (
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="w-full h-14 text-base font-semibold"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload and Continue
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {step === "crop" && imageUrl && (
        <PolaroidCropper
          imageUrl={imageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleReset}
        />
      )}

      {step === "text" && (
        <TextCustomization
          onComplete={handleTextComplete}
          onBack={() => setStep("crop")}
          initialText1={text1}
          initialText2={text2}
          initialFont={fontName}
        />
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <PolaroidPreview
            previewImage={previewImage}
            isGenerating={isProcessing}
            onPrint={handlePrint}
            onEdit={handleEditText}
          />
          
          {/* Reset Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Over with New Photo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
