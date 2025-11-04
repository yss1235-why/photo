// src/components/steps/Step3Crop.tsx

import { useState } from "react";
import { CropTool } from "@/components/CropTool";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CropData } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface Step3CropProps {
  imageUrl: string;
  imageId: string;
  onCropComplete: (croppedImage: string, cropData: CropData) => void;
}

const Step3Crop = ({ imageUrl, imageId, onCropComplete }: Step3CropProps) => {
  const { toast } = useToast();
  const [cropData, setCropData] = useState<CropData | null>(null);

  const handleCropChange = (data: CropData) => {
    setCropData(data);
    
    // ✅ Log crop data for debugging
    console.log("📐 Crop data received:", {
      normalized: `${(data.x * 100).toFixed(1)}%, ${(data.y * 100).toFixed(1)}%`,
      size: `${(data.width * 100).toFixed(1)}% × ${(data.height * 100).toFixed(1)}%`,
      natural: `${data.naturalWidth}×${data.naturalHeight}`,
      zoom: `${(data.zoom * 100).toFixed(0)}%`
    });
  };

  const handleContinue = async () => {
    if (!cropData) {
      toast({
        title: "Adjust crop area",
        description: "Please position the crop area over your face",
        variant: "destructive",
      });
      return;
    }

    // ✅ Validate crop data before proceeding
    if (!cropData.naturalWidth || !cropData.naturalHeight) {
      toast({
        title: "Image not loaded",
        description: "Please wait for the image to load completely",
        variant: "destructive",
      });
      return;
    }

    // Validate normalized coordinates
    if (cropData.x < 0 || cropData.x > 1 || cropData.y < 0 || cropData.y > 1) {
      toast({
        title: "Invalid crop position",
        description: "Please adjust the crop area within the image",
        variant: "destructive",
      });
      return;
    }

    if (cropData.width <= 0 || cropData.width > 1 || cropData.height <= 0 || cropData.height > 1) {
      toast({
        title: "Invalid crop size",
        description: "Please adjust the crop area to a valid size",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Crop validation passed, proceeding to next step");
    
    // Pass both the image URL and crop data to next step
    // Backend will use the crop data during processing
    onCropComplete(imageUrl, cropData);
    
    toast({
      title: "✅ Crop area set",
      description: "Your crop settings will be applied during processing",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Crop to Passport Size
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Position your face in the center (3.5cm × 4.5cm standard)
        </p>
      </div>

      <CropTool 
        imageUrl={imageUrl} 
        onCropChange={handleCropChange}
      />

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-2 text-sm">
          📐 Cropping Tips:
        </h3>
        <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
          <li>• Center your face in the crop area</li>
          <li>• Use zoom to adjust size</li>
          <li>• Ensure entire face is visible</li>
          <li>• Leave space above your head</li>
          <li>• Face should be 70-80% of frame height</li>
        </ul>
      </div>

      {/* ✅ Show crop status */}
      {cropData && (
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/30">
          <div className="text-xs font-medium text-primary flex items-center gap-2">
            <span>✓</span>
            <span>
              Crop area set: {(cropData.width * 100).toFixed(0)}% × {(cropData.height * 100).toFixed(0)}% 
              @ {(cropData.zoom * 100).toFixed(0)}% zoom
            </span>
          </div>
        </div>
      )}

      <Button 
        onClick={handleContinue} 
        disabled={!cropData}
        className="w-full gap-2"
        size="lg"
      >
        Continue to Enhancement
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Step3Crop;
