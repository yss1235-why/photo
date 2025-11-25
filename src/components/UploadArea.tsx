import { Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isProcessing?: boolean;
}

const resizeImageIfNeeded = (file: File, maxSizeBytes: number = 3 * 1024 * 1024): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (file.size <= maxSizeBytes) {
      console.log(`📦 Image already under ${maxSizeBytes / 1024 / 1024}MB, no resize needed`);
      resolve(file);
      return;
    }

    console.log(`🔄 Resizing image from ${(file.size / 1024 / 1024).toFixed(2)}MB...`);

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      const ratio = Math.sqrt(maxSizeBytes / file.size);
      let finalWidth = Math.floor(img.width * ratio);
      let finalHeight = Math.floor(img.height * ratio);

      const minDimension = 1200;
      if (Math.max(finalWidth, finalHeight) < minDimension) {
        if (img.width > img.height) {
          finalWidth = minDimension;
          finalHeight = Math.floor((minDimension / img.width) * img.height);
        } else {
          finalHeight = minDimension;
          finalWidth = Math.floor((minDimension / img.height) * img.width);
        }
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
            const resizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            console.log(`✅ Resized to ${(resizedFile.size / 1024 / 1024).toFixed(2)}MB (${finalWidth}x${finalHeight})`);
            resolve(resizedFile);
          } else {
            reject(new Error("Failed to create resized image"));
          }
        },
        "image/jpeg",
        0.92
      );
    };

    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    img.src = URL.createObjectURL(file);
  });
};

export const UploadArea = ({ onUpload, isProcessing = false }: UploadAreaProps) => {
  const [isResizing, setIsResizing] = useState(false);

  const processAndUpload = useCallback(async (file: File) => {
    try {
      setIsResizing(true);
      const processedFile = await resizeImageIfNeeded(file, 3 * 1024 * 1024);
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
      <<div className="flex flex-col items-center gap-6 pointer-events-none">
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
