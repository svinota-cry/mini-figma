import { useCallback, useEffect, useRef, useState } from "react";
import type { Point, Shape, ShapeKind } from "../types/shape";
import { normalizeRect } from "../utils/geometry";

let shapeCounter = 0;

export interface ShapeDraft {
  kind: ShapeKind;
  origin: Point;
  current: Point;
}

function createShape(
  kind: ShapeKind,
  x: number,
  y: number,
  width: number,
  height: number,
): Shape {
  shapeCounter += 1;
  return {
    id: `shape-${shapeCounter}`,
    name: `${kind === "rectangle" ? "Rectangle" : "Ellipse"} ${shapeCounter}`,
    kind,
    x,
    y,
    width,
    height,
    fill: "#dbeafe",
    stroke: "#2563eb",
    strokeWidth: 1,
  };
}

interface DragState {
  origin: Point;
  initialPositions: Map<string, Point>;
}

const HISTORY_LIMIT = 50;

export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draft, setDraft] = useState<ShapeDraft | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const shapesRef = useRef<Shape[]>(shapes);
  const historyRef = useRef<{ past: Shape[][]; future: Shape[][] }>({
    past: [],
    future: [],
  });
  const [historyInfo, setHistoryInfo] = useState({
    canUndo: false,
    canRedo: false,
  });

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  const syncHistoryInfo = useCallback(() => {
    setHistoryInfo({
      canUndo: historyRef.current.past.length > 0,
      canRedo: historyRef.current.future.length > 0,
    });
  }, []);

  const commitHistory = useCallback(
    (snapshot: Shape[]) => {
      const history = historyRef.current;
      history.past.push(snapshot);
      if (history.past.length > HISTORY_LIMIT) history.past.shift();
      history.future = [];
      syncHistoryInfo();
    },
    [syncHistoryInfo],
  );

  const undo = useCallback(() => {
    const history = historyRef.current;
    const previous = history.past.pop();
    if (!previous) return;
    history.future.unshift(shapesRef.current);
    shapesRef.current = previous;
    setShapes(previous);
    setSelectedIds([]);
    syncHistoryInfo();
  }, [syncHistoryInfo]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    const next = history.future.shift();
    if (!next) return;
    history.past.push(shapesRef.current);
    shapesRef.current = next;
    setShapes(next);
    setSelectedIds([]);
    syncHistoryInfo();
  }, [syncHistoryInfo]);

  const addShape = useCallback(
    (
      kind: ShapeKind,
      x: number,
      y: number,
      width: number,
      height: number,
    ) => {
      const shape = createShape(kind, x, y, width, height);
      commitHistory(shapesRef.current);
      setShapes((prev) => [...prev, shape]);
      setSelectedIds([shape.id]);
    },
    [commitHistory],
  );

  const updateShape = useCallback(
    (id: string, patch: Partial<Omit<Shape, "id">>) => {
      setShapes((prev) =>
        prev.map((shape) => (shape.id === id ? { ...shape, ...patch } : shape)),
      );
    },
    [],
  );

  const selectShape = useCallback((id: string, additive = false) => {
    setSelectedIds((prev) => {
      if (!additive) return [id];
      return prev.includes(id)
        ? prev.filter((selected) => selected !== id)
        : [...prev, id];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const draftRef = useRef<ShapeDraft | null>(null);

  const beginDraft = useCallback((kind: ShapeKind, origin: Point) => {
    draftRef.current = { kind, origin, current: origin };
    setDraft(draftRef.current);
  }, []);

  const updateDraft = useCallback((current: Point) => {
    if (!draftRef.current) return;
    draftRef.current = { ...draftRef.current, current };
    setDraft(draftRef.current);
  }, []);

  const commitDraft = useCallback((minSize = 2) => {
    const pending = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    if (!pending) return null;
    const rect = normalizeRect(pending.origin, pending.current);
    if (rect.width < minSize && rect.height < minSize) return null;
    const shape = createShape(pending.kind, rect.x, rect.y, rect.width, rect.height);
    commitHistory(shapesRef.current);
    setShapes((prev) => [...prev, shape]);
    setSelectedIds([shape.id]);
    return shape;
  }, [commitHistory]);

  const cancelDraft = useCallback(() => {
    draftRef.current = null;
    setDraft(null);
  }, []);

  const removeSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    commitHistory(shapesRef.current);
    setShapes((prev) =>
      prev.filter((shape) => !selectedIds.includes(shape.id)),
    );
    setSelectedIds([]);
  }, [selectedIds, commitHistory]);

  const beginDrag = useCallback((origin: Point, ids: string[]) => {
    setShapes((prev) => {
      dragRef.current = {
        origin,
        initialPositions: new Map(
          prev
            .filter((shape) => ids.includes(shape.id))
            .map((shape) => [shape.id, { x: shape.x, y: shape.y }]),
        ),
      };
      return prev;
    });
  }, []);

  const updateDrag = useCallback((current: Point) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = current.x - drag.origin.x;
    const dy = current.y - drag.origin.y;
    setShapes((prev) =>
      prev.map((shape) => {
        const initial = drag.initialPositions.get(shape.id);
        if (!initial) return shape;
        return {
          ...shape,
          x: Math.round(initial.x + dx),
          y: Math.round(initial.y + dy),
        };
      }),
    );
  }, []);

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.initialPositions.size === 0) return;
    setShapes((prev) => {
      const moved = prev.some((shape) => {
        const initial = drag.initialPositions.get(shape.id);
        return initial && (initial.x !== shape.x || initial.y !== shape.y);
      });
      if (!moved) return prev;
      const snapshot = prev.map((shape) => {
        const initial = drag.initialPositions.get(shape.id);
        return initial ? { ...shape, x: initial.x, y: initial.y } : shape;
      });
      const history = historyRef.current;
      history.past.push(snapshot);
      if (history.past.length > HISTORY_LIMIT) history.past.shift();
      history.future = [];
      return prev;
    });
    syncHistoryInfo();
  }, [syncHistoryInfo]);

  return {
    shapes,
    selectedIds,
    draft,
    addShape,
    updateShape,
    selectShape,
    clearSelection,
    removeSelected,
    beginDrag,
    updateDrag,
    endDrag,
    beginDraft,
    updateDraft,
    commitDraft,
    cancelDraft,
    undo,
    redo,
    canUndo: historyInfo.canUndo,
    canRedo: historyInfo.canRedo,
  };
}
