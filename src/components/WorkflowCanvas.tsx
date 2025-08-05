import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import type { Connection, Node, NodeChange, EdgeChange } from "@xyflow/react";
import { useWorkflowStore } from "../store/workflow";
import type { VisualNode, VisualEdge } from "../types/github-actions";
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
    updateNodePositions,
    updateEdges,
    autoArrangeNodes,
    validateConnection,
    addToast,
    setSelectedNode,
  } = useWorkflowStore();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes) as VisualNode[];
      updateNodePositions(updatedNodes);
    },
    [nodes, updateNodePositions]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges) as VisualEdge[];
      updateEdges(updatedEdges);
    },
    [edges, updateEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      // Validate the connection
      const validation = validateConnection(params.source, params.target);

      if (!validation.isValid) {
        // Show error toast instead of alert
        addToast(`Cannot create connection: ${validation.error}`, "error");
        return;
      }

      const newEdge = {
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        type: "default" as const,
        animated: true,
      };
      addStoreEdge(newEdge);
      addToast("Connection created successfully", "success");
    },
    [addStoreEdge, validateConnection, addToast]
  );

  const isValidConnection = useCallback(
    (connection: Connection | VisualEdge) => {
      const source = "source" in connection ? connection.source : "";
      const target = "target" in connection ? connection.target : "";

      if (!source || !target) return false;

      const validation = validateConnection(source, target);
      return validation.isValid;
    },
    [validateConnection]
  );

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
    <div className="w-full h-full relative">
      {/* Auto-arrange button */}
      <button
        onClick={autoArrangeNodes}
        className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
        title="Auto-arrange nodes"
      >
        Auto-arrange
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
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
