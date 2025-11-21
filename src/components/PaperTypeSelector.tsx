// src/components/PaperTypeSelector.tsx - Complete Paper Type Selection Component

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileImage, Image as ImageIcon, Camera, Check } from "lucide-react";
import { PaperType, PAPER_TYPE_OPTIONS } from "@/types";

interface PaperTypeSelectorProps {
  selectedType: PaperType;
  onSelect: (type: PaperType) => void;
  onContinue: () => void;
}

const getIconForType = (type: PaperType) => {
  switch (type) {
    case "passport-standard":
      return <FileImage className="w-6 h-6" />;
    case "passport-custom":
      return <ImageIcon className="w-6 h-6" />;
    case "polaroid":
      return <Camera className="w-6 h-6" />;
    default:
      return <FileImage className="w-6 h-6" />;
  }
};

const getColorForType = (type: PaperType) => {
  switch (type) {
    case "passport-standard":
      return "from-blue-500 to-blue-600";
    case "passport-custom":
      return "from-green-500 to-green-600";
    case "polaroid":
      return "from-purple-500 to-purple-600";
    default:
      return "from-gray-500 to-gray-600";
  }
};

export const PaperTypeSelector: React.FC<PaperTypeSelectorProps> = ({
  selectedType,
  onSelect,
  onContinue,
}) => {
  const selectedOption = PAPER_TYPE_OPTIONS.find((o) => o.value === selectedType);

  return (
    <Card className="p-8 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Select Paper Type</h2>
          <p className="text-muted-foreground text-lg">
            Choose the type of photo layout you want to create
          </p>
        </div>

        <RadioGroup 
          value={selectedType} 
          onValueChange={(value) => onSelect(value as PaperType)}
          className="gap-4"
        >
          {PAPER_TYPE_OPTIONS.map((option) => {
            const isSelected = selectedType === option.value;
            const Icon = () => getIconForType(option.value);
            const gradientClass = getColorForType(option.value);

            return (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className={`
                    flex items-start gap-4 rounded-xl border-2 p-5 cursor-pointer
                    transition-all duration-200 hover:shadow-md
                    ${isSelected 
                      ? "border-primary bg-primary/5 shadow-lg" 
                      : "border-muted bg-background hover:border-primary/50"
                    }
                  `}
                >
                  <div className={`
                    shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${gradientClass} text-white shadow-sm
                  `}>
                    <Icon />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg">{option.label}</div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </div>
                    <div className="flex gap-4 text-sm font-medium pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        <span>Size: {option.size}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        <span>Count: {option.count} photos</span>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {/* Special Feature Highlights */}
        {selectedType === "polaroid" && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-purple-900">
                  Polaroid Feature Highlights
                </p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Nostalgic polaroid-style photos with white borders</li>
                  <li>• Add custom text captions on each polaroid</li>
                  <li>• Choose from 11 beautiful font styles</li>
                  <li>• Perfect for scrapbooks, gifts, and memory keeping</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {selectedType === "passport-standard" && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileImage className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-blue-900">
                  Standard Passport Photos
                </p>
                <p className="text-sm text-blue-800">
                  Professional passport photos with automatic face detection, background removal, 
                  and color correction. Get 8 photos on a 6×4 inch sheet.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedType === "passport-custom" && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-green-900">
                  Custom Passport Layout
                </p>
                <p className="text-sm text-green-800">
                  More photos on a portrait layout. Perfect for visa applications and ID photos. 
                  Get 12 photos on a 4×6 inch sheet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <Button 
          onClick={onContinue} 
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          Continue with {selectedOption?.label}
        </Button>
      </div>
    </Card>
  );
};
