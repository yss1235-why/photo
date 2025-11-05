// src/services/cloudinary.ts

import { ApiResponse, UploadResponse, ProcessResponse } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Cloudinary-first processing service.
 * Attempts Cloudinary processing first, falls back to Python if needed.
 */
class CloudinaryService {
  private useCloudinary: boolean = true;

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(file: File): Promise<ApiResponse<UploadResponse & { source: string }>> {
    try {
      console.log("📤 Attempting Cloudinary upload...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload-cloudinary`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
      }

      const data = await response.json();

      console.log("✅ Cloudinary upload successful:", data.image_id);

      return {
        success: true,
        data: {
          image_id: data.image_id,
          face_detected: data.face_detected,
          dimensions: data.dimensions,
          status: "received",
          source: "cloudinary",
          cloudinary_url: data.cloudinary_url,
          thumbnail_url: data.thumbnail_url,
        },
      };
    } catch (error) {
      console.error("❌ Cloudinary upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Process image with Cloudinary transformations
   */
  async processImage(
    imageId: string,
    mode: "passport" | "studio",
    enhanceLevel: number = 0.40,
    cropData?: any
  ): Promise<ApiResponse<ProcessResponse & { source: string }>> {
    try {
      console.log("🎨 Processing with Cloudinary:", imageId);

      const response = await fetch(`${API_BASE_URL}/process-cloudinary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_id: imageId,
          mode: mode,
          enhance_level: enhanceLevel,
          background: "white",
          crop_data: cropData,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Processing failed: ${error}`);
      }

      const data = await response.json();

      console.log("✅ Cloudinary processing complete");

      return {
        success: true,
        data: {
          processed_image: data.processed_image,
          face_confidence: data.face_confidence,
          bg_removed: data.bg_removed,
          status: "success",
          source: "cloudinary",
          processed_url: data.processed_url,
        },
      };
    } catch (error) {
      console.error("❌ Cloudinary processing failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Processing failed",
      };
    }
  }

  /**
   * Check Cloudinary quota/usage
   */
  async checkQuota(): Promise<{
    transformations: number;
    transformations_limit: number;
    usage_percent: number;
  } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/cloudinary-quota`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Quota check failed:", error);
      return null;
    }
  }

  /**
   * Get direct Cloudinary transformation URL
   * (useful for previews without re-downloading)
   */
  getTransformationUrl(
    publicId: string,
    mode: "passport" | "studio" = "passport",
    enhanceLevel: number = 0.40
  ): string {
    const cloudName = "ddo4o6naz";
    const width = 413; // 3.5cm at 300dpi
    const height = 531; // 4.5cm at 300dpi

    const enhance = Math.round(enhanceLevel * 100);

    // Build transformation string
    const transforms = [
      "e_background_removal",
      "b_white",
      `w_${width},h_${height},c_thumb,g_face,z_0.75`,
      mode === "passport"
        ? "e_auto_brightness,e_auto_contrast,e_auto_color,e_sharpen:80"
        : `e_auto_brightness:${enhance},e_auto_contrast:${enhance},e_auto_color:${enhance},e_sharpen:${Math.min(100, enhance + 20)}`,
      "q_100,f_png",
    ].join("/");

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
  }
}

export const cloudinaryService = new CloudinaryService();
