import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Play, Clock, GitBranch } from "lucide-react";

interface TriggerNodeData {
  label: string;
  triggerType: string;
  isValid?: boolean;
  errors?: string[];
}

function TriggerNode({
  data,
  selected,
}: NodeProps & { data: TriggerNodeData }) {
  const getIcon = () => {
    switch (data.triggerType) {
      case "push":
        return <GitBranch className="w-4 h-4" />;
      case "schedule":
        return <Clock className="w-4 h-4" />;
      case "workflow_dispatch":
        return <Play className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const hasErrors = data.errors && data.errors.length > 0;

  return (
    <div
      className={`
        px-4 py-3 shadow-md rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 
        border-2 text-white min-w-[150px]
        ${selected ? "ring-2 ring-blue-300 ring-offset-2" : ""}
        ${hasErrors ? "border-red-400" : "border-blue-700"}
      `}
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        <div className="font-medium text-sm">{data.label}</div>
      </div>

      {hasErrors && (
        <div className="mt-1 text-xs text-red-200">{data.errors![0]}</div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-400 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(TriggerNode);
