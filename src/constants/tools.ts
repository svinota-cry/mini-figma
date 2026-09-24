import type { ToolId } from "../types/shape";

export interface ToolDefinition {
  id: ToolId;
  label: string;
  hotkey: string;
  code: string;
}

export const TOOLS: ToolDefinition[] = [
  { id: "select", label: "Select", hotkey: "v", code: "KeyV" },
  { id: "rectangle", label: "Rectangle", hotkey: "r", code: "KeyR" },
  { id: "ellipse", label: "Ellipse", hotkey: "o", code: "KeyO" },
];

export const HOTKEY_TO_TOOL: Record<string, ToolId> = Object.fromEntries(
  TOOLS.map((tool) => [tool.code, tool.id]),
);
