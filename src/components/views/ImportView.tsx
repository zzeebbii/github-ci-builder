import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ImportView() {
  const [dragActive, setDragActive] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".yml") && !file.name.endsWith(".yaml")) {
      setImportStatus("error");
      setErrorMessage("Please select a valid YAML file (.yml or .yaml)");
      return;
    }

    try {
      const content = await file.text();
      setFileContent(content);
      setFileName(file.name);
      setImportStatus("success");
      setErrorMessage("");
    } catch (error) {
      setImportStatus("error");
      setErrorMessage("Error reading file: " + (error as Error).message);
    }
  };

  const handleImport = () => {
    // TODO: Implement YAML parsing and workflow import
    console.log("Importing workflow from YAML:", fileContent);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Import Workflow
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Import an existing GitHub Actions workflow from a YAML file
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
        <div className="max-w-2xl mx-auto space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : importStatus === "error"
                ? "border-red-300 bg-red-50"
                : importStatus === "success"
                ? "border-green-300 bg-green-50"
                : "border-gray-300 bg-white hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".yml,.yaml"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 flex items-center justify-center">
                {importStatus === "success" ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : importStatus === "error" ? (
                  <AlertCircle className="w-12 h-12 text-red-500" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {importStatus === "success"
                    ? "File loaded successfully!"
                    : "Drop your YAML file here"}
                </h3>

                <p className="text-gray-600 mt-1">
                  {importStatus === "success"
                    ? `Loaded: ${fileName}`
                    : "or click to browse and select a .yml or .yaml file"}
                </p>

                {importStatus === "error" && (
                  <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
                )}
              </div>
            </div>
          </div>

          {/* File Content Preview */}
          {fileContent && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">
                    File Preview
                  </h3>
                </div>

                <button
                  onClick={handleImport}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Import Workflow
                </button>
              </div>

              <div className="p-4">
                <pre className="text-sm text-gray-800 overflow-auto max-h-96 bg-gray-50 p-4 rounded border">
                  {fileContent}
                </pre>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Supported Format
            </h4>
            <p className="text-sm text-blue-800">
              Upload a valid GitHub Actions workflow file (.yml or .yaml). The
              file should contain a complete workflow definition with jobs,
              steps, and triggers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
