import { useCallback, useEffect, useRef, useState } from "react";
import type { ViewportState } from "../utils/geometry";
import type { Point } from "../types/shape";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ZOOM_SENSITIVITY = 0.0015;

export function useViewport() {
  const [viewport, setViewport] = useState<ViewportState>(() => ({
    scrollX: window.innerWidth / 2,
    scrollY: window.innerHeight / 2,
    zoom: 1,
  }));
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const lastPointer = useRef<Point | null>(null);

  useEffect(() => {
    const isTextField = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isTextField(event.target)) return;
      event.preventDefault();
      setIsSpacePressed(true);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      setIsSpacePressed(false);
    };
    const handleBlur = () => {
      setIsSpacePressed(false);
      lastPointer.current = null;
      setIsPanning(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setViewport((prev) => ({
      ...prev,
      scrollX: prev.scrollX + dx,
      scrollY: prev.scrollY + dy,
    }));
  }, []);

  const startPan = useCallback((pointer: Point) => {
    lastPointer.current = pointer;
    setIsPanning(true);
  }, []);

  const panTo = useCallback(
    (pointer: Point) => {
      const last = lastPointer.current;
      if (!last) return;
      lastPointer.current = pointer;
      panBy(pointer.x - last.x, pointer.y - last.y);
    },
    [panBy],
  );

  const endPan = useCallback(() => {
    lastPointer.current = null;
    setIsPanning(false);
  }, []);

  const zoomAt = useCallback((screen: Point, deltaY: number) => {
    setViewport((prev) => {
      const factor = Math.exp(-deltaY * ZOOM_SENSITIVITY);
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor));
      if (zoom === prev.zoom) return prev;
      const scale = zoom / prev.zoom;
      return {
        zoom,
        scrollX: screen.x - (screen.x - prev.scrollX) * scale,
        scrollY: screen.y - (screen.y - prev.scrollY) * scale,
      };
    });
  }, []);

  return {
    viewport,
    isSpacePressed,
    isPanning,
    panBy,
    startPan,
    panTo,
    endPan,
    zoomAt,
  };
}
