// src/components/PolaroidPreview.tsx - Complete Polaroid Sheet Preview Component

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, Loader2, Image as ImageIcon, Ruler, Sparkles } from "lucide-react";

interface PolaroidPreviewProps {
  previewImage: string;
  isGenerating: boolean;
  onDownload: () => void;
  onEdit: () => void;
}

export const PolaroidPreview: React.FC<PolaroidPreviewProps> = ({
  previewImage,
  isGenerating,
  onDownload,
  onEdit,
}) => {
  return (
    <Card className="p-8 max-w-5xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Preview Your Polaroid Sheet</h2>
          <p className="text-muted-foreground text-lg">
            Review your polaroid sheet before downloading
          </p>
        </div>

        {/* Preview Image */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-inner">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary/20" />
              </div>
              <p className="text-muted-foreground mt-6 text-lg font-medium">
                Generating your polaroid sheet...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This may take a few seconds
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Preview */}
              <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
                <img
                  src={previewImage}
                  alt="Polaroid sheet preview"
                  className="w-full h-auto"
                />
                
                {/* Preview Badge */}
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                  Preview
                </div>
              </div>

              {/* Print Specifications */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-4 h-4 text-primary" />
                    <div className="font-semibold text-sm">Paper Size</div>
                  </div>
                  <div className="text-2xl font-bold">6×4"</div>
                  <div className="text-xs text-muted-foreground mt-1">Landscape</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <div className="font-semibold text-sm">Resolution</div>
                  </div>
                  <div className="text-2xl font-bold">300 DPI</div>
                  <div className="text-xs text-muted-foreground mt-1">Print Quality</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <div className="font-semibold text-sm">Count</div>
                  </div>
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-xs text-muted-foreground mt-1">Polaroids</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Printing Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex gap-4">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-blue-900 text-base">
                Printing Instructions
              </p>
              <ul className="text-sm text-blue-800 space-y-1.5 leading-relaxed">
                <li>• Download the high-resolution PNG file below</li>
                <li>• Print on 4×6 inch photo paper in <strong>landscape orientation</strong></li>
                <li>• Use photo quality settings for best results</li>
                <li>• Follow the dashed cut lines to separate your polaroids</li>
                <li>• Recommended paper: Glossy or matte photo paper</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between pt-2">
          <Button 
            variant="outline" 
            onClick={onEdit} 
            disabled={isGenerating}
            size="lg"
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Text or Font
          </Button>
          <Button 
            onClick={onDownload} 
            disabled={isGenerating} 
            className="gap-2 px-8"
            size="lg"
          >
            <Download className="w-4 h-4" />
            Download Polaroid Sheet
          </Button>
        </div>
      </div>
    </Card>
  );
};
