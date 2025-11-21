// src/components/PolaroidCropper.tsx - Complete Polaroid Image Cropper Component

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Crop, ZoomIn, ZoomOut, RotateCw, Move } from "lucide-react";
import { PolaroidCropData } from "@/types";

interface PolaroidCropperProps {
  imageUrl: string;
  onCropComplete: (cropData: PolaroidCropData) => void;
  onCancel: () => void;
}

const POLAROID_ASPECT_RATIO = 2.3 / 2.5; // Width / Height = 0.92

export const PolaroidCropper: React.FC<PolaroidCropperProps> = ({
  imageUrl,
  onCropComplete,
  onCancel,
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    console.log("Image loaded:", img.naturalWidth, "x", img.naturalHeight);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Calculate boundaries to prevent image from being dragged too far
      const container = containerRef.current.getBoundingClientRect();
      const maxX = 0;
      const maxY = 0;
      const minX = -(container.width * zoom - container.width);
      const minY = -(container.height * zoom - container.height);

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      });
    },
    [isDragging, dragStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0];
    setZoom(newZoom);
    
    // Adjust position to keep image centered when zooming
    if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const centerX = container.width / 2;
      const centerY = container.height / 2;
      
      const scaleDiff = newZoom / zoom;
      const newX = centerX - (centerX - position.x) * scaleDiff;
      const newY = centerY - (centerY - position.y) * scaleDiff;
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCropComplete = () => {
    if (!containerRef.current || !imageRef.current || naturalDimensions.width === 0) {
      console.error("Cannot complete crop: missing dimensions");
      return;
    }

    const container = containerRef.current.getBoundingClientRect();

    // Calculate the visible area in terms of the original image
    // Position is negative when image is dragged, so we use absolute value
    const visibleX = Math.abs(position.x) / (container.width * zoom);
    const visibleY = Math.abs(position.y) / (container.height * zoom);
    const visibleWidth = container.width / (container.width * zoom);
    const visibleHeight = container.height / (container.height * zoom);

    // Ensure values are between 0 and 1
    const normalizedX = Math.max(0, Math.min(1, visibleX));
    const normalizedY = Math.max(0, Math.min(1, visibleY));
    const normalizedWidth = Math.max(0, Math.min(1, visibleWidth));
    const normalizedHeight = Math.max(0, Math.min(1, visibleHeight));

    const cropData: PolaroidCropData = {
      x: normalizedX,
      y: normalizedY,
      width: normalizedWidth,
      height: normalizedHeight,
      naturalWidth: naturalDimensions.width,
      naturalHeight: naturalDimensions.height,
      zoom: zoom,
    };

    console.log("Crop data:", cropData);
    onCropComplete(cropData);
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Crop Your Polaroid Photo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Position your image within the polaroid frame
            </p>
          </div>
          <div className="text-sm text-muted-foreground text-right">
            <div>Aspect Ratio: 2.3:2.5</div>
            <div className="text-xs">(Polaroid Format)</div>
          </div>
        </div>

        {/* Crop Area Container */}
        <div className="flex flex-col items-center space-y-4">
          <div
            ref={containerRef}
            className="relative bg-gray-100 overflow-hidden cursor-move shadow-lg"
            style={{
              width: "460px",
              height: "500px",
              aspectRatio: `${POLAROID_ASPECT_RATIO}`,
            }}
            onMouseDown={handleMouseDown}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="absolute select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: isDragging ? "grabbing" : "grab",
              }}
              draggable={false}
              onLoad={handleImageLoad}
            />
            
            {/* Crop Frame Overlay */}
            <div className="absolute inset-0 border-4 border-white shadow-inner pointer-events-none">
              <div className="absolute inset-0 border-2 border-dashed border-gray-400 opacity-75" />
            </div>

            {/* Corner Markers */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Move className="w-4 h-4" />
            <span>Drag to reposition • Scroll or use slider to zoom</span>
          </div>
        </div>

        {/* Zoom Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[zoom]}
              onValueChange={handleZoomChange}
              min={1}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <ZoomIn className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Zoom: {zoom.toFixed(1)}x</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1"
            >
              <RotateCw className="w-3 h-3" />
              Reset
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Instructions:</strong> Click and drag the image to position it within the polaroid frame. 
            Use the zoom slider to scale the image. The entire visible area within the white border will 
            become your polaroid photo.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} size="lg">
            Cancel
          </Button>
          <Button 
            onClick={handleCropComplete} 
            className="gap-2"
            size="lg"
            disabled={naturalDimensions.width === 0}
          >
            <Crop className="w-4 h-4" />
            Apply Crop & Continue
          </Button>
        </div>
      </div>
    </Card>
  );
};
