import { useState, useEffect, useCallback } from "react";
import { Server, Settings, Shield, Clock } from "lucide-react";

interface JobPropertiesProps {
  nodeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export default function JobProperties({
  nodeData,
  onUpdate,
}: JobPropertiesProps) {
  const [label, setLabel] = useState((nodeData.label as string) || "");
  const [runsOn, setRunsOn] = useState(
    (nodeData.runsOn as string) || "ubuntu-latest"
  );
  const [timeoutMinutes, setTimeoutMinutes] = useState(
    (nodeData.timeoutMinutes as number) || 360
  );
  const [strategy, setStrategy] = useState((nodeData.strategy as string) || "");
  const [environment, setEnvironment] = useState(
    (nodeData.environment as string) || ""
  );
  const [permissions, setPermissions] = useState(
    (nodeData.permissions as string) || ""
  );

  const validateJob = useCallback(() => {
    if (!label.trim()) return false;
    if (!runsOn.trim()) return false;
    if (timeoutMinutes <= 0 || timeoutMinutes > 2160) return false;
    return true;
  }, [label, runsOn, timeoutMinutes]);

  const getValidationErrors = useCallback(() => {
    const errors = [];
    if (!label.trim()) errors.push("Job name is required");
    if (!runsOn.trim()) errors.push("Runner is required");
    if (timeoutMinutes <= 0) errors.push("Timeout must be greater than 0");
    if (timeoutMinutes > 2160)
      errors.push("Timeout cannot exceed 2160 minutes (36 hours)");
    return errors;
  }, [label, runsOn, timeoutMinutes]);

  const updateData = useCallback(() => {
    const updatedData = {
      label,
      runsOn,
      timeoutMinutes,
      strategy: strategy || undefined,
      environment: environment || undefined,
      permissions: permissions || undefined,
      isValid: validateJob(),
      errors: getValidationErrors(),
    };
    onUpdate(updatedData);
  }, [
    label,
    runsOn,
    timeoutMinutes,
    strategy,
    environment,
    permissions,
    validateJob,
    getValidationErrors,
    onUpdate,
  ]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  const getRunnerOptions = () => [
    {
      value: "ubuntu-latest",
      label: "Ubuntu Latest",
      description: "Ubuntu 22.04",
    },
    { value: "ubuntu-20.04", label: "Ubuntu 20.04", description: "LTS" },
    {
      value: "windows-latest",
      label: "Windows Latest",
      description: "Windows Server 2022",
    },
    {
      value: "windows-2019",
      label: "Windows 2019",
      description: "Windows Server 2019",
    },
    { value: "macos-latest", label: "macOS Latest", description: "macOS 14" },
    { value: "macos-13", label: "macOS 13", description: "Ventura" },
    { value: "macos-12", label: "macOS 12", description: "Monterey" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Name
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter job name"
        />
      </div>

      {/* Runner Configuration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Runs On
          </div>
        </label>
        <select
          value={runsOn}
          onChange={(e) => setRunsOn(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {getRunnerOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose the operating system for this job.
        </p>
      </div>

      {/* Timeout Configuration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timeout (minutes)
          </div>
        </label>
        <input
          type="number"
          value={timeoutMinutes}
          onChange={(e) => setTimeoutMinutes(parseInt(e.target.value) || 360)}
          min="1"
          max="2160"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Maximum time in minutes before the job is cancelled (1-2160).
        </p>
      </div>

      {/* Strategy Configuration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Strategy (optional)
          </div>
        </label>
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">None</option>
          <option value="matrix">Matrix Strategy</option>
          <option value="fail-fast">Fail Fast Strategy</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Configure job execution strategy for multiple configurations.
        </p>
      </div>

      {/* Environment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Environment (optional)
        </label>
        <input
          type="text"
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="production, staging, development"
        />
        <p className="text-xs text-gray-500 mt-1">
          Deployment environment name for environment protection rules.
        </p>
      </div>

      {/* Permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions (optional)
          </div>
        </label>
        <select
          value={permissions}
          onChange={(e) => setPermissions(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Default</option>
          <option value="read-all">Read All</option>
          <option value="write-all">Write All</option>
          <option value="contents-read">Contents: Read</option>
          <option value="contents-write">Contents: Write</option>
          <option value="packages-write">Packages: Write</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Set GITHUB_TOKEN permissions for this job.
        </p>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Job Information:</strong> Jobs run in parallel by default.
          Configure the runner, timeout, and other settings to control how this
          job executes.
        </p>
      </div>
    </div>
  );
}
