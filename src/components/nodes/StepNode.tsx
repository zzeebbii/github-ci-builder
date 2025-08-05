import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Play, Code, Package, AlertCircle, CheckCircle } from "lucide-react";

interface StepNodeData {
  label: string;
  type: "action" | "run" | "shell";
  actionName?: string;
  isValid?: boolean;
  errors?: string[];
}

function StepNode({ data, selected }: NodeProps & { data: StepNodeData }) {
  const hasErrors = data.errors && data.errors.length > 0;
  const isValid = data.isValid !== false;

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
      className={`
        px-3 py-2 shadow-md rounded-lg bg-gradient-to-r text-white min-w-[140px]
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
    </div>
  );
}

export default memo(StepNode);
