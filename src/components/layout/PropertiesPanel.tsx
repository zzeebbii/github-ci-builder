import { X, Settings, Info } from "lucide-react";
import { useWorkflowStore } from "../../store/workflow";

interface PropertiesPanelProps {
  onClose: () => void;
}

export default function PropertiesPanel({ onClose }: PropertiesPanelProps) {
  const { selectedNode, workflow } = useWorkflowStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedNode ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">
                  Node Properties
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter node name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter description..."
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">
                  Workflow Properties
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={workflow.name || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter workflow name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Triggers
                  </label>
                  <div className="space-y-2">
                    {Object.keys(workflow.on || {}).map(trigger => (
                      <div
                        key={trigger}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {trigger.replace("_", " ")}
                        </span>
                        <button className="text-xs text-red-600 hover:text-red-700">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jobs
                  </label>
                  <div className="text-sm text-gray-600">
                    {Object.keys(workflow.jobs || {}).length} job(s) configured
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-center text-gray-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Select a node to edit its properties</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
