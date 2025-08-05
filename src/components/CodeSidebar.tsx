import { useState, useMemo, useEffect } from "react";
import {
  Code2,
  Copy,
  Download,
  CheckCircle,
  AlertCircle,
  EyeOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import * as yaml from "js-yaml";
import { useWorkflowStore } from "../store/workflow";

interface CodeSidebarProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function CodeSidebar({ isVisible, onToggle }: CodeSidebarProps) {
  const { workflow, isValid, errors } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate YAML content in real-time
  const { yamlContent, yamlError } = useMemo(() => {
    try {
      // Create clean workflow object with proper property ordering
      const cleanWorkflow: Record<string, unknown> = {};

      // Add name
      cleanWorkflow.name = workflow.name || "CI";

      // Add run-name if it exists
      if (workflow["run-name"]) {
        cleanWorkflow["run-name"] = workflow["run-name"];
      }

      // Add triggers (clean up null values)
      const workflowTriggers = workflow.on || { push: { branches: ["main"] } };
      const cleanTriggers = { ...workflowTriggers };

      // Convert null values to empty objects for workflow_dispatch
      Object.keys(cleanTriggers).forEach(key => {
        if (cleanTriggers[key] === null) {
          cleanTriggers[key] = {};
        }
      });

      cleanWorkflow.on = cleanTriggers;

      // Add env if it exists
      if (workflow.env && Object.keys(workflow.env).length > 0) {
        cleanWorkflow.env = workflow.env;
      }

      // Add permissions if they exist
      if (
        workflow.permissions &&
        Object.keys(workflow.permissions).length > 0
      ) {
        cleanWorkflow.permissions = workflow.permissions;
      }

      // Add other properties if they exist
      if (workflow.defaults) {
        cleanWorkflow.defaults = workflow.defaults;
      }
      if (workflow.concurrency) {
        cleanWorkflow.concurrency = workflow.concurrency;
      }

      // Add jobs
      cleanWorkflow.jobs = workflow.jobs || {};

      const yamlContent = yaml.dump(cleanWorkflow, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
        quotingType: '"',
        forceQuotes: false,
      });

      return { yamlContent, yamlError: "" };
    } catch (error) {
      const errorMsg = `Export error: ${(error as Error).message}`;
      return { yamlContent: errorMsg, yamlError: errorMsg };
    }
  }, [workflow]);

  // Reset copied state after workflow changes
  useEffect(() => {
    if (copied) {
      setCopied(false);
    }
  }, [yamlContent, copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name || "workflow"}.yml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-200"
        title="Show YAML Code"
      >
        <Code2 className="w-5 h-5" />
      </button>
    );
  }

  const sidebarWidth = isExpanded ? "w-2/3" : "w-1/3";
  const minWidth = isExpanded ? "min-w-[800px]" : "min-w-[400px]";

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white border-l shadow-xl z-10 flex flex-col transition-all duration-300 ${sidebarWidth} ${minWidth}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            {workflow.name || "workflow"}.yml
          </h3>
          {!isValid && (
            <div title="Validation errors">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onToggle}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="Hide code panel"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {(!isValid || errors.length > 0 || yamlError) && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm font-medium text-red-900">
              {yamlError ? "Export Error" : "Validation Issues"}
            </span>
          </div>
          {yamlError ? (
            <p className="text-xs text-red-700">{yamlError}</p>
          ) : (
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {errors.slice(0, 3).map((error, index) => (
                <p key={index} className="text-xs text-red-700">
                  • {error}
                </p>
              ))}
              {errors.length > 3 && (
                <p className="text-xs text-red-600">
                  +{errors.length - 3} more issues...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
        <button
          onClick={handleCopy}
          disabled={yamlError !== ""}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-all ${
            copied
              ? "text-green-700 bg-green-50 border border-green-200"
              : yamlError === ""
                ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
          }`}
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={yamlError !== ""}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-all ${
            yamlError === ""
              ? "text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
          }`}
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <div className="flex-1" />

        <div className="text-xs text-gray-500">Real-time preview</div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={yamlContent}
          theme="vs-light"
          options={{
            readOnly: true,
            minimap: { enabled: isExpanded },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            lineNumbers: "on",
            folding: true,
            wordWrap: "on",
            contextmenu: true,
            selectOnLineNumbers: true,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: "selection",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              useShadows: false,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-500">Loading editor...</div>
            </div>
          }
        />
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>{yamlContent.split("\n").length} lines • YAML</span>
          <span>
            {isValid ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valid workflow
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.length} issue{errors.length !== 1 ? "s" : ""}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
