// src/types/index.ts - Complete Type Definitions

// ==========================================
// COMMON TYPES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
}

// ==========================================
// PASSPORT PHOTO TYPES
// ==========================================

export interface UploadResponse {
  status: string;
  image_id: string;
  face_detected?: boolean;
  face_confidence?: number;
  landmarks_detected?: boolean;
  dimensions: [number, number];
  source?: "cloudinary" | "python";
}

export interface ProcessResponse {
  status: string;
  image_id: string;
  before_image?: string;
  after_image?: string;
  processed_image: string;
  face_confidence?: number;
  bg_removed?: boolean;
  source?: "cloudinary" | "python";
}

export interface SheetPreviewResponse {
  status: string;
  preview: string;
  dimensions: string;
  dpi: number;
}

export interface DownloadResponse {
  file: string;
  filename: string;
  size_bytes: number;
  dimensions: string;
  dpi: number;
}

export interface PrintResponse {
  status: string;
  message: string;
}

// ==========================================
// POLAROID PHOTO TYPES
// ==========================================

export interface PolaroidUploadResponse {
  status: string;
  image_id: string;
  dimensions: [number, number];
  type: "polaroid";
}

export interface PolaroidProcessResponse {
  status: string;
  image_id: string;
  processed_image: string;
  type: "polaroid";
}

export interface PolaroidPreviewResponse {
  status: string;
  preview: string;
  dimensions: string;
  dpi: number;
  type: "polaroid";
}

export interface PolaroidDownloadResponse {
  status: string;
  file: string;
  filename: string;
  size_bytes: number;
  dimensions: string;
  dpi: number;
  type: "polaroid";
}

export interface PolaroidCropData {
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
}

// ==========================================
// FONT TYPES
// ==========================================

export interface FontOption {
  name: string;
  displayName: string;
  preview: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  { name: "default", displayName: "Default", preview: "The quick brown fox" },
  { name: "handwriting_01", displayName: "Handwriting 1", preview: "The quick brown fox" },
  { name: "handwriting_02", displayName: "Handwriting 2", preview: "The quick brown fox" },
  { name: "script_01", displayName: "Script 1", preview: "The quick brown fox" },
  { name: "script_02", displayName: "Script 2", preview: "The quick brown fox" },
  { name: "elegant_01", displayName: "Elegant", preview: "The quick brown fox" },
  { name: "playful_01", displayName: "Playful", preview: "The quick brown fox" },
  { name: "vintage_01", displayName: "Vintage", preview: "The quick brown fox" },
  { name: "modern_01", displayName: "Modern", preview: "The quick brown fox" },
  { name: "casual_01", displayName: "Casual", preview: "The quick brown fox" },
  { name: "artistic_01", displayName: "Artistic", preview: "The quick brown fox" },
];

// ==========================================
// PAPER TYPE CONFIGURATION
// ==========================================

export type PaperType = "passport-standard" | "passport-custom" | "polaroid";

export interface PaperTypeOption {
  value: PaperType;
  label: string;
  description: string;
  size: string;
  count: number;
}

export const PAPER_TYPE_OPTIONS: PaperTypeOption[] = [
  {
    value: "passport-standard",
    label: "Passport Standard",
    description: "Standard passport photo layout",
    size: "6×4 inches",
    count: 8,
  },
  {
    value: "passport-custom",
    label: "Passport Custom",
    description: "Custom passport photo layout",
    size: "4×6 inches",
    count: 12,
  },
  {
    value: "polaroid",
    label: "Polaroid",
    description: "Two polaroid photos with custom text",
    size: "6×4 inches",
    count: 2,
  },
];

// ==========================================
// UI STATE TYPES
// ==========================================

export type WorkflowStep = "upload" | "crop" | "text" | "preview";

export interface WorkflowState {
  step: WorkflowStep;
  imageFile: File | null;
  imageUrl: string;
  imageId: string;
  cropData: CropData | null;
  isProcessing: boolean;
}

export interface PolaroidState extends WorkflowState {
  text1: string;
  text2: string;
  fontName: string;
  previewImage: string;
}
