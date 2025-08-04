import { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  Calendar,
  FileText,
  Users,
  GitPullRequest,
} from "lucide-react";

interface TriggerPropertiesProps {
  nodeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export default function TriggerProperties({
  nodeData,
  onUpdate,
}: TriggerPropertiesProps) {
  const [label, setLabel] = useState((nodeData.label as string) || "");
  const [triggerType, setTriggerType] = useState(
    (nodeData.triggerType as string) || "push"
  );
  const [branches, setBranches] = useState(
    Array.isArray(nodeData.branches)
      ? (nodeData.branches as string[]).join(", ")
      : "main"
  );
  const [paths, setPaths] = useState(
    Array.isArray(nodeData.paths) ? (nodeData.paths as string[]).join(", ") : ""
  );
  const [schedule, setSchedule] = useState((nodeData.schedule as string) || "");

  const validateTrigger = useCallback(() => {
    if (!label.trim()) return false;
    if (triggerType === "schedule" && !schedule.trim()) return false;
    if (
      (triggerType === "push" || triggerType === "pull_request") &&
      !branches.trim()
    )
      return false;
    return true;
  }, [label, triggerType, schedule, branches]);

  const getValidationErrors = useCallback(() => {
    const errors = [];
    if (!label.trim()) errors.push("Label is required");
    if (triggerType === "schedule" && !schedule.trim()) {
      errors.push("Schedule cron expression is required");
    }
    if (
      (triggerType === "push" || triggerType === "pull_request") &&
      !branches.trim()
    ) {
      errors.push("At least one branch is required");
    }
    return errors;
  }, [label, triggerType, schedule, branches]);

  // Use useEffect to update data when form values change, but debounce the updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updatedData = {
        label,
        triggerType,
        branches: branches
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
        paths: paths
          ? paths
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean)
          : undefined,
        schedule: schedule || undefined,
        isValid: validateTrigger(),
        errors: getValidationErrors(),
      };

      // Only call onUpdate with the new data
      onUpdate(updatedData);
    }, 100); // Small debounce to prevent excessive updates

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, triggerType, branches, paths, schedule]); // Remove callback dependencies to prevent infinite loop

  const getTriggerIcon = () => {
    switch (triggerType) {
      case "push":
        return <GitBranch className="w-4 h-4" />;
      case "pull_request":
        return <GitPullRequest className="w-4 h-4" />;
      case "schedule":
        return <Calendar className="w-4 h-4" />;
      case "workflow_dispatch":
        return <Users className="w-4 h-4" />;
      case "workflow_call":
        return <FileText className="w-4 h-4" />;
      default:
        return <GitBranch className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trigger Name
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter trigger name"
        />
      </div>

      {/* Trigger Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            {getTriggerIcon()}
            Trigger Type
          </div>
        </label>
        <select
          value={triggerType}
          onChange={(e) => setTriggerType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="push">Push</option>
          <option value="pull_request">Pull Request</option>
          <option value="schedule">Schedule</option>
          <option value="workflow_dispatch">Manual Trigger</option>
          <option value="workflow_call">Reusable Workflow</option>
          <option value="release">Release</option>
          <option value="issues">Issues</option>
        </select>
      </div>

      {/* Branch Configuration */}
      {(triggerType === "push" || triggerType === "pull_request") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branches
          </label>
          <input
            type="text"
            value={branches}
            onChange={(e) => setBranches(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="main, develop, feature/*"
          />
          <p className="text-xs text-gray-500 mt-1">
            Comma-separated list of branches. Supports wildcards.
          </p>
        </div>
      )}

      {/* Path Configuration */}
      {(triggerType === "push" || triggerType === "pull_request") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paths (optional)
          </label>
          <input
            type="text"
            value={paths}
            onChange={(e) => setPaths(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="src/**, docs/**, *.md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Comma-separated list of file paths. Leave empty to trigger on all
            changes.
          </p>
        </div>
      )}

      {/* Schedule Configuration */}
      {triggerType === "schedule" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule (Cron)
          </label>
          <input
            type="text"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0 0 * * *"
          />
          <p className="text-xs text-gray-500 mt-1">
            Cron expression. Example: "0 0 * * *" for daily at midnight UTC.
          </p>
          <div className="mt-2 p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Common patterns:</strong>
              <br />• Daily: <code>0 0 * * *</code>
              <br />• Weekly: <code>0 0 * * 0</code>
              <br />• Every 6 hours: <code>0 */6 * * *</code>
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Trigger Information:</strong> This node defines when your
          workflow will run. Configure the appropriate trigger type and
          conditions based on your requirements.
        </p>
      </div>
    </div>
  );
}
