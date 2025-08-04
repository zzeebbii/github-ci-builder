import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Server, AlertCircle, CheckCircle } from "lucide-react";

interface JobNodeData {
  label: string;
  runsOn: string;
  stepCount: number;
  isValid?: boolean;
  errors?: string[];
}

function JobNode({ data, selected }: NodeProps & { data: JobNodeData }) {
  const hasErrors = data.errors && data.errors.length > 0;
  const isValid = data.isValid !== false;

  const getRunnerColor = () => {
    if (!data.runsOn || typeof data.runsOn !== "string") return "text-gray-600";
    if (data.runsOn.includes("ubuntu")) return "text-orange-600";
    if (data.runsOn.includes("windows")) return "text-blue-600";
    if (data.runsOn.includes("macos")) return "text-gray-600";
    return "text-gray-600";
  };

  return (
    <div
      className={`
        px-4 py-3 shadow-md rounded-lg bg-white border-2 min-w-[180px]
        ${selected ? "ring-2 ring-purple-300 ring-offset-2" : ""}
        ${
          hasErrors
            ? "border-red-400"
            : isValid
            ? "border-purple-400"
            : "border-gray-300"
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-400 !border-2 !border-white"
      />

      <div className="flex items-center gap-2 mb-2">
        <Server className="w-4 h-4 text-purple-600" />
        <div className="font-medium text-sm text-gray-900">{data.label}</div>
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
        className="w-3 h-3 !bg-purple-400 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(JobNode);
