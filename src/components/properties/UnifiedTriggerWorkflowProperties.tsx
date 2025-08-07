import { useState, useEffect, useCallback } from "react";
import { useWorkflowStore } from "../../store/workflow";
import type {
  GitHubWorkflow,
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
  Settings,
  Globe,
  Shield,
} from "lucide-react";

interface UnifiedTriggerWorkflowPropertiesProps {
  nodeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

type TriggerKey = keyof WorkflowTriggers;

export default function UnifiedTriggerWorkflowProperties({
  nodeData,
  onUpdate,
}: UnifiedTriggerWorkflowPropertiesProps) {
  const { workflow, updateWorkflow } = useWorkflowStore();
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
      newLabel = `On ${triggerKeys.map(k => k.replace(/_/g, " ")).join(", ")}`;
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
        triggers: triggers,
        trigger: triggers,
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

  const handleWorkflowUpdate = useCallback(
    (updates: Partial<GitHubWorkflow>) => {
      updateWorkflow(updates);
    },
    [updateWorkflow]
  );

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
      // Also update the workflow
      handleWorkflowUpdate({ on: newTriggers });
    },
    [triggers, handleWorkflowUpdate]
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
      handleWorkflowUpdate({ on: newTriggers });
    },
    [triggers, handleWorkflowUpdate]
  );

  const updateScheduleConfig = useCallback(
    (cron: string) => {
      const newTriggers = { ...triggers };
      newTriggers.schedule = [{ cron }];
      setTriggers(newTriggers);
      handleWorkflowUpdate({ on: newTriggers });
    },
    [triggers, handleWorkflowUpdate]
  );

  const updateReleaseConfig = useCallback(
    (types: string[]) => {
      const newTriggers = { ...triggers };
      newTriggers.release = { types } as ReleaseTrigger;
      setTriggers(newTriggers);
      handleWorkflowUpdate({ on: newTriggers });
    },
    [triggers, handleWorkflowUpdate]
  );

  const addEnvVariable = () => {
    const key = prompt("Enter environment variable name:");
    if (!key || key.trim() === "") {
      return;
    }

    const value = prompt("Enter environment variable value:");
    if (value === null) {
      return;
    } // User cancelled

    const trimmedKey = key.trim();
    const currentEnv = workflow.env || {};
    const newEnv = { ...currentEnv, [trimmedKey]: value };

    handleWorkflowUpdate({ env: newEnv });
  };

  const removeEnvVariable = (key: string) => {
    const currentEnv = workflow.env || {};
    const newEnv = { ...currentEnv };
    delete newEnv[key];

    handleWorkflowUpdate({
      env: Object.keys(newEnv).length > 0 ? newEnv : undefined,
    });
  };

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
    <div className="p-4 space-y-6 animate-in slide-in-from-right-2 duration-300">
      {/* Workflow Settings Section */}
      <div className="space-y-4 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-2 border-b pb-2">
          <Settings className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Workflow Settings
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workflow Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="CI"
            value={workflow.name || ""}
            onChange={e =>
              handleWorkflowUpdate({ name: e.target.value || undefined })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Node Label
          </label>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter trigger node label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Run Name (optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Deploy by @${{ github.actor }}"
            value={workflow["run-name"] || ""}
            onChange={e =>
              handleWorkflowUpdate({ "run-name": e.target.value || undefined })
            }
          />
        </div>
      </div>

      {/* Triggers Section */}
      <div className="space-y-4 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-2 border-b pb-2">
          <Play className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Triggers</h3>
        </div>

        <div className="space-y-3">
          {[
            { key: "push", label: "Push to repository" },
            { key: "pull_request", label: "Pull request" },
            { key: "workflow_dispatch", label: "Manual trigger" },
            { key: "schedule", label: "Scheduled" },
            { key: "release", label: "Release" },
            { key: "issues", label: "Issues" },
          ].map(trigger => (
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
                        onChange={e => {
                          const branches = e.target.value
                            .split(",")
                            .map(b => b.trim())
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
                        onChange={e => {
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
                        onChange={e => {
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

      {/* Environment Variables Section */}
      <div className="space-y-4 transition-all duration-200 ease-in-out">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Environment Variables
            </h3>
          </div>
          <button
            onClick={addEnvVariable}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
          >
            + Add
          </button>
        </div>

        {Object.entries(workflow.env || {}).length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            No environment variables configured
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(workflow.env || {}).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 flex-1 text-xs">
                  {key}={String(value)}
                </code>
                <button
                  onClick={() => removeEnvVariable(key)}
                  className="text-red-600 hover:text-red-800 font-bold text-sm px-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title={`Remove ${key}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions Section */}
      <div className="space-y-4 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-2 border-b pb-2">
          <Shield className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Permissions</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            "contents",
            "actions",
            "checks",
            "deployments",
            "issues",
            "packages",
            "pull-requests",
            "security-events",
          ].map(permission => (
            <label
              key={permission}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={
                  !!((workflow.permissions as Record<string, unknown>) || {})[
                    permission
                  ]
                }
                onChange={e => {
                  const newPermissions = { ...(workflow.permissions || {}) };
                  if (e.target.checked) {
                    (newPermissions as Record<string, string>)[permission] =
                      "read";
                  } else {
                    delete (newPermissions as Record<string, unknown>)[
                      permission
                    ];
                  }
                  handleWorkflowUpdate({
                    permissions:
                      Object.keys(newPermissions).length > 0
                        ? newPermissions
                        : undefined,
                  });
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 capitalize text-xs">
                {permission.replace("-", " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>Unified Configuration:</strong> This panel combines workflow
          settings and trigger configuration. Changes here affect both the
          workflow metadata and when your workflow runs. The trigger node
          represents the entry point and workflow settings combined.
        </p>
      </div>
    </div>
  );
}
