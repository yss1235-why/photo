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
  preview_sheet?: string;
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
  { name: "Montserrat-Bold", displayName: "Montserrat Bold", preview: "The quick brown fox" },
  { name: "Pacifico-Regular", displayName: "Pacifico", preview: "The quick brown fox" },
  { name: "DancingScript-Regular", displayName: "Dancing Script", preview: "The quick brown fox" },
  { name: "GreatVibes-Regular", displayName: "Great Vibes", preview: "The quick brown fox" },
  { name: "Satisfy-Regular", displayName: "Satisfy", preview: "The quick brown fox" },
  { name: "Sacramento-Regular", displayName: "Sacramento", preview: "The quick brown fox" },
  { name: "Caveat-Regular", displayName: "Caveat", preview: "The quick brown fox" },
  { name: "KaushanScript-Regular", displayName: "Kaushan Script", preview: "The quick brown fox" },
  { name: "Allura-Regular", displayName: "Allura", preview: "The quick brown fox" },
  { name: "Lobster-Regular", displayName: "Lobster", preview: "The quick brown fox" },
];

// ==========================================
// PAPER TYPE CONFIGURATION (UPDATED - SIMPLIFIED)
// ==========================================

export type PaperType = "passport" | "polaroid" | "passport-a4";

export interface PaperTypeOption {
  value: PaperType;
  label: string;
  description: string;
  details: string;
}

export const PAPER_TYPE_OPTIONS: PaperTypeOption[] = [
  {
    value: "passport",
    label: "Passport Printing",
    description: "Professional passport photos with background removal",
    details: "Choose your layout: 8 photos (landscape) or 12 photos (portrait)",
  },
  {
    value: "passport-a4",
    label: "Passport A4 Sheet",
    description: "Multiple passport photos on A4 paper",
    details: "Up to 42 photos (6×7 layout) on high-quality glossy A4 sheet",
  },
  {
    value: "polaroid",
    label: "Polaroid",
    description: "Nostalgic polaroid-style photos with custom text",
    details: "2 polaroid photos with white borders and personalized captions",
  },
];

// ==========================================
// A4 SHEET TYPES
// ==========================================

export interface A4SheetPreviewResponse {
  status: string;
  preview: string;
  preview_sheet: string;
  dimensions: string;
  dpi: number;
  rows: number;
  total_photos: number;
}

// ==========================================
// UI STATE TYPES
// ==========================================

export interface PhotoData {
  original: string | null;
  processed: string | null;
  cropped: string | null;
  final: string | null;
  imageId?: string;
}

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

// ==========================================
// FRONTEND CONFIG TYPES (Admin Controlled)
// ==========================================

export interface FrontendFeatures {
  passport_4x6: boolean;
  passport_a4: boolean;
  polaroid: boolean;
}

export interface FrontendConfig {
  features: FrontendFeatures;
  mobile_only_mode: boolean;
  one_time_link_mode: boolean;
}

export interface PrintResponse {
  success: boolean;
  queued?: boolean;
  job_id?: string;
  printer?: string;
  message?: string;
  settings?: Record<string, unknown>;
}
