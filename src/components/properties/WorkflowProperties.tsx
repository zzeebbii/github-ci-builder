import { useState, useEffect } from "react";
import { useWorkflowStore } from "../../store/workflow";
import type {
  GitHubWorkflow,
  WorkflowTriggers,
} from "../../types/github-actions";

interface WorkflowPropertiesProps {
  onUpdate: (updates: Partial<GitHubWorkflow>) => void;
}

export default function WorkflowProperties({
  onUpdate,
}: WorkflowPropertiesProps) {
  const { workflow } = useWorkflowStore();
  const [formData, setFormData] = useState({
    name: workflow.name || "",
    runName: workflow["run-name"] || "",
    env: workflow.env || {},
    permissions: workflow.permissions || {},
  });

  // Trigger configuration
  const [triggers, setTriggers] = useState<WorkflowTriggers>(workflow.on);

  useEffect(() => {
    setFormData({
      name: workflow.name || "",
      runName: workflow["run-name"] || "",
      env: workflow.env || {},
      permissions: workflow.permissions || {},
    });
    setTriggers(workflow.on);
  }, [workflow]);

  const handleFormChange = (
    field: string,
    value: string | Record<string, string> | Record<string, unknown>
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Update the workflow
    const updates: Partial<GitHubWorkflow> = {
      name: newFormData.name || undefined,
      "run-name": newFormData.runName || undefined,
      env:
        Object.keys(newFormData.env).length > 0 ? newFormData.env : undefined,
      permissions:
        Object.keys(newFormData.permissions).length > 0
          ? newFormData.permissions
          : undefined,
    };

    onUpdate(updates);
  };

  const handleTriggerChange = (newTriggers: WorkflowTriggers) => {
    setTriggers(newTriggers);
    onUpdate({ on: newTriggers });
  };

  const addEnvVariable = () => {
    const key = prompt("Enter environment variable name:");
    const value = prompt("Enter environment variable value:");
    if (key && value) {
      const newEnv = { ...formData.env, [key]: value };
      handleFormChange("env", newEnv);
    }
  };

  const removeEnvVariable = (key: string) => {
    const newEnv = { ...formData.env };
    delete newEnv[key];
    handleFormChange("env", newEnv);
  };

  const toggleTrigger = (triggerType: keyof WorkflowTriggers) => {
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
        default:
          (newTriggers as Record<string, unknown>)[triggerType] = {};
      }
    }
    handleTriggerChange(newTriggers);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
          Basic Information
        </h3>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Workflow Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="CI"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Run Name (optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Deploy by @${{ github.actor }}"
            value={formData.runName}
            onChange={(e) => handleFormChange("runName", e.target.value)}
          />
        </div>
      </div>

      {/* Triggers */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
          Triggers
        </h3>

        <div className="space-y-2">
          {[
            { key: "push", label: "Push to repository" },
            { key: "pull_request", label: "Pull request" },
            { key: "workflow_dispatch", label: "Manual trigger" },
            { key: "schedule", label: "Scheduled" },
          ].map((trigger) => (
            <label key={trigger.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!(triggers as Record<string, unknown>)[trigger.key]}
                onChange={() =>
                  toggleTrigger(trigger.key as keyof WorkflowTriggers)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{trigger.label}</span>
            </label>
          ))}
        </div>

        {/* Push trigger configuration */}
        {triggers.push && (
          <div className="pl-4 border-l-2 border-blue-200 bg-blue-50 p-3 rounded">
            <div className="text-xs font-medium text-blue-900 mb-2">
              Push Configuration
            </div>
            <div className="text-xs text-blue-700">
              Branches:{" "}
              {Array.isArray(triggers.push.branches)
                ? triggers.push.branches.join(", ")
                : "main"}
            </div>
          </div>
        )}

        {/* Pull request trigger configuration */}
        {triggers.pull_request && (
          <div className="pl-4 border-l-2 border-green-200 bg-green-50 p-3 rounded">
            <div className="text-xs font-medium text-green-900 mb-2">
              Pull Request Configuration
            </div>
            <div className="text-xs text-green-700">
              Branches:{" "}
              {Array.isArray(triggers.pull_request.branches)
                ? triggers.pull_request.branches.join(", ")
                : "main"}
            </div>
          </div>
        )}
      </div>

      {/* Environment Variables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 flex-1">
            Environment Variables
          </h3>
          <button
            onClick={addEnvVariable}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add
          </button>
        </div>

        {Object.entries(formData.env).length === 0 ? (
          <div className="text-xs text-gray-500 italic">
            No environment variables configured
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(formData.env).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 flex-1">
                  {key}={value}
                </code>
                <button
                  onClick={() => removeEnvVariable(key)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
          Permissions
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            "contents",
            "actions",
            "checks",
            "deployments",
            "issues",
            "packages",
            "pull-requests",
            "security-events",
          ].map((permission) => (
            <label key={permission} className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={
                  !!(formData.permissions as Record<string, unknown>)[
                    permission
                  ]
                }
                onChange={(e) => {
                  const newPermissions = { ...formData.permissions };
                  if (e.target.checked) {
                    (newPermissions as Record<string, string>)[permission] =
                      "read";
                  } else {
                    delete (newPermissions as Record<string, unknown>)[
                      permission
                    ];
                  }
                  handleFormChange("permissions", newPermissions);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 capitalize">
                {permission.replace("-", " ")}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
