import React, { useEffect, useCallback } from "react";
import { X, Eye, Download, GitBranch, Clock, Tag } from "lucide-react";
import type { WorkflowTemplate } from "../data/default-workflows";
import Button from "./ui/Button";
import * as yaml from "js-yaml";

interface TemplatePreviewModalProps {
  template: WorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: WorkflowTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  const handleUseTemplate = useCallback(() => {
    if (template) {
      onUseTemplate(template);
      onClose();
    }
  }, [template, onUseTemplate, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        handleUseTemplate();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleUseTemplate]);

  if (!isOpen || !template) {
    return null;
  }

  const getEstimatedRuntime = (template: WorkflowTemplate) => {
    // Simple estimation based on job count and steps
    const jobCount = Object.keys(template.workflow.jobs).length;
    const stepCount = Object.values(template.workflow.jobs).reduce(
      (total, job) => total + (job.steps?.length || 0),
      0
    );

    // Basic estimation: 1 min per job + 0.5 min per step
    return Math.max(2, Math.round(jobCount + stepCount * 0.5));
  };

  const yamlContent = yaml.dump(template.workflow, {
    indent: 2,
    lineWidth: 80,
    noRefs: true,
    quotingType: '"',
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-50";
      case "intermediate":
        return "text-yellow-600 bg-yellow-50";
      case "advanced":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Frontend":
        return "text-blue-600 bg-blue-50";
      case "Backend":
        return "text-purple-600 bg-purple-50";
      case "DevOps":
        return "text-orange-600 bg-orange-50";
      case "Full Stack":
        return "text-indigo-600 bg-indigo-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {template.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    template.difficulty
                  )}`}
                >
                  {template.difficulty}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                    template.category
                  )}`}
                >
                  {template.category}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Details */}
          <div className="lg:w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Workflow Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <GitBranch className="w-4 h-4" />
                    <span>
                      {Object.keys(template.workflow.jobs).length} job
                      {Object.keys(template.workflow.jobs).length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Object.values(template.workflow.jobs).reduce(
                        (total, job) => total + (job.steps?.length || 0),
                        0
                      )}{" "}
                      total steps
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>
                      Est. runtime: {getEstimatedRuntime(template)} min
                    </span>
                  </div>
                </div>
              </div>

              {template.requiredSecrets &&
                template.requiredSecrets.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Required Secrets
                    </h3>
                    <div className="space-y-1">
                      {template.requiredSecrets.map(secret => (
                        <div
                          key={secret}
                          className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded"
                        >
                          {secret}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {template.requiredVariables &&
                template.requiredVariables.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Required Variables
                    </h3>
                    <div className="space-y-1">
                      {template.requiredVariables.map(variable => (
                        <div
                          key={variable}
                          className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded"
                        >
                          {variable}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Right Panel - YAML Preview */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">YAML Preview</h3>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <pre className="h-full overflow-auto p-4 text-xs font-mono bg-gray-50 text-gray-800 leading-relaxed">
                {yamlContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-500">
            <div>Ready to use this template in your workflow?</div>
            <div className="text-xs mt-1 opacity-75">
              Press{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd>{" "}
              to close,{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                Cmd+Enter
              </kbd>{" "}
              to use template
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUseTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Use Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
