// src/components/TextCustomization.tsx - Complete Text Customization Component

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { AVAILABLE_FONTS, FontOption } from "@/types";

interface TextCustomizationProps {
  onComplete: (text1: string, text2: string, fontName: string) => void;
  onBack: () => void;
  initialText1?: string;
  initialText2?: string;
  initialFont?: string;
}

const MAX_TEXT_LENGTH = 50;

export const TextCustomization: React.FC<TextCustomizationProps> = ({
  onComplete,
  onBack,
  initialText1 = "",
  initialText2 = "",
  initialFont = "default",
}) => {
  const [text1, setText1] = useState(initialText1);
  const [text2, setText2] = useState(initialText2);
  const [selectedFont, setSelectedFont] = useState(initialFont);
  const [errors, setErrors] = useState<{ text1?: string; text2?: string }>({});

  const validateText = (text: string): string | undefined => {
    if (text.length > MAX_TEXT_LENGTH) {
      return `Text must be ${MAX_TEXT_LENGTH} characters or less`;
    }
    if (text.includes("\n") || text.includes("\r") || text.includes("\t")) {
      return "Text cannot contain line breaks or tabs";
    }
    return undefined;
  };

  const handleText1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText1(newText);
    const error = validateText(newText);
    setErrors((prev) => ({ ...prev, text1: error }));
  };

  const handleText2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText2(newText);
    const error = validateText(newText);
    setErrors((prev) => ({ ...prev, text2: error }));
  };

  const handleSameAsFirst = () => {
    setText2(text1);
    const error = validateText(text1);
    setErrors((prev) => ({ ...prev, text2: error }));
  };

  const handleClearBoth = () => {
    setText1("");
    setText2("");
    setErrors({});
  };

  const handleContinue = () => {
    const error1 = validateText(text1);
    const error2 = validateText(text2);

    if (error1 || error2) {
      setErrors({ text1: error1, text2: error2 });
      return;
    }

    onComplete(text1, text2, selectedFont);
  };

  const selectedFontObj = AVAILABLE_FONTS.find((f) => f.name === selectedFont);

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Type className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Customize Your Polaroid Text</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add captions to your polaroid photos
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Text for First Polaroid */}
          <div className="space-y-2">
            <Label htmlFor="text1" className="text-base font-semibold">
              First Polaroid Caption
            </Label>
            <Input
              id="text1"
              value={text1}
              onChange={handleText1Change}
              placeholder="e.g., Summer Memories 2024"
              maxLength={MAX_TEXT_LENGTH}
              className={`h-11 ${errors.text1 ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            <div className="flex justify-between items-center text-sm">
              {errors.text1 ? (
                <span className="text-red-500 font-medium">{errors.text1}</span>
              ) : (
                <span className="text-muted-foreground">
                  Optional: Leave blank for no text
                </span>
              )}
              <span className={`${text1.length > 40 ? "text-orange-500 font-medium" : "text-muted-foreground"}`}>
                {text1.length}/{MAX_TEXT_LENGTH}
              </span>
            </div>
          </div>

          {/* Text for Second Polaroid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="text2" className="text-base font-semibold">
                Second Polaroid Caption
              </Label>
              {text1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSameAsFirst}
                  className="h-7 text-xs"
                >
                  Same as first
                </Button>
              )}
            </div>
            <Input
              id="text2"
              value={text2}
              onChange={handleText2Change}
              placeholder="e.g., Best Friends Forever"
              maxLength={MAX_TEXT_LENGTH}
              className={`h-11 ${errors.text2 ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            <div className="flex justify-between items-center text-sm">
              {errors.text2 ? (
                <span className="text-red-500 font-medium">{errors.text2}</span>
              ) : (
                <span className="text-muted-foreground">
                  Optional: Leave blank for no text
                </span>
              )}
              <span className={`${text2.length > 40 ? "text-orange-500 font-medium" : "text-muted-foreground"}`}>
                {text2.length}/{MAX_TEXT_LENGTH}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          {(text1 || text2) && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearBoth}
                className="h-8 text-xs"
              >
                Clear all text
              </Button>
            </div>
          )}

          {/* Font Selection */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="font" className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Font Style
            </Label>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger id="font" className="h-11">
                <SelectValue placeholder="Select a font style" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_FONTS.map((font) => (
                  <SelectItem key={font.name} value={font.name} className="cursor-pointer">
                    <div className="flex flex-col py-1">
                      <span className="font-medium">{font.displayName}</span>
                      <span className="text-xs text-muted-foreground italic">
                        {font.preview}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFontObj && (
              <p className="text-sm text-muted-foreground pl-1">
                Selected: <span className="font-medium text-foreground">{selectedFontObj.displayName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Type className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Text Placement Tips
              </p>
              <p className="text-sm text-blue-800">
                Your text will appear on the characteristic white border at the bottom of each polaroid. 
                Keep captions short and meaningful for the authentic polaroid look. Both polaroids can 
                have the same or different text.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-between pt-2">
          <Button 
            variant="outline" 
            onClick={onBack}
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Crop
          </Button>
          <Button 
            onClick={handleContinue} 
            className="gap-2"
            size="lg"
            disabled={!!errors.text1 || !!errors.text2}
          >
            Continue to Preview
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
