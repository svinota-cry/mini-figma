import { useState } from "react";
import type { Shape } from "../types/shape";

const SWATCHES = [
  "#dbeafe",
  "#bfdbfe",
  "#a5b4fc",
  "#c4b5fd",
  "#fbcfe8",
  "#fecaca",
  "#fed7aa",
  "#fde68a",
  "#bbf7d0",
  "#e2e8f0",
];

interface PropertiesPanelProps {
  selectedShape: Shape | null;
  onChangeFill: (fill: string) => void;
}

export default function PropertiesPanel({
  selectedShape,
  onChangeFill,
}: PropertiesPanelProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  if (!selectedShape) {
    return (
      <div className="border-b border-gray-200 p-4">
        <h2 className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Properties
        </h2>
        <p className="text-[11px] text-gray-400">
          Select a shape to edit its properties.
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 p-4">
      <h2 className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Properties
      </h2>
      <div className="space-y-1.5">
        <p className="text-[11px] text-gray-500">Appearance</p>
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPickerOpen((open) => !open)}
            className="flex h-7 items-center gap-2 rounded-md border border-gray-200 px-2 hover:bg-gray-50"
            title="Fill color"
          >
            <span
              className="h-4 w-4 rounded border border-gray-300"
              style={{ backgroundColor: selectedShape.fill }}
            />
            <span className="font-mono text-[11px] text-gray-600 uppercase">
              {selectedShape.fill}
            </span>
          </button>
          {isPickerOpen && (
            <div className="absolute top-8 left-0 z-10 grid w-40 grid-cols-5 gap-1.5 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
              {SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => {
                    onChangeFill(color);
                    setIsPickerOpen(false);
                  }}
                  className={`h-6 w-6 rounded border ${
                    selectedShape.fill.toLowerCase() === color.toLowerCase()
                      ? "border-blue-600 ring-1 ring-blue-600"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <label
                className="col-span-5 mt-1 flex cursor-pointer items-center gap-2 border-t border-gray-100 pt-1.5"
                title="Custom color"
              >
                <input
                  type="color"
                  value={selectedShape.fill}
                  onChange={(event) => onChangeFill(event.target.value)}
                  className="h-5 w-5 cursor-pointer rounded border border-gray-300 bg-transparent p-0"
                />
                <span className="text-[11px] text-gray-500">Custom…</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
