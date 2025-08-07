import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import type {
  Connection,
  Node,
  NodeChange,
  EdgeChange,
  Viewport,
} from "@xyflow/react";
import { useWorkflowStore } from "../store/workflow";
import type { VisualNode, VisualEdge } from "../types/github-actions";
import TriggerNode from "./nodes/TriggerNode";
import JobNode from "./nodes/JobNode";
import StepNode from "./nodes/StepNode";
import InsertableEdge from "./edges/InsertableEdge";
import EmptyCanvas from "./ui/EmptyCanvas";
import OnboardingHint from "./ui/OnboardingHint";

// Define custom node types
const nodeTypes = {
  trigger: TriggerNode,
  job: JobNode,
  step: StepNode,
};

// Define custom edge types
const edgeTypes = {
  insertable: InsertableEdge,
};

export default function WorkflowCanvas() {
  const [showOnboardingHint, setShowOnboardingHint] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
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
    animatedEdges,
  } = useWorkflowStore();

  // Show onboarding hint when first trigger is added
  useEffect(() => {
    const hasOnlyTrigger = nodes.length === 1 && nodes[0]?.type === "trigger";
    const hasDismissedHint =
      localStorage.getItem("onboarding-hint-dismissed") === "true";

    if (hasOnlyTrigger && !hasDismissedHint) {
      setShowOnboardingHint(true);
    } else {
      setShowOnboardingHint(false);
    }
  }, [nodes.length, nodes]);

  const handleDismissOnboardingHint = () => {
    setShowOnboardingHint(false);
    localStorage.setItem("onboarding-hint-dismissed", "true");
  };

  // Apply animation state to edges
  const animatedEdgesArray = edges.map(edge => {
    const isAnimated = animatedEdges.has(edge.id);

    if (isAnimated) {
      // Enhanced styling for animated job-to-job dependency edges
      return {
        ...edge,
        animated: true,
        style: {
          ...edge.style,
          stroke: "#ff6b35", // Bright orange for animated edges
          strokeWidth: 5, // Much thicker for job dependencies
          strokeDasharray: "12,6", // Keep dashed but more pronounced
          filter: "drop-shadow(0px 0px 8px rgba(255, 107, 53, 0.8))", // Stronger glow effect
          animation: "pulse 1.5s infinite", // Faster pulsing animation
        },
        labelStyle: {
          ...edge.labelStyle,
          fill: "#ff6b35",
          fontWeight: 800, // Even bolder
          fontSize: 13, // Larger text
        },
        labelBgStyle: {
          ...edge.labelBgStyle,
          fill: "#fff3f0",
          stroke: "#ff6b35",
          strokeWidth: 2,
          fillOpacity: 0.98,
        },
      };
    }

    return {
      ...edge,
      animated: false,
    };
  });

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
      if (!params.source || !params.target) {
        return;
      }

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
        type: "insertable" as const,
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

      if (!source || !target) {
        return false;
      }

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

  const onViewportChange = useCallback((viewport: Viewport) => {
    setZoomLevel(viewport.zoom);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = (event.target as Element).getBoundingClientRect();
      const data = event.dataTransfer.getData("application/reactflow");

      if (!data) {
        return;
      }

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
        className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors cursor-pointer"
        title="Auto-arrange nodes"
      >
        Auto-arrange
      </button>

      {/* Zoom level indicator */}
      <div className="absolute top-4 left-4 z-10 bg-white border border-gray-300 px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>

      <ReactFlow
        nodes={nodes}
        edges={animatedEdgesArray}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onViewportChange={onViewportChange}
        className="bg-gray-50"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={2}
      >
        <Controls />
        <MiniMap
          nodeColor={node => {
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
      {nodes.length === 0 && <EmptyCanvas />}

      {/* Onboarding hint */}
      <OnboardingHint
        show={showOnboardingHint}
        onDismiss={handleDismissOnboardingHint}
      />

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
