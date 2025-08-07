import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Server, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { useWorkflowStore } from "../../store/workflow";
import AddNodeButton from "../ui/AddNodeButton";

interface JobNodeData {
  label: string;
  runsOn: string;
  stepCount: number;
  isValid?: boolean;
  errors?: string[];
}

function JobNode({ data, selected, id }: NodeProps & { data: JobNodeData }) {
  const hasErrors = data.errors && data.errors.length > 0;
  const isValid = data.isValid !== false;
  const {
    toggleEdgeAnimation,
    setSelectedNode,
    animatedEdges,
    edges,
    nodes,
    addNode,
    addEdge,
    autoArrangeNodes,
  } = useWorkflowStore();

  // Check if this node has any animated job-to-job edges (both incoming and outgoing)
  const hasAnimatedEdges = Array.from(animatedEdges).some(edgeId => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) {
      return false;
    }

    // Check if this edge connects to this node (either as source or target)
    const isConnectedToNode = edge.source === id || edge.target === id;
    if (!isConnectedToNode) {
      return false;
    }

    // Check if both source and target are job nodes
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    return sourceNode?.type === "job" && targetNode?.type === "job";
  });

  const getRunnerColor = () => {
    if (!data.runsOn || typeof data.runsOn !== "string") {
      return "text-gray-600";
    }
    if (data.runsOn.includes("ubuntu")) {
      return "text-orange-600";
    }
    if (data.runsOn.includes("windows")) {
      return "text-blue-600";
    }
    if (data.runsOn.includes("macos")) {
      return "text-gray-600";
    }
    return "text-gray-600";
  };

  const handleAddNode = (
    nodeType: string,
    nodeData: { label: string; action?: string; run?: string }
  ) => {
    if (nodeType !== "step") {
      return;
    }

    // Find if this job already has outgoing edges to steps
    const existingStepEdges = edges.filter(
      edge => edge.source === id && edge.target.startsWith(`${id}-step-`)
    );

    const stepId = `${id}-step-${Date.now()}`;
    const newNode = {
      id: stepId,
      type: "step" as const,
      position: { x: 300, y: 300 },
      data: {
        ...nodeData,
        step: {
          name: nodeData.label,
          ...(nodeData.action && { uses: nodeData.action }),
          ...(nodeData.run && { run: nodeData.run }),
        },
      },
    };

    addNode(newNode);

    if (existingStepEdges.length > 0) {
      // There are existing steps, insert the new step between job and first existing step
      const firstStepEdge = existingStepEdges[0];
      const firstStepId = firstStepEdge.target;

      // Remove the existing edge from job to first step
      const updatedEdges = edges.filter(edge => edge.id !== firstStepEdge.id);

      // Add edge from job to new step
      const jobToNewStepEdge = {
        id: `edge-${id}-${stepId}`,
        source: id,
        target: stepId,
        sourceHandle: "job-source",
        targetHandle: "step-target",
        type: "insertable" as const,
      };

      // Add edge from new step to first existing step
      const newStepToFirstStepEdge = {
        id: `edge-${stepId}-${firstStepId}`,
        source: stepId,
        target: firstStepId,
        sourceHandle: "step-source",
        targetHandle: "step-target",
        type: "insertable" as const,
      };

      // Update the store with all changes
      useWorkflowStore.setState(() => ({
        edges: [...updatedEdges, jobToNewStepEdge, newStepToFirstStepEdge],
      }));

      // Auto-arrange the layout after adding the new step
      setTimeout(() => {
        autoArrangeNodes();
      }, 100);
    } else {
      // No existing steps, just connect job to new step
      addEdge({
        id: `edge-${id}-${stepId}`,
        source: id,
        target: stepId,
        sourceHandle: "job-source",
        targetHandle: "step-target",
        type: "insertable",
      });

      // Auto-arrange the layout after adding the new step
      setTimeout(() => {
        autoArrangeNodes();
      }, 100);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (id) {
      // First set the selected node for properties panel
      setSelectedNode(id);

      // Then toggle edge animation
      toggleEdgeAnimation(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        px-4 py-3 shadow-md rounded-lg bg-white border-2 min-w-[180px] cursor-pointer
        transition-all duration-200 hover:shadow-lg hover:scale-105
        ${selected ? "ring-2 ring-purple-300 ring-offset-2" : ""}
        ${
          hasAnimatedEdges
            ? "ring-2 ring-orange-400 ring-offset-1 shadow-orange-200 shadow-lg"
            : ""
        }
        ${
          hasErrors
            ? "border-red-400"
            : isValid
              ? hasAnimatedEdges
                ? "border-orange-400"
                : "border-purple-400"
              : "border-gray-300"
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="job-target"
        className="w-3 h-3 !bg-purple-400 !border-2 !border-white"
      />

      <div className="flex items-center gap-2 mb-2">
        <Server className="w-4 h-4 text-purple-600" />
        <div className="font-medium text-sm text-gray-900">{data.label}</div>
        {hasAnimatedEdges && (
          <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
        )}
        {hasErrors ? (
          <AlertCircle className="w-4 h-4 text-red-500" />
        ) : isValid ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : null}
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div className={`flex items-center gap-1 ${getRunnerColor()}`}>
          <span>Runs on:</span>
          <span className="font-medium">{data.runsOn || "ubuntu-latest"}</span>
        </div>
        <div className="text-gray-500">
          {data.stepCount} step{data.stepCount !== 1 ? "s" : ""}
        </div>
      </div>

      {hasErrors && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          {data.errors![0]}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id="job-source"
        className="w-3 h-3 !bg-purple-400 !border-2 !border-white"
      />

      {/* Always show add button below the job */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
        <AddNodeButton onAddNode={handleAddNode} context="job" />
      </div>
    </div>
  );
}

export default memo(JobNode);
