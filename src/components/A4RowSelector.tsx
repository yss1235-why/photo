// src/components/A4RowSelector.tsx

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Grid3X3 } from "lucide-react";

interface A4RowSelectorProps {
  selectedRows: number;
  onRowsChange: (rows: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const A4RowSelector: React.FC<A4RowSelectorProps> = ({
  selectedRows,
  onRowsChange,
  onContinue,
  onBack,
}) => {
  const totalPhotos = selectedRows * 6;

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Grid3X3 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold">Select Number of Rows</h2>
          <p className="text-muted-foreground text-lg">
            Choose how many rows of passport photos you want on your A4 sheet
          </p>
        </div>

        {/* Row Selector */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">1 row</span>
            <span className="text-sm font-medium text-muted-foreground">7 rows</span>
          </div>
          
          <Slider
            value={[selectedRows]}
            onValueChange={(value) => onRowsChange(value[0])}
            min={1}
            max={7}
            step={1}
            className="w-full"
          />

          {/* Visual Preview */}
          <div className="bg-muted rounded-xl p-6">
            <div className="aspect-[210/297] bg-white rounded-lg border-2 border-dashed border-border mx-auto max-w-[200px] p-2">
              <div 
                className="grid gap-1 h-full"
                style={{ 
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gridTemplateRows: `repeat(${selectedRows}, 1fr)`
                }}
              >
                {[...Array(totalPhotos)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-green-200 rounded-sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Info Display */}
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-green-600">{totalPhotos}</p>
            <p className="text-lg text-muted-foreground">
              passport photos ({selectedRows} rows × 6 columns)
            </p>
          </div>

          {/* Size Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-700 font-medium">Photo Size</p>
                <p className="text-green-600">32.4mm × 40mm</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Paper Size</p>
                <p className="text-green-600">A4 (210mm × 297mm)</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Gap Between</p>
                <p className="text-green-600">1.5mm</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Print Quality</p>
                <p className="text-green-600">300 DPI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            size="lg"
          >
            Back
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 gap-2"
            size="lg"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default A4RowSelector;
