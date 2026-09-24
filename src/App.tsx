import { useEffect, useRef, useState } from "react";
import Canvas from "./components/Canvas";
import LayersPanel from "./components/LayersPanel";
import PropertiesPanel from "./components/PropertiesPanel";
import Toolbar from "./components/Toolbar";
import { useShapes } from "./hooks/useShapes";
import { useHotkeys } from "./hooks/useHotkeys";
import type { Shape, ToolId } from "./types/shape";

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>("select");
  const {
    shapes,
    selectedIds,
    draft,
    addShape,
    updateShape,
    selectShape,
    clearSelection,
    beginDrag,
    updateDrag,
    endDrag,
    beginDraft,
    updateDraft,
    commitDraft,
    cancelDraft,
    undo,
    redo,
  } = useShapes();

  const selectedShape: Shape | null =
    selectedIds.length === 1
      ? (shapes.find((shape) => shape.id === selectedIds[0]) ?? null)
      : null;

  const testRectAddedRef = useRef(false);

  useEffect(() => {
    if (testRectAddedRef.current) return;
    testRectAddedRef.current = true;
    addShape("rectangle", 100, 100, 200, 100);
  }, [addShape]);

  useHotkeys({
    onToolChange: setActiveTool,
    onUndo: undo,
    onRedo: redo,
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900">
      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
      <main className="relative min-w-0 flex-1">
        <Canvas
          shapes={shapes}
          selectedIds={selectedIds}
          activeTool={activeTool}
          draft={draft}
          onBeginDraft={beginDraft}
          onUpdateDraft={updateDraft}
          onCommitDraft={() => {
            commitDraft();
            setActiveTool("select");
          }}
          onCancelDraft={cancelDraft}
          onSelectShape={selectShape}
          onClearSelection={clearSelection}
          onBeginDrag={beginDrag}
          onUpdateDrag={updateDrag}
          onEndDrag={endDrag}
        />
      </main>
      <aside className="flex w-60 shrink-0 flex-col border-l border-gray-200 bg-white">
        <PropertiesPanel
          selectedShape={selectedShape}
          onChangeFill={(fill) => {
            if (selectedShape) updateShape(selectedShape.id, { fill });
          }}
        />
        <LayersPanel
          shapes={shapes}
          selectedIds={selectedIds}
          onSelectShape={selectShape}
        />
      </aside>
    </div>
  );
}
