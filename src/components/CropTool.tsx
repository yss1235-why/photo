// src/components/CropTool.tsx - UPDATED WITH ASPECT RATIO PROP

import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CropData } from "@/types";

interface CropToolProps {
  imageUrl: string;
  onCropChange: (cropData: CropData) => void;
  aspectRatio?: number; // Optional: defaults to passport ratio (3.5/4.5)
  cropBoxLabel?: string; // Optional: label for the crop box
}

export const CropTool = ({ 
  imageUrl, 
  onCropChange, 
  aspectRatio,
  cropBoxLabel 
}: CropToolProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });

  // Use provided aspect ratio or default to passport (3.5:4.5)
  const CROP_ASPECT_RATIO = aspectRatio || (3.5 / 4.5);
  const displayLabel = cropBoxLabel || `Aspect Ratio: ${aspectRatio ? aspectRatio.toFixed(2) : '0.78'}`;

  useEffect(() => {
    if (imageLoaded && naturalDimensions.width > 0) {
      updateCropData();
    }
  }, [zoom, position, imageLoaded, naturalDimensions]);

  const updateCropData = () => {
    if (!containerRef.current || !imageRef.current || !cropBoxRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current;
    
    const displayWidth = image.offsetWidth;
    const displayHeight = image.offsetHeight;
    
    // Get actual crop box dimensions from the rendered element
    const cropBox = cropBoxRef.current;
    const cropWidth = cropBox.offsetWidth;
    const cropHeight = cropBox.offsetHeight;
    
    const containerCenterX = container.width / 2;
    const containerCenterY = container.height / 2;
    
    const cropLeft = containerCenterX - cropWidth / 2;
    const cropTop = containerCenterY - cropHeight / 2;
    
    const imageCropX = (cropLeft - position.x) / zoom;
    const imageCropY = (cropTop - position.y) / zoom;
    const imageCropWidth = cropWidth / zoom;
    const imageCropHeight = cropHeight / zoom;
    
    const normalizedX = imageCropX / displayWidth;
    const normalizedY = imageCropY / displayHeight;
    const normalizedWidth = imageCropWidth / displayWidth;
    const normalizedHeight = imageCropHeight / displayHeight;
    
    const cropData: CropData = {
      x: normalizedX,
      y: normalizedY,
      width: normalizedWidth,
      height: normalizedHeight,
      naturalWidth: naturalDimensions.width,
      naturalHeight: naturalDimensions.height,
      zoom: zoom,
    };
    
    onCropChange(cropData);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageLoaded(true);
    
    if (containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      const imgWidth = img.offsetWidth;
      const imgHeight = img.offsetHeight;
      
      const initialX = (containerWidth - imgWidth) / 2;
      const initialY = (containerHeight - imgHeight) / 2;
      
      setPosition({ x: initialX, y: initialY });
    }
  };

 const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    if (containerRef.current && imageRef.current) {
      const container = containerRef.current;
      const img = imageRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const imgWidth = img.offsetWidth;
      const imgHeight = img.offsetHeight;
      
      setPosition({
        x: (containerWidth - imgWidth) / 2,
        y: (containerHeight - imgHeight) / 2,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative bg-muted overflow-hidden">
       <div
          ref={containerRef}
          className="relative w-full h-full cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ touchAction: 'none', userSelect: 'none' }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Photo to crop"
            className="absolute select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />

          <div
            ref={cropBoxRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary pointer-events-none"
            style={{
              width: `${Math.min(containerRef.current?.clientWidth ? containerRef.current.clientWidth * 0.7 : 280, 460)}px`,
              aspectRatio: `${CROP_ASPECT_RATIO}`,
            }}
          >
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary" />
            
            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
            
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] aspect-square rounded-full border-2 border-dashed border-primary/40" />
          </div>

          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            {!imageLoaded ? "Loading..." : "Drag to position"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-center gap-2 bg-card border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <div className="px-4 py-2 bg-muted rounded-md text-sm font-medium min-w-[80px] text-center">
          {Math.round(zoom * 100)}%
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </div>
  );
};
