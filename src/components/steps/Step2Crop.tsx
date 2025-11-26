// src/components/steps/Step2Crop.tsx - UPDATED WITH ASPECT RATIO PROP

import { useState } from "react";
import { CropTool } from "@/components/CropTool";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CropData } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface Step2CropProps {
  imageUrl: string;
  onCropComplete: (croppedImage: string, cropData: CropData) => void;
  onRetake: () => void;
  aspectRatio?: number; // Optional: defaults to passport ratio
  title?: string; // Optional: custom title
  subtitle?: string; // Optional: custom subtitle
}

const Step2Crop = ({ 
  imageUrl, 
  onCropComplete, 
  onRetake,
  aspectRatio,
  title,
  subtitle
}: Step2CropProps) => {
  const { toast } = useToast();
  const [cropData, setCropData] = useState<CropData | null>(null);

  const handleCropChange = (data: CropData) => {
    setCropData(data);
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

    if (!cropData.naturalWidth || !cropData.naturalHeight) {
      toast({
        title: "Image not loaded",
        description: "Please wait for the image to load completely",
        variant: "destructive",
      });
      return;
    }

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

    onCropComplete(imageUrl, cropData);
  };

  const getDefaultTitle = () => {
    if (aspectRatio === (2.3/2.5)) return "Crop Your Polaroid Photo";
    if (aspectRatio === (32.42/40.0)) return "Crop Your A4 Passport Photo";
    return "Crop Your Photo";
  };
  
  const getDefaultSubtitle = () => {
    if (aspectRatio === (2.3/2.5)) return "Position your image within the polaroid frame";
    if (aspectRatio === (32.42/40.0)) return "Position your face within the A4 passport frame";
    return "Position your face within the passport frame";
  };
  
  const defaultTitle = getDefaultTitle();
  const defaultSubtitle = getDefaultSubtitle();
  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title || defaultTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle || defaultSubtitle}
            </p>
          </div>
         <div className="text-sm text-muted-foreground text-right">
            <div>Aspect Ratio: {aspectRatio ? `${(aspectRatio * 100).toFixed(0)}%` : '78%'}</div>
            <div className="text-xs">
              {aspectRatio === (2.3/2.5) ? '(Polaroid Format)' : aspectRatio === (32.42/40.0) ? '(A4 Passport Format)' : '(Passport Format)'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <CropTool 
          imageUrl={imageUrl} 
          onCropChange={handleCropChange}
          aspectRatio={aspectRatio}
        />
      </div>

      <div className="p-4 flex gap-2">
        <Button 
          onClick={onRetake} 
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Retake Photo
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!cropData}
          className="flex-1 gap-2"
          size="lg"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step2Crop;
