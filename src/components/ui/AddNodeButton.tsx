import { useState } from "react";
import { Plus } from "lucide-react";

interface NodeData {
  label: string;
  [key: string]: string | number | boolean | undefined | string[];
}

interface AddNodeButtonProps {
  onAddNode: (nodeType: string, nodeData: NodeData) => void;
  className?: string;
  context?: "trigger" | "job" | "step" | "empty"; // Context to filter available options
}

export default function AddNodeButton({
  onAddNode,
  className = "",
  context = "empty",
}: AddNodeButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  const allNodeTypes = [
    {
      type: "trigger",
      label: "Push Trigger",
      description: "Trigger on code push",
      color: "blue",
    },
    {
      type: "trigger",
      label: "PR Trigger",
      description: "Trigger on pull requests",
      color: "blue",
    },
    {
      type: "trigger",
      label: "Manual Trigger",
      description: "Manually triggered workflow",
      color: "blue",
    },
    {
      type: "job",
      label: "Job",
      description: "Add a new job to the workflow",
      color: "purple",
    },
    {
      type: "step",
      label: "Action Step",
      description: "Use an existing GitHub Action",
      color: "green",
    },
    {
      type: "step",
      label: "Run Step",
      description: "Execute shell commands",
      color: "blue",
    },
  ];

  // Filter node types based on context
  const getAvailableNodeTypes = () => {
    switch (context) {
      case "trigger":
        // After a trigger, only jobs can be added directly
        return allNodeTypes.filter(node => node.type === "job");
      case "job":
        // After a job, only steps can be added
        return allNodeTypes.filter(node => node.type === "step");
      case "step":
        // After a step, only other steps can be added
        return allNodeTypes.filter(node => node.type === "step");
      case "empty":
      default:
        // In empty canvas, all node types are available
        return allNodeTypes;
    }
  };

  const nodeTypes = getAvailableNodeTypes();

  const handleNodeSelect = (nodeType: string, label: string) => {
    const nodeData = {
      label,
      ...(nodeType === "trigger" && {
        triggerType:
          label === "Push Trigger"
            ? "push"
            : label === "PR Trigger"
              ? "pull_request"
              : "workflow_dispatch",
        ...(label !== "Manual Trigger" && { branches: ["main"] }),
        description:
          label === "Push Trigger"
            ? "Triggers on push to main branch"
            : label === "PR Trigger"
              ? "Triggers on pull requests"
              : "Manually triggered workflow",
      }),
      ...(nodeType === "job" && {
        runsOn: "ubuntu-latest",
        stepCount: 0,
      }),
      ...(nodeType === "step" && {
        action: label === "Action Step" ? "actions/checkout@v4" : undefined,
        run: label === "Run Step" ? "echo 'Hello World'" : undefined,
      }),
    };

    onAddNode(nodeType, nodeData);
    setShowPicker(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={e => {
          e.stopPropagation();
          setShowPicker(!showPicker);
        }}
        className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
        title="Add Node"
      >
        <Plus className="w-4 h-4" />
      </button>

      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />

          {/* Node picker dropdown */}
          <div
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-64 max-w-80 max-h-64 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-sm font-medium text-gray-700 px-3 py-2 border-b border-gray-100 bg-gray-50">
              Add Node
            </div>

            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-1 p-2">
                {nodeTypes.map((node, index) => (
                  <button
                    key={index}
                    onClick={e => {
                      e.stopPropagation();
                      handleNodeSelect(node.type, node.label);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {node.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {node.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
