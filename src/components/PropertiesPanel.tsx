import { useState, useEffect, useCallback } from "react";
import { useWorkflowStore } from "../store/workflow";
import { X, Settings, AlertCircle, CheckCircle, FileText } from "lucide-react";
import TriggerProperties from "./properties/TriggerProperties.tsx";
import JobProperties from "./properties/JobProperties.tsx";
import StepProperties from "./properties/StepProperties.tsx";
import WorkflowProperties from "./properties/WorkflowProperties.tsx";

interface PropertiesPanelProps {
  position?: "left" | "right";
  onClose?: () => void;
}

export default function PropertiesPanel({
  position = "right",
  onClose,
}: PropertiesPanelProps) {
  const {
    selectedNode,
    nodes,
    showWorkflowProperties,
    updateNodeData,
    updateWorkflow,
    setSelectedNode,
    setShowWorkflowProperties,
  } = useWorkflowStore();
  const [isOpen, setIsOpen] = useState(false);

  const selectedNodeData = selectedNode
    ? nodes.find((node) => node.id === selectedNode)
    : null;

  useEffect(() => {
    setIsOpen(!!selectedNode || showWorkflowProperties);
  }, [selectedNode, showWorkflowProperties]);

  const handleClose = () => {
    if (position === "left" && onClose) {
      onClose();
    } else {
      // For left panel without onClose, or right panel, clear the selection/workflow state
      setSelectedNode(null);
      setShowWorkflowProperties(false);
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

  const handleUpdateWorkflow = useCallback(
    (updates: Record<string, unknown>) => {
      updateWorkflow(updates);
    },
    [updateWorkflow]
  );

  if (!isOpen || (!selectedNodeData && !showWorkflowProperties)) {
    return null;
  }

  const renderPropertiesForm = () => {
    if (showWorkflowProperties) {
      return <WorkflowProperties onUpdate={handleUpdateWorkflow} />;
    }

    if (!selectedNodeData) return null;

    switch (selectedNodeData.type) {
      case "trigger":
        return (
          <TriggerProperties
            nodeData={selectedNodeData.data}
            onUpdate={handleUpdateNode}
          />
        );
      case "job":
        return (
          <JobProperties
            nodeData={selectedNodeData.data}
            onUpdate={handleUpdateNode}
          />
        );
      case "step":
        return (
          <StepProperties
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
    <div className={positionClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          {showWorkflowProperties ? (
            <FileText className="w-5 h-5 text-gray-600" />
          ) : (
            <Settings className="w-5 h-5 text-gray-600" />
          )}
          <h2 className="font-semibold text-gray-900">
            {showWorkflowProperties ? "Workflow Properties" : "Node Properties"}
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
      {showWorkflowProperties ? (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="text-sm font-medium text-blue-900 mb-1">
            Workflow Configuration
          </div>
          <div className="text-xs text-blue-600">
            Global workflow settings and triggers
          </div>
        </div>
      ) : selectedNodeData ? (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="text-sm font-medium text-blue-900 mb-1">
            {selectedNodeData.data.label || selectedNodeData.id}
          </div>
          <div className="text-xs text-blue-600 capitalize">
            {selectedNodeData.type} Node
          </div>
        </div>
      ) : null}

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
