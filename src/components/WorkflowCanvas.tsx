import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import type { Connection, Node } from "@xyflow/react";
import { useWorkflowStore } from "../store/workflow";
import TriggerNode from "./nodes/TriggerNode";
import JobNode from "./nodes/JobNode";
import StepNode from "./nodes/StepNode";

// Define custom node types
const nodeTypes = {
  trigger: TriggerNode,
  job: JobNode,
  step: StepNode,
};

export default function WorkflowCanvas() {
  const {
    nodes,
    edges,
    selectedNode,
    addNode,
    addEdge: addStoreEdge,
    setSelectedNode,
    syncFromVisual,
  } = useWorkflowStore();

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        id: `${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        type: "flow" as const,
        animated: true,
      };
      addStoreEdge(newEdge);
    },
    [addStoreEdge]
  );

  const onNodesChange = useCallback(() => {
    // This will be called when nodes are moved/resized
    // We'll sync changes back to the store
    syncFromVisual();
  }, [syncFromVisual]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = (event.target as Element).getBoundingClientRect();
      const data = event.dataTransfer.getData("application/reactflow");

      if (!data) return;

      const { type, id, label } = JSON.parse(data);
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: createNodeData(type, id, label),
      };

      addNode(newNode);
    },
    [addNode]
  );

  const createNodeData = (nodeType: string, itemId: string, label: string) => {
    switch (nodeType) {
      case "trigger":
        return {
          label,
          triggerType: itemId,
          isValid: true,
          errors: [],
        };
      case "job":
        return {
          label,
          runsOn: "ubuntu-latest",
          stepCount: 0,
          isValid: true,
          errors: [],
        };
      case "step":
        return {
          label,
          type: itemId === "action" ? "action" : "run",
          actionName: itemId === "action" ? "actions/checkout@v4" : undefined,
          isValid: true,
          errors: [],
        };
      default:
        return { label, isValid: true, errors: [] };
    }
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className="bg-gray-50"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={2}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "trigger":
                return "#3b82f6";
              case "job":
                return "#8b5cf6";
              case "step":
                return "#10b981";
              default:
                return "#e2e8f0";
            }
          }}
          className="!bg-white !border !border-gray-200"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-medium mb-2">
              Start Building Your Workflow
            </h3>
            <p className="text-sm">
              Drag components from the sidebar or import an existing YAML file
            </p>
          </div>
        </div>
      )}

      {/* Selection indicator */}
      {selectedNode && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md border">
          <div className="text-xs text-gray-600">Selected:</div>
          <div className="font-medium text-sm">{selectedNode}</div>
        </div>
      )}
    </div>
  );
}
