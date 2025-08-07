import { useState, useEffect, useCallback } from "react";
import { useWorkflowStore } from "../store/workflow";
import { X, Settings, AlertCircle, CheckCircle } from "lucide-react";
import UnifiedTriggerWorkflowProperties from "./properties/UnifiedTriggerWorkflowProperties.tsx";
import JobProperties from "./properties/JobProperties.tsx";
import StepProperties from "./properties/StepProperties.tsx";

interface PropertiesPanelProps {
  position?: "left" | "right";
  onClose?: () => void;
}

export default function PropertiesPanel({
  position = "right",
  onClose,
}: PropertiesPanelProps) {
  const { selectedNode, nodes, updateNodeData, setSelectedNode } =
    useWorkflowStore();
  const [isOpen, setIsOpen] = useState(false);

  const selectedNodeData = selectedNode
    ? nodes.find(node => node.id === selectedNode)
    : null;

  useEffect(() => {
    setIsOpen(!!selectedNode);
  }, [selectedNode]);

  const handleClose = () => {
    if (position === "left" && onClose) {
      onClose();
    } else {
      // For left panel without onClose, or right panel, clear the selection
      setSelectedNode(null);
      setIsOpen(false);
    }
  };

  const handleUpdateNode = useCallback(
    (data: Record<string, unknown>) => {
      if (selectedNode) {
        updateNodeData(selectedNode, data);
      }
    },
    [selectedNode, updateNodeData]
  );

  if (!isOpen || !selectedNodeData) {
    return null;
  }

  const renderPropertiesForm = () => {
    if (!selectedNodeData) {
      return null;
    }

    // Use the node ID as key to force re-render when switching nodes
    const nodeKey = `${selectedNodeData.type}-${selectedNodeData.id}`;

    switch (selectedNodeData.type) {
      case "trigger":
        return (
          <UnifiedTriggerWorkflowProperties
            key={nodeKey}
            nodeData={selectedNodeData.data}
            onUpdate={handleUpdateNode}
          />
        );
      case "job":
        return (
          <JobProperties
            key={nodeKey}
            nodeData={selectedNodeData.data}
            onUpdate={handleUpdateNode}
          />
        );
      case "step":
        return (
          <StepProperties
            key={nodeKey}
            nodeData={selectedNodeData.data}
            onUpdate={handleUpdateNode}
          />
        );
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No properties available for this node type</p>
          </div>
        );
    }
  };

  const hasErrors =
    selectedNodeData &&
    selectedNodeData.data.errors &&
    selectedNodeData.data.errors.length > 0;
  const isValid = selectedNodeData
    ? selectedNodeData.data.isValid !== false
    : true;

  // Position-based styling
  const positionClasses =
    position === "left"
      ? "w-full h-full bg-white overflow-hidden" // Remove positioning when used in custom container
      : "fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 overflow-hidden";

  return (
    <div
      className={`${positionClasses} ${isOpen ? "animate-in slide-in-from-right-4 duration-300" : "animate-out slide-out-to-right-4 duration-200"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">
            {selectedNodeData?.type === "trigger"
              ? "Workflow & Trigger Settings"
              : "Node Properties"}
          </h2>
          {hasErrors ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : isValid ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : null}
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="text-sm font-medium text-blue-900 mb-1">
          {selectedNodeData.data.label || selectedNodeData.id}
        </div>
        <div className="text-xs text-blue-600 capitalize">
          {selectedNodeData.type === "trigger"
            ? "Workflow Entry Point & Settings"
            : `${selectedNodeData.type} Node`}
        </div>
      </div>

      {/* Properties Form */}
      <div className="flex-1 overflow-y-auto">{renderPropertiesForm()}</div>

      {/* Validation Errors - Only show for nodes */}
      {hasErrors && selectedNodeData?.data.errors && (
        <div className="border-t border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-900">
              Validation Errors
            </span>
          </div>
          <div className="space-y-1">
            {(selectedNodeData.data.errors as string[]).map(
              (error: string, index: number) => (
                <div
                  key={index}
                  className="text-xs text-red-700 bg-red-100 p-2 rounded"
                >
                  {error}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
