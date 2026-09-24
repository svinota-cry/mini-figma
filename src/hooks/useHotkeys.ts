import { useCallback, useEffect } from "react";
import { HOTKEY_TO_TOOL } from "../constants/tools";
import type { ToolId } from "../types/shape";

interface UseHotkeysOptions {
  onToolChange?: (tool: ToolId) => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useHotkeys({
  onToolChange,
  onUndo,
  onRedo,
}: UseHotkeysOptions = {}) {
  const handleToolHotkey = useCallback(
    (event: KeyboardEvent) => {
      const tool = HOTKEY_TO_TOOL[event.code];
      if (tool && onToolChange) onToolChange(tool);
    },
    [onToolChange],
  );

  useEffect(() => {
    const isTextField = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextField(event.target)) return;

      // Undo / Redo: Cmd+Z / Cmd+Shift+Z (macOS)
      if ((event.metaKey || event.ctrlKey) && event.code === "KeyZ") {
        event.preventDefault();
        if (event.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;
      handleToolHotkey(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToolChange, onUndo, onRedo, handleToolHotkey]);
}
