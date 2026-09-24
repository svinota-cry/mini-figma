import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useViewport } from "../hooks/useViewport";
import type { Shape, ShapeKind, ToolId } from "../types/shape";
import { screenToCanvas, normalizeRect } from "../utils/geometry";
import ShapeView from "./Shape";

const GRID_SIZE = 40;
const MIN_DRAFT_SIZE = 2;

interface CanvasProps {
  shapes: Shape[];
  selectedIds: string[];
  activeTool: ToolId;
  draft: {
    kind: ShapeKind;
    origin: { x: number; y: number };
    current: { x: number; y: number };
  } | null;
  onBeginDraft: (kind: ShapeKind, origin: { x: number; y: number }) => void;
  onUpdateDraft: (current: { x: number; y: number }) => void;
  onCommitDraft: (minSize?: number) => void;
  onCancelDraft: () => void;
  onSelectShape: (id: string, additive: boolean) => void;
  onClearSelection: () => void;
  onBeginDrag: (origin: { x: number; y: number }, ids: string[]) => void;
  onUpdateDrag: (current: { x: number; y: number }) => void;
  onEndDrag: () => void;
}

export default function Canvas({
  shapes,
  selectedIds,
  activeTool,
  draft,
  onBeginDraft,
  onUpdateDraft,
  onCommitDraft,
  onCancelDraft,
  onSelectShape,
  onClearSelection,
  onBeginDrag,
  onUpdateDrag,
  onEndDrag,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    viewport,
    isSpacePressed,
    isPanning,
    startPan,
    panTo,
    endPan,
    zoomAt,
  } = useViewport();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      zoomAt(
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        event.deltaY,
      );
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [zoomAt]);

  const draftRef = useRef(false);
  const dragRef = useRef(false);

  const getCanvasPointFromClient = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    return screenToCanvas(
      {
        x: clientX - (rect?.left ?? 0),
        y: clientY - (rect?.top ?? 0),
      },
      viewport,
    );
  };

  const getCanvasPoint = (event: ReactPointerEvent<HTMLDivElement>) =>
    getCanvasPointFromClient(event.clientX, event.clientY);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (isSpacePressed) {
      event.currentTarget.setPointerCapture(event.pointerId);
      startPan({ x: event.clientX, y: event.clientY });
      return;
    }
    if (activeTool !== "select") {
      event.currentTarget.setPointerCapture(event.pointerId);
      draftRef.current = true;
      onBeginDraft(activeTool, getCanvasPoint(event));
      return;
    }
    onClearSelection();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      panTo({ x: event.clientX, y: event.clientY });
      return;
    }
    if (draftRef.current) onUpdateDraft(getCanvasPoint(event));
    if (dragRef.current) onUpdateDrag(getCanvasPoint(event));
  };

  const handlePointerUp = () => {
    if (isPanning) {
      endPan();
      return;
    }
    if (draftRef.current) {
      draftRef.current = false;
      onCommitDraft(MIN_DRAFT_SIZE);
    }
    if (dragRef.current) {
      dragRef.current = false;
      onEndDrag();
    }
  };

  useEffect(() => {
    if (activeTool === "select") {
      draftRef.current = false;
      onCancelDraft();
    }
  }, [activeTool, onCancelDraft]);

  const draftRect = draft ? normalizeRect(draft.origin, draft.current) : null;
  const draftStyle =
    draft && draftRect
      ? {
          left: draftRect.x,
          top: draftRect.y,
          width: draftRect.width,
          height: draftRect.height,
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          border: "1px solid #2563eb",
          borderRadius: draft.kind === "ellipse" ? "50%" : 2,
        }
      : null;

  const cursor = isSpacePressed
    ? isPanning
      ? "grabbing"
      : "grab"
    : activeTool === "select"
      ? "default"
      : "crosshair";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none overflow-hidden select-none"
      style={{
        cursor,
        backgroundColor: "#f8f9fb",
        backgroundImage:
          "linear-gradient(to right, rgba(15, 23, 42, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.07) 1px, transparent 1px)",
        backgroundSize: `${GRID_SIZE * viewport.zoom}px ${GRID_SIZE * viewport.zoom}px`,
        backgroundPosition: `${viewport.scrollX}px ${viewport.scrollY}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${viewport.scrollX}px, ${viewport.scrollY}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {shapes.map((shape) => (
          <ShapeView
            key={shape.id}
            shape={shape}
            selected={selectedIds.includes(shape.id)}
            onSelect={onSelectShape}
            onDragStart={(event) => {
              if (activeTool !== "select" || isSpacePressed) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = true;
              onBeginDrag(
                getCanvasPointFromClient(event.clientX, event.clientY),
                selectedIds.includes(shape.id) ? selectedIds : [shape.id],
              );
            }}
          />
        ))}
        {draftStyle && <div className="pointer-events-none absolute" style={draftStyle} />}
      </div>
    </div>
  );
}
