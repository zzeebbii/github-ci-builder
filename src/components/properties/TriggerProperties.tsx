import { useState, useEffect, useCallback } from "react";
import { useWorkflowStore } from "../../store/workflow";
import type {
  WorkflowTriggers,
  PushTrigger,
  PullRequestTrigger,
  ReleaseTrigger,
} from "../../types/github-actions";
import {
  GitBranch,
  Calendar,
  FileText,
  Users,
  GitPullRequest,
  Play,
  Clock,
} from "lucide-react";

interface TriggerPropertiesProps {
  nodeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

type TriggerKey = keyof WorkflowTriggers;

export default function TriggerProperties({
  nodeData,
  onUpdate,
}: TriggerPropertiesProps) {
  const { workflow } = useWorkflowStore();
  const [label, setLabel] = useState((nodeData.label as string) || "");
  const [triggers, setTriggers] = useState<WorkflowTriggers>(workflow.on);

  // Reset state when nodeData changes (when switching between nodes)
  useEffect(() => {
    setLabel((nodeData.label as string) || "");
  }, [nodeData]);

  // Sync with workflow triggers when they change
  useEffect(() => {
    setTriggers(workflow.on);
    // Update the node label based on current triggers
    const triggerKeys = Object.keys(workflow.on);
    let newLabel = "";

    if (triggerKeys.length === 1) {
      const key = triggerKeys[0];
      switch (key) {
        case "push":
          newLabel = "On Push";
          break;
        case "pull_request":
          newLabel = "On Pull Request";
          break;
        case "schedule":
          newLabel = "On Schedule";
          break;
        case "workflow_dispatch":
          newLabel = "Manual Trigger";
          break;
        default:
          newLabel = `On ${key.replace(/_/g, " ")}`;
      }
    } else if (triggerKeys.length <= 3) {
      newLabel = `On ${triggerKeys
        .map((k) => k.replace(/_/g, " "))
        .join(", ")}`;
    } else {
      newLabel = `Multiple Triggers (${triggerKeys.length})`;
    }

    setLabel(newLabel);
  }, [workflow.on]);

  // Update node data when triggers or label change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const triggerKeys = Object.keys(triggers);
      const primaryTrigger =
        triggerKeys.length > 0 ? triggerKeys[0] : "workflow_dispatch";

      const updatedData = {
        label,
        triggerType: primaryTrigger,
        triggers: triggers, // Pass the full triggers object
        trigger: triggers, // Keep for backward compatibility
        isValid: triggerKeys.length > 0,
        errors:
          triggerKeys.length === 0
            ? ["At least one trigger must be enabled"]
            : [],
      };

      onUpdate(updatedData);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [label, triggers, onUpdate]);

  const handleTriggerToggle = useCallback(
    (triggerType: keyof WorkflowTriggers) => {
      const newTriggers = { ...triggers };

      if (newTriggers[triggerType]) {
        delete newTriggers[triggerType];
      } else {
        // Set default trigger configuration
        switch (triggerType) {
          case "push":
            newTriggers.push = { branches: ["main"] };
            break;
          case "pull_request":
            newTriggers.pull_request = { branches: ["main"] };
            break;
          case "workflow_dispatch":
            newTriggers.workflow_dispatch = {};
            break;
          case "schedule":
            newTriggers.schedule = [{ cron: "0 0 * * *" }];
            break;
          case "release":
            newTriggers.release = { types: ["published"] };
            break;
          case "issues":
            newTriggers.issues = { types: ["opened"] };
            break;
          default:
            (newTriggers as Record<string, unknown>)[triggerType] = {};
        }
      }

      setTriggers(newTriggers);
      // The useEffect will handle updating the workflow through onUpdate
    },
    [triggers]
  );

  const updatePushPullRequestConfig = useCallback(
    (triggerType: "push" | "pull_request", branches: string[]) => {
      const newTriggers = { ...triggers };
      const existingConfig = newTriggers[triggerType] as
        | PushTrigger
        | PullRequestTrigger
        | undefined;
      newTriggers[triggerType] = {
        ...existingConfig,
        branches,
      };
      setTriggers(newTriggers);
    },
    [triggers]
  );

  const updateScheduleConfig = useCallback(
    (cron: string) => {
      const newTriggers = { ...triggers };
      newTriggers.schedule = [{ cron }];
      setTriggers(newTriggers);
    },
    [triggers]
  );

  const updateReleaseConfig = useCallback(
    (types: string[]) => {
      const newTriggers = { ...triggers };
      newTriggers.release = { types } as ReleaseTrigger;
      setTriggers(newTriggers);
    },
    [triggers]
  );

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "push":
        return <GitBranch className="w-4 h-4 text-green-600" />;
      case "pull_request":
        return <GitPullRequest className="w-4 h-4 text-blue-600" />;
      case "schedule":
        return <Clock className="w-4 h-4 text-purple-600" />;
      case "workflow_dispatch":
        return <Play className="w-4 h-4 text-orange-600" />;
      case "workflow_call":
        return <FileText className="w-4 h-4 text-gray-600" />;
      case "release":
        return <Calendar className="w-4 h-4 text-red-600" />;
      case "issues":
        return <Users className="w-4 h-4 text-yellow-600" />;
      default:
        return <GitBranch className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    switch (triggerType) {
      case "push":
        return "Push to repository";
      case "pull_request":
        return "Pull request";
      case "schedule":
        return "Scheduled";
      case "workflow_dispatch":
        return "Manual trigger";
      case "workflow_call":
        return "Reusable workflow";
      case "release":
        return "Release";
      case "issues":
        return "Issues";
      default:
        return triggerType.replace(/_/g, " ");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Node Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trigger Node Label
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter trigger node label"
        />
      </div>

      {/* Trigger Configuration */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">
          Active Triggers
        </h3>

        <div className="space-y-3">
          {[
            { key: "push", label: "Push to repository" },
            { key: "pull_request", label: "Pull request" },
            { key: "workflow_dispatch", label: "Manual trigger" },
            { key: "schedule", label: "Scheduled" },
            { key: "release", label: "Release" },
            { key: "issues", label: "Issues" },
          ].map((trigger) => (
            <div key={trigger.key} className="border rounded-lg p-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={!!triggers[trigger.key as TriggerKey]}
                  onChange={() =>
                    handleTriggerToggle(trigger.key as keyof WorkflowTriggers)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2 flex-1">
                  {getTriggerIcon(trigger.key)}
                  <span className="text-sm font-medium text-gray-700">
                    {getTriggerLabel(trigger.key)}
                  </span>
                </div>
              </label>

              {/* Trigger-specific configuration */}
              {triggers[trigger.key as TriggerKey] && (
                <div className="mt-3 pl-8 space-y-2">
                  {/* Push/PR branch configuration */}
                  {(trigger.key === "push" ||
                    trigger.key === "pull_request") && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Branches
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(
                            (
                              triggers[trigger.key as TriggerKey] as
                                | PushTrigger
                                | PullRequestTrigger
                            )?.branches
                          )
                            ? (
                                triggers[trigger.key as TriggerKey] as
                                  | PushTrigger
                                  | PullRequestTrigger
                              ).branches!.join(", ")
                            : "main"
                        }
                        onChange={(e) => {
                          const branches = e.target.value
                            .split(",")
                            .map((b) => b.trim())
                            .filter(Boolean);
                          updatePushPullRequestConfig(
                            trigger.key as "push" | "pull_request",
                            branches
                          );
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="main, develop, feature/*"
                      />
                    </div>
                  )}

                  {/* Schedule cron configuration */}
                  {trigger.key === "schedule" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Cron Expression
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(triggers.schedule)
                            ? triggers.schedule[0]?.cron || "0 0 * * *"
                            : "0 0 * * *"
                        }
                        onChange={(e) => {
                          updateScheduleConfig(e.target.value);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0 0 * * *"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Daily: 0 0 * * * | Weekly: 0 0 * * 0 | Every 6h: 0 */6 *
                        * *
                      </p>
                    </div>
                  )}

                  {/* Release types configuration */}
                  {trigger.key === "release" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Release Types
                      </label>
                      <select
                        value={
                          Array.isArray(
                            (triggers.release as ReleaseTrigger)?.types
                          )
                            ? (triggers.release as ReleaseTrigger).types![0]
                            : "published"
                        }
                        onChange={(e) => {
                          updateReleaseConfig([e.target.value]);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                        <option value="created">Created</option>
                        <option value="edited">Edited</option>
                        <option value="deleted">Deleted</option>
                        <option value="prereleased">Pre-released</option>
                        <option value="released">Released</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>Trigger Configuration:</strong> Select one or more triggers
          that will start this workflow. Changes here will sync with the
          workflow settings and affect when your workflow runs.
        </p>
      </div>
    </div>
  );
}
