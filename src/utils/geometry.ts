import type { Point } from "../types/shape";

export interface ViewportState {
  scrollX: number;
  scrollY: number;
  zoom: number;
}

export function screenToCanvas(screen: Point, viewport: ViewportState): Point {
  return {
    x: (screen.x - viewport.scrollX) / viewport.zoom,
    y: (screen.y - viewport.scrollY) / viewport.zoom,
  };
}

export function canvasToScreen(canvas: Point, viewport: ViewportState): Point {
  return {
    x: canvas.x * viewport.zoom + viewport.scrollX,
    y: canvas.y * viewport.zoom + viewport.scrollY,
  };
}

export function normalizeRect(a: Point, b: Point) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}
