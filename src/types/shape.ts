export type ToolId = "select" | "rectangle" | "ellipse";

export type ShapeKind = "rectangle" | "ellipse";

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  name: string;
  kind: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}
