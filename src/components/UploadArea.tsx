import { Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isProcessing?: boolean;
}

const optimizeImageForUpload = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      const isPNG = file.type === "image/png";

      // Print quality thresholds for passport photos (35mm x 45mm at 300 DPI)
      const maxDimension = 1400; // More than enough for 300 DPI printing

      let finalWidth = originalWidth;
      let finalHeight = originalHeight;

      // Determine if we need to resize (image exceeds max useful dimension)
      const longestSide = Math.max(originalWidth, originalHeight);
      const needsResize = longestSide > maxDimension;

      // Determine if we need to convert (PNG to JPEG for smaller file size)
      const needsConvert = isPNG;

      // If no processing needed, return original
      if (!needsResize && !needsConvert) {
        console.log(`📦 Image already optimal: ${originalWidth}x${originalHeight}`);
        resolve(file);
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

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            let newFilename = file.name;
            if (isPNG) {
              newFilename = file.name.replace(/\.png$/i, ".jpg");
            }

            const optimizedFile = new File([blob], newFilename, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            const savings = ((1 - optimizedFile.size / file.size) * 100).toFixed(0);
            console.log(`✅ Optimized: ${finalWidth}x${finalHeight}, ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`);

            URL.revokeObjectURL(img.src);
            resolve(optimizedFile);
          } else {
            URL.revokeObjectURL(img.src);
            reject(new Error("Failed to create optimized image"));
          }
        },
        "image/jpeg",
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image for optimization"));
    };

    img.src = URL.createObjectURL(file);
  });
};
export const UploadArea = ({ onUpload, isProcessing = false }: UploadAreaProps) => {
  const [isResizing, setIsResizing] = useState(false);

  const processAndUpload = useCallback(async (file: File) => {
    try {
      setIsResizing(true);
      const processedFile = await optimizeImageForUpload(file);
      onUpload(processedFile);
    } catch (error) {
      console.error("Image processing error:", error);
      onUpload(file);
    } finally {
      setIsResizing(false);
    }
  }, [onUpload]);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processAndUpload(file);
    }
  }, [processAndUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUpload(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative w-full h-full min-h-[500px] border-4 border-dashed border-primary/30 hover:border-primary rounded-2xl transition-all duration-300 bg-card hover:bg-primary/5 cursor-pointer group flex items-center justify-center"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <div className="flex flex-col items-center gap-6 pointer-events-none">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          {(isProcessing || isResizing) ? (
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-12 h-12 md:w-16 md:h-16 text-primary" />
          )}
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">
          {isResizing ? "Optimizing image..." : isProcessing ? "Processing..." : "Click here to upload your photo"}
        </h2>
      </div>
    </div>
  );
};
