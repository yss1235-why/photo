import { useEffect, useState } from "react";

interface ImagePreviewProps {
  originalImage: string | null;
  processedImage: string | null;
}

export const ImagePreview = ({ originalImage, processedImage }: ImagePreviewProps) => {
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setDividerPosition(Math.max(0, Math.min(100, percentage)));
  };

  if (!originalImage) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Original</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Processed</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="relative rounded-lg overflow-hidden bg-muted border border-border shadow-lg">
          <img
            src={originalImage}
            alt="Original"
            className="w-full h-auto object-contain max-h-[500px]"
          />
        </div>

        {/* Processed Image */}
        <div className="relative rounded-lg overflow-hidden bg-muted border border-border shadow-lg">
          {processedImage ? (
            <img
              src={processedImage}
              alt="Processed"
              className="w-full h-auto object-contain max-h-[500px]"
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Processing image...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Slider (if both images available) */}
      {processedImage && (
        <div 
          className="relative h-[400px] rounded-lg overflow-hidden cursor-col-resize select-none border border-border shadow-lg"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Original Image */}
          <img
            src={originalImage}
            alt="Original comparison"
            className="absolute inset-0 w-full h-full object-contain"
          />
          
          {/* Processed Image with Clip */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - dividerPosition}% 0 0)` }}
          >
            <img
              src={processedImage}
              alt="Processed comparison"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>

          {/* Divider */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg"
            style={{ left: `${dividerPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <div className="flex gap-1">
                <div className="w-0.5 h-4 bg-primary-foreground" />
                <div className="w-0.5 h-4 bg-primary-foreground" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            Drag to compare
          </div>
        </div>
      )}
    </div>
  );
};
