// src/types/index.ts

export type ProcessingMode = "passport" | "studio";

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface UploadResponse {
  image_id: string;
  status: string;
  face_detected: boolean;
  face_confidence?: number;
  dimensions?: [number, number];
  source?: string;
}

export interface ProcessResponse {
  image_id?: string;
  processed_image: string;
  before_image?: string;  // NEW: Before background removal
  after_image?: string;   // NEW: After background removal
  face_confidence: number;
  bg_removed: boolean;
  source?: string;
}

export interface SheetPreviewResponse {
  preview_sheet: string;
  sheet_size: string;
  dpi: number;
  file_path: string;
  layout_info: {
    type: string;
    photos_count: number;
    orientation: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
