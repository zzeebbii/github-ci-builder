import { useState } from "react";
import { Download, Copy, FileText, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkflowStore } from "../../store/workflow";

export default function ExportView() {
  const { workflow } = useWorkflowStore();
  const [copied, setCopied] = useState(false);

  // Generate YAML content (simplified for now)
  const generateYAML = () => {
    const yamlContent = `name: ${workflow.name || "CI"}

on:
${Object.keys(workflow.on || {})
  .map((trigger) => `  ${trigger}:`)
  .join("\n")}

jobs:
${Object.entries(workflow.jobs || {})
  .map(
    ([jobId, job]) =>
      `  ${jobId}:
    runs-on: ${job["runs-on"]}
    steps:
${job.steps
  .map(
    (step) =>
      `      - name: ${step.name || "Step"}
        ${
          step.uses
            ? `uses: ${step.uses}`
            : step.run
            ? `run: ${step.run}`
            : 'run: echo "Hello World"'
        }`
  )
  .join("\n")}`
  )
  .join("\n\n")}`;

    return yamlContent;
  };

  const yamlContent = generateYAML();

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

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Export Workflow
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Export your visual workflow as a GitHub Actions YAML file
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Builder
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4" />
              Download YAML
            </button>

            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                copied
                  ? "text-green-700 bg-green-50 border-green-200"
                  : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-blue-500"
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
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>

          {/* YAML Preview */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">
                {workflow.name || "workflow"}.yml
              </h3>
            </div>

            <div className="p-0">
              <pre className="text-sm text-gray-800 overflow-auto p-6 bg-gray-900 text-green-400 font-mono">
                {yamlContent}
              </pre>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-blue-900 mb-3">
              How to use this workflow
            </h4>

            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <strong>1. Create the workflow file:</strong>
                <p className="mt-1">
                  In your repository, create a new file at{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    .github/workflows/{workflow.name || "ci"}.yml
                  </code>
                </p>
              </div>

              <div>
                <strong>2. Add the content:</strong>
                <p className="mt-1">
                  Copy the YAML content above and paste it into the workflow
                  file.
                </p>
              </div>

              <div>
                <strong>3. Commit and push:</strong>
                <p className="mt-1">
                  Commit the file to your repository. The workflow will run
                  automatically based on the configured triggers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
