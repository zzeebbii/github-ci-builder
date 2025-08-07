import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Play, Code, Package, AlertCircle, CheckCircle } from "lucide-react";
import { useWorkflowStore } from "../../store/workflow";
import AddNodeButton from "../ui/AddNodeButton";

interface StepNodeData {
  label: string;
  type: "action" | "run" | "shell";
  actionName?: string;
  isValid?: boolean;
  errors?: string[];
}

function StepNode({ data, selected, id }: NodeProps & { data: StepNodeData }) {
  const hasErrors = data.errors && data.errors.length > 0;
  const isValid = data.isValid !== false;
  const { setSelectedNode, addNode, addEdge, edges, autoArrangeNodes } =
    useWorkflowStore();

  const handleAddNode = (
    nodeType: string,
    nodeData: { label: string; action?: string; run?: string }
  ) => {
    if (nodeType !== "step") {
      return;
    }

    const jobId = id.split("-step-")[0];

    // Find if this step has outgoing edges to other steps
    const existingOutgoingEdges = edges.filter(
      edge => edge.source === id && edge.target.startsWith(`${jobId}-step-`)
    );

    const stepId = `${jobId}-step-${Date.now()}`;
    const newNode = {
      id: stepId,
      type: "step" as const,
      position: { x: 300, y: 400 },
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

    if (existingOutgoingEdges.length > 0) {
      // There are existing steps after this one, insert between them
      const nextStepEdge = existingOutgoingEdges[0];
      const nextStepId = nextStepEdge.target;

      // Remove the existing edge from current step to next step
      const updatedEdges = edges.filter(edge => edge.id !== nextStepEdge.id);

      // Add edge from current step to new step
      const currentToNewStepEdge = {
        id: `edge-${id}-${stepId}`,
        source: id,
        target: stepId,
        sourceHandle: "step-source",
        targetHandle: "step-target",
        type: "insertable" as const,
      };

      // Add edge from new step to next step
      const newStepToNextStepEdge = {
        id: `edge-${stepId}-${nextStepId}`,
        source: stepId,
        target: nextStepId,
        sourceHandle: "step-source",
        targetHandle: "step-target",
        type: "insertable" as const,
      };

      // Update the store with all changes
      useWorkflowStore.setState(() => ({
        edges: [...updatedEdges, currentToNewStepEdge, newStepToNextStepEdge],
      }));

      // Auto-arrange the layout after adding the new step
      setTimeout(() => {
        autoArrangeNodes();
      }, 100);
    } else {
      // No existing steps after this one, just connect current step to new step
      addEdge({
        id: `edge-${id}-${stepId}`,
        source: id,
        target: stepId,
        sourceHandle: "step-source",
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
      setSelectedNode(id);
    }
  };

  const getIcon = () => {
    switch (data.type) {
      case "action":
        return <Package className="w-4 h-4" />;
      case "run":
        return <Code className="w-4 h-4" />;
      case "shell":
        return <Code className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (data.type) {
      case "action":
        return "from-green-500 to-green-600 border-green-700";
      case "run":
        return "from-blue-500 to-blue-600 border-blue-700";
      case "shell":
        return "from-gray-500 to-gray-600 border-gray-700";
      default:
        return "from-gray-500 to-gray-600 border-gray-700";
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        px-3 py-2 shadow-md rounded-lg bg-gradient-to-r text-white min-w-[140px] cursor-pointer
        transition-all duration-200 hover:shadow-lg
        ${selected ? "ring-2 ring-green-300 ring-offset-2" : ""}
        ${hasErrors ? "border-red-400" : "border-2"}
        ${getTypeColor()}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="step-target"
        className="w-2 h-2 !bg-green-400 !border-2 !border-white"
      />

      <div className="flex items-center gap-2">
        {getIcon()}
        <div className="font-medium text-xs flex-1">{data.label}</div>
        {hasErrors ? (
          <AlertCircle className="w-3 h-3 text-red-200" />
        ) : isValid ? (
          <CheckCircle className="w-3 h-3 text-green-200" />
        ) : null}
      </div>

      {data.actionName && (
        <div className="text-xs text-green-100 mt-1 truncate">
          {data.actionName}
        </div>
      )}

      {hasErrors && (
        <div className="mt-1 text-xs text-red-200">{data.errors![0]}</div>
      )}

      {/* Source handle for connecting to next step */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="step-source"
        className="w-2 h-2 !bg-green-400 !border-2 !border-white"
      />

      {/* Always show add button below the step */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
        <AddNodeButton onAddNode={handleAddNode} context="step" />
      </div>
    </div>
  );
}

export default memo(StepNode);
