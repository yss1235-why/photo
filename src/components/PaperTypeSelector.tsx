// src/components/PaperTypeSelector.tsx - Simplified Paper Type Selection

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileImage, Camera, Check, FileText } from "lucide-react";
import { PaperType, PAPER_TYPE_OPTIONS, FrontendFeatures } from "@/types";

interface PaperTypeSelectorProps {
  selectedType: PaperType;
  onSelect: (type: PaperType) => void;
  onContinue: () => void;
  enabledFeatures?: FrontendFeatures;
}

const getIconForType = (type: PaperType) => {
  switch (type) {
    case "passport":
      return <FileImage className="w-6 h-6" />;
    case "passport-a4":
      return <FileText className="w-6 h-6" />;
    case "polaroid":
      return <Camera className="w-6 h-6" />;
    default:
      return <FileImage className="w-6 h-6" />;
  }
};

const getColorForType = (type: PaperType) => {
  switch (type) {
    case "passport":
      return "from-blue-500 to-blue-600";
    case "passport-a4":
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
  enabledFeatures,
}) => {
  console.log("🎛️ PaperTypeSelector - enabledFeatures:", enabledFeatures);
 // Filter options based on enabled features
  const filteredOptions = PAPER_TYPE_OPTIONS.filter((option) => {
    if (!enabledFeatures) return true; // Show all if no config loaded
    
    console.log("🔍 Filtering option:", option.value, "Features:", enabledFeatures);
    
    switch (option.value) {
      case "passport":
      case "passport-standard":
      case "passport-custom":
        return enabledFeatures.passport_4x6;
      case "passport-a4":
        return enabledFeatures.passport_a4;
      case "polaroid":
        return enabledFeatures.polaroid;
      default:
        return true;
    }
  });

  // If current selection is disabled, auto-select first available
  React.useEffect(() => {
    if (filteredOptions.length > 0 && !filteredOptions.find(o => o.value === selectedType)) {
      onSelect(filteredOptions[0].value);
    }
  }, [filteredOptions, selectedType, onSelect]);

  const selectedOption = filteredOptions.find((o) => o.value === selectedType);

  // If no features are enabled, show message
  if (filteredOptions.length === 0) {
    return (
      <Card className="p-8 max-w-3xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">No Features Available</h2>
          <p className="text-muted-foreground">
            All photo printing features are currently disabled by the administrator.
            Please contact support for assistance.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Select Photo Type</h2>
          <p className="text-muted-foreground text-lg">
            Choose the type of photo you want to create
          </p>
        </div>

        <RadioGroup 
          value={selectedType} 
          onValueChange={(value) => onSelect(value as PaperType)}
          className="gap-4"
        >
          {filteredOptions.map((option) => {
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
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${gradientClass} text-white
                  `}>
                    <Icon />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{option.label}</h3>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {option.details}
                    </p>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {/* Info Box for Selected Type */}
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
                  Polaroid Photos
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

       {selectedType === "passport" && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileImage className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-blue-900">
                  Passport Printing
                </p>
                <p className="text-sm text-blue-800">
                  Professional passport photos with automatic face detection, background removal, 
                  and color correction. You'll choose your layout in the next step (8 or 12 photos).
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedType === "passport-a4" && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-green-900">
                  Passport A4 Sheet
                </p>
                <p className="text-sm text-green-800">
                  Print up to 42 passport photos on a single A4 sheet (6 photos per row, up to 7 rows).
                  Perfect for bulk printing with high-quality glossy paper.
                </p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• 6 photos per row</li>
                  <li>• Choose 1-7 rows (6-42 photos)</li>
                  <li>• Professional 300 DPI quality</li>
                  <li>• Optimized for A4 glossy paper</li>
                </ul>
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
