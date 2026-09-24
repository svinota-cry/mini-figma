import type { PointerEvent as ReactPointerEvent } from "react";
import type { Shape } from "../types/shape";

interface ShapeViewProps {
  shape: Shape;
  selected: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onDragStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

const HANDLES: Array<{ top: string; left: string }> = [
  { top: "-4px", left: "-4px" },
  { top: "-4px", left: "calc(100% - 4px)" },
  { top: "calc(100% - 4px)", left: "-4px" },
  { top: "calc(100% - 4px)", left: "calc(100% - 4px)" },
];

export default function ShapeView({
  shape,
  selected,
  onSelect,
  onDragStart,
}: ShapeViewProps) {
  return (
    <div
      className="absolute"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        backgroundColor: shape.fill,
        border: `${shape.strokeWidth}px solid ${selected ? "#1d4ed8" : shape.stroke}`,
        borderRadius: shape.kind === "ellipse" ? "50%" : 2,
        boxShadow: selected ? "0 0 0 1px rgba(37, 99, 235, 0.4)" : "none",
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(shape.id, event.shiftKey || event.metaKey);
        onDragStart(event);
      }}
    >
      {selected && (
        <div
          className="pointer-events-none absolute"
          style={{ inset: -shape.strokeWidth - 1, border: "1px solid #2563eb" }}
        >
          {HANDLES.map((handle, index) => (
            <span
              key={index}
              className="absolute h-2 w-2 rounded-[2px] border border-blue-600 bg-white"
              style={{ top: handle.top, left: handle.left }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
