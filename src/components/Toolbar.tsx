import type { ReactElement } from "react";
import { TOOLS } from "../constants/tools";
import type { ToolId } from "../types/shape";

const TOOL_ICONS: Record<ToolId, ReactElement> = {
  select: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 1.5 12.5 9l-4 .6-2.1 4.4z" />
    </svg>
  ),
  rectangle: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="3.5" width="11" height="9" rx="1" />
    </svg>
  ),
  ellipse: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  ),
};

interface ToolbarProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
}

export default function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  return (
    <div className="flex w-12 flex-col items-center gap-1 border-r border-gray-800 bg-gray-900 py-3">
      {TOOLS.map((tool) => {
        const isActive = tool.id === activeTool;
        return (
          <button
            key={tool.id}
            type="button"
            title={`${tool.label} (${tool.hotkey.toUpperCase()})`}
            onClick={() => onSelectTool(tool.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {TOOL_ICONS[tool.id]}
          </button>
        );
      })}
    </div>
  );
}
