import { useState, useEffect, useCallback } from "react";
import { Package, Code, Terminal, ExternalLink } from "lucide-react";

interface StepPropertiesProps {
  nodeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export default function StepProperties({
  nodeData,
  onUpdate,
}: StepPropertiesProps) {
  const [label, setLabel] = useState((nodeData.label as string) || "");
  const [stepType, setStepType] = useState(
    (nodeData.type as string) || "action"
  );
  const [actionName, setActionName] = useState(
    (nodeData.actionName as string) || ""
  );
  const [actionVersion, setActionVersion] = useState(
    (nodeData.actionVersion as string) || ""
  );
  const [runCommand, setRunCommand] = useState(
    (nodeData.runCommand as string) || ""
  );
  const [shell, setShell] = useState((nodeData.shell as string) || "bash");
  const [workingDirectory, setWorkingDirectory] = useState(
    (nodeData.workingDirectory as string) || ""
  );
  const [continueOnError, setContinueOnError] = useState(
    (nodeData.continueOnError as boolean) || false
  );
  const [condition, setCondition] = useState(
    (nodeData.condition as string) || ""
  );

  const validateStep = useCallback(() => {
    if (!label.trim()) return false;
    if (stepType === "action" && !actionName.trim()) return false;
    if (stepType === "run" && !runCommand.trim()) return false;
    return true;
  }, [label, stepType, actionName, runCommand]);

  const getValidationErrors = useCallback(() => {
    const errors = [];
    if (!label.trim()) errors.push("Step name is required");
    if (stepType === "action" && !actionName.trim()) {
      errors.push("Action name is required");
    }
    if (stepType === "run" && !runCommand.trim()) {
      errors.push("Run command is required");
    }
    return errors;
  }, [label, stepType, actionName, runCommand]);

  // Use useEffect to update data when form values change, but debounce the updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updatedData = {
        label,
        type: stepType,
        actionName: stepType === "action" ? actionName : undefined,
        actionVersion: stepType === "action" ? actionVersion : undefined,
        runCommand: stepType === "run" ? runCommand : undefined,
        shell: stepType === "run" ? shell : undefined,
        workingDirectory: workingDirectory || undefined,
        continueOnError: continueOnError || undefined,
        condition: condition || undefined,
        isValid: validateStep(),
        errors: getValidationErrors(),
      };

      onUpdate(updatedData);
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    label,
    stepType,
    actionName,
    actionVersion,
    runCommand,
    shell,
    workingDirectory,
    continueOnError,
    condition,
  ]);

  const getStepIcon = () => {
    switch (stepType) {
      case "action":
        return <Package className="w-4 h-4" />;
      case "run":
        return <Terminal className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getPopularActions = () => [
    {
      name: "actions/checkout",
      version: "v4",
      description: "Checkout repository code",
    },
    {
      name: "actions/setup-node",
      version: "v4",
      description: "Setup Node.js environment",
    },
    {
      name: "actions/setup-python",
      version: "v5",
      description: "Setup Python environment",
    },
    { name: "actions/cache", version: "v4", description: "Cache dependencies" },
    {
      name: "actions/upload-artifact",
      version: "v4",
      description: "Upload build artifacts",
    },
    {
      name: "actions/download-artifact",
      version: "v4",
      description: "Download artifacts",
    },
    {
      name: "docker/build-push-action",
      version: "v5",
      description: "Build and push Docker images",
    },
    {
      name: "aws-actions/configure-aws-credentials",
      version: "v4",
      description: "Configure AWS credentials",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Step Name
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Enter step name"
        />
      </div>

      {/* Step Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            {getStepIcon()}
            Step Type
          </div>
        </label>
        <select
          value={stepType}
          onChange={(e) => setStepType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="action">Use Action</option>
          <option value="run">Run Command</option>
        </select>
      </div>

      {/* Action Configuration */}
      {stepType === "action" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Name
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={actionName}
                onChange={(e) => setActionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="owner/action-name"
              />
              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                {getPopularActions().map((action) => (
                  <button
                    key={action.name}
                    onClick={() => {
                      setActionName(action.name);
                      setActionVersion(action.version);
                    }}
                    className="text-left p-2 text-xs hover:bg-blue-50 rounded border border-gray-200"
                  >
                    <div className="font-medium text-blue-600">
                      {action.name}@{action.version}
                    </div>
                    <div className="text-gray-500">{action.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version
            </label>
            <input
              type="text"
              value={actionVersion}
              onChange={(e) => setActionVersion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="v4, main, or commit SHA"
            />
            <p className="text-xs text-gray-500 mt-1">
              Version, branch, or commit SHA to use.
            </p>
          </div>
        </>
      )}

      {/* Run Command Configuration */}
      {stepType === "run" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Command
            </label>
            <textarea
              value={runCommand}
              onChange={(e) => setRunCommand(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              placeholder="echo 'Hello World'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shell
            </label>
            <select
              value={shell}
              onChange={(e) => setShell(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="bash">bash</option>
              <option value="sh">sh</option>
              <option value="cmd">cmd</option>
              <option value="pwsh">pwsh</option>
              <option value="powershell">powershell</option>
            </select>
          </div>
        </>
      )}

      {/* Working Directory */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Working Directory (optional)
        </label>
        <input
          type="text"
          value={workingDirectory}
          onChange={(e) => setWorkingDirectory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="./subdirectory"
        />
      </div>

      {/* Advanced Options */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Advanced Options</h4>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="continueOnError"
            checked={continueOnError}
            onChange={(e) => setContinueOnError(e.target.checked)}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <label htmlFor="continueOnError" className="text-sm text-gray-700">
            Continue on error
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition (optional)
          </label>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
            placeholder="success() || failure()"
          />
          <p className="text-xs text-gray-500 mt-1">
            Expression to control when this step runs.
          </p>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Step Information:</strong> Steps run sequentially within a
          job. Use actions for reusable functionality or run commands for custom
          logic.
        </p>
        <div className="mt-2">
          <a
            href="https://github.com/marketplace?type=actions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
            Browse GitHub Marketplace
          </a>
        </div>
      </div>
    </div>
  );
}
