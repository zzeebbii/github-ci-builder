import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import {
  Play,
  Clock,
  GitBranch,
  GitPullRequest,
  Calendar,
  FileText,
  Users,
  Plus,
} from "lucide-react";
import type { WorkflowTriggers } from "../../types/github-actions";
import { useWorkflowStore } from "../../store/workflow";

interface TriggerNodeData {
  label: string;
  triggerType: string;
  triggers?: WorkflowTriggers;
  isValid?: boolean;
  errors?: string[];
}

function TriggerNode({
  data,
  selected,
  id,
}: NodeProps & { data: TriggerNodeData }) {
  const { setSelectedNode, addNode, addEdge, nodes, edges, autoArrangeNodes } =
    useWorkflowStore();

  // Check if this trigger has any outgoing edges
  const hasOutgoingEdges = edges.some(edge => edge.source === id);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (id) {
      setSelectedNode(id);
    }
  };

  const handleAddNode = () => {
    // Count existing nodes to position the new one
    const existingNodes = nodes.length;
    const newNodeId = `job-${Date.now()}`;

    // Add a new job node below existing nodes
    const newNode = {
      id: newNodeId,
      type: "job" as const,
      position: {
        x: 250,
        y: 200 + existingNodes * 120, // Stack nodes vertically
      },
      data: {
        label: "Job",
        runsOn: "ubuntu-latest",
        stepCount: 0,
      },
    };

    addNode(newNode);

    // Auto-connect the trigger to the new job
    if (id) {
      const edge = {
        id: `edge-${id}-${newNodeId}`,
        source: id,
        target: newNodeId,
        sourceHandle: "trigger-source",
        targetHandle: "job-target",
        type: "insertable" as const,
      };
      addEdge(edge);
    }

    // Auto-arrange the layout after adding the new node
    setTimeout(() => {
      autoArrangeNodes();
    }, 100); // Small delay to ensure the node is fully added before arranging
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "push":
        return <GitBranch className="w-3 h-3 text-green-200" />;
      case "pull_request":
        return <GitPullRequest className="w-3 h-3 text-blue-200" />;
      case "schedule":
        return <Clock className="w-3 h-3 text-purple-200" />;
      case "workflow_dispatch":
        return <Play className="w-3 h-3 text-orange-200" />;
      case "workflow_call":
        return <FileText className="w-3 h-3 text-gray-200" />;
      case "release":
        return <Calendar className="w-3 h-3 text-red-200" />;
      case "issues":
        return <Users className="w-3 h-3 text-yellow-200" />;
      default:
        return <Play className="w-3 h-3 text-white" />;
    }
  };

  const getTriggerDisplayName = (triggerType: string) => {
    switch (triggerType) {
      case "push":
        return "Push";
      case "pull_request":
        return "PR";
      case "schedule":
        return "Schedule";
      case "workflow_dispatch":
        return "Manual";
      case "workflow_call":
        return "Reusable";
      case "release":
        return "Release";
      case "issues":
        return "Issues";
      default:
        return triggerType.replace(/_/g, " ");
    }
  };

  const hasErrors = data.errors && data.errors.length > 0;

  // Get active triggers from the triggers object
  const activeTriggers = data.triggers
    ? Object.keys(data.triggers).filter(
        key => data.triggers![key as keyof WorkflowTriggers]
      )
    : [data.triggerType];

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className={`
          px-4 py-3 shadow-md rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 
          border-2 text-white min-w-[180px] max-w-[250px] cursor-pointer
          transition-all duration-200 hover:shadow-lg hover:scale-105
          ${selected ? "ring-2 ring-blue-300 ring-offset-2" : ""}
          ${hasErrors ? "border-red-400" : "border-blue-700"}
        `}
      >
        {/* Header with main trigger icon */}
        <div className="flex items-center gap-2 mb-2">
          {getTriggerIcon(activeTriggers[0] || data.triggerType)}
          <div className="font-medium text-sm">Workflow Triggers</div>
        </div>

        {/* Display all active triggers */}
        <div className="space-y-1">
          {activeTriggers.length > 0 ? (
            activeTriggers.map(trigger => (
              <div key={trigger} className="flex items-center gap-2 text-xs">
                {getTriggerIcon(trigger)}
                <span className="text-blue-100">
                  {getTriggerDisplayName(trigger)}
                </span>
                {/* Show additional config info for some triggers */}
                {trigger === "schedule" && data.triggers?.schedule && (
                  <span className="text-blue-200 ml-1">
                    ({data.triggers.schedule[0]?.cron || "daily"})
                  </span>
                )}
                {(trigger === "push" || trigger === "pull_request") &&
                  data.triggers?.[trigger as keyof WorkflowTriggers] &&
                  (
                    data.triggers[trigger as keyof WorkflowTriggers] as {
                      branches?: string[];
                    }
                  )?.branches && (
                    <span className="text-blue-200 ml-1">
                      (
                      {(
                        data.triggers[trigger as keyof WorkflowTriggers] as {
                          branches: string[];
                        }
                      ).branches.join(", ")}
                      )
                    </span>
                  )}
              </div>
            ))
          ) : (
            <div className="text-xs text-blue-200">No triggers configured</div>
          )}
        </div>

        {hasErrors && (
          <div className="mt-2 text-xs text-red-200 border-t border-blue-400 pt-2">
            {data.errors![0]}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          id="trigger-source"
          className="w-3 h-3 !bg-blue-400 !border-2 !border-white"
        />

        {/* Always show visual edge with add button */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          {/* Visual edge line - only show if no outgoing edges exist */}
          {!hasOutgoingEdges && <div className="w-0.5 h-8 bg-gray-400"></div>}

          {/* Add Node Button - always visible */}
          <div className="relative">
            <button
              onClick={e => {
                e.stopPropagation();
                handleAddNode();
              }}
              className="flex items-center justify-center w-8 h-8 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer border-2 border-white"
              title="Add Job"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TriggerNode);
