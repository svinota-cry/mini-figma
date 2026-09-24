import type { MouseEvent } from "react";
import type { Shape } from "../types/shape";

interface LayersPanelProps {
  shapes: Shape[];
  selectedIds: string[];
  onSelectShape: (id: string, additive: boolean) => void;
}

export default function LayersPanel({
  shapes,
  selectedIds,
  onSelectShape,
}: LayersPanelProps) {
  const isAdditive = (event: MouseEvent) => event.shiftKey || event.metaKey;

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <h2 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Layers
      </h2>
      {shapes.length === 0 ? (
        <p className="mt-3 text-[11px] text-gray-400">
          Nothing here yet. Shapes you draw will show up as layers.
        </p>
      ) : (
        <ul className="mt-2 space-y-1 overflow-y-auto">
          {[...shapes].reverse().map((shape) => {
            const isSelected = selectedIds.includes(shape.id);
            return (
              <li
                key={shape.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                  isSelected
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={(event) => onSelectShape(shape.id, isAdditive(event))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectShape(shape.id, false);
                  }
                }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: shape.fill }}
                />
                <span className="truncate">{shape.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
