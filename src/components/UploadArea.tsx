import { Upload, Image as ImageIcon } from "lucide-react";
import { useCallback } from "react";

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isProcessing?: boolean;
}

export const UploadArea = ({ onUpload, isProcessing = false }: UploadAreaProps) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative border-2 border-dashed border-border hover:border-primary rounded-xl p-12 text-center transition-all duration-300 bg-card hover:bg-secondary/50 cursor-pointer group"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          {isProcessing ? (
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isProcessing ? "Processing..." : "Upload Your Photo"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to select
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports JPG, PNG (Max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};
