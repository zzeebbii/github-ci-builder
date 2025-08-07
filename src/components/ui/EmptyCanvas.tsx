import { Plus, Zap, GitBranch, GitPullRequest, Play } from "lucide-react";
import { useWorkflowStore } from "../../store/workflow";
import AddNodeButton from "../ui/AddNodeButton";

export default function EmptyCanvas() {
  const { addNode, autoArrangeNodes } = useWorkflowStore();

  const handleAddFirstNode = (
    nodeType: string,
    nodeData: {
      label: string;
      [key: string]: string | number | boolean | undefined | string[];
    }
  ) => {
    // Add the first node in the center of the canvas
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType as "trigger" | "job" | "step",
      position: { x: 300, y: 200 }, // Center position
      data: nodeData,
    };

    addNode(newNode);

    // Auto-arrange the layout after adding the first node
    setTimeout(() => {
      autoArrangeNodes();
    }, 100); // Small delay to ensure the node is fully added before arranging
  };

  const quickStartOptions = [
    {
      type: "trigger",
      label: "Push Trigger",
      description: "Triggers when code is pushed to your repository",
      icon: GitBranch,
      bgColor: "bg-green-100 group-hover:bg-green-200",
      iconColor: "text-green-600",
      data: {
        label: "Push",
        triggerType: "push",
        branches: ["main"],
        description: "Triggers on push to main branch",
      },
    },
    {
      type: "trigger",
      label: "Pull Request Trigger",
      description: "Triggers when pull requests are opened or updated",
      icon: GitPullRequest,
      bgColor: "bg-blue-100 group-hover:bg-blue-200",
      iconColor: "text-blue-600",
      data: {
        label: "Pull Request",
        triggerType: "pull_request",
        branches: ["main"],
        description: "Triggers on pull requests",
      },
    },
    {
      type: "trigger",
      label: "Manual Trigger",
      description: "Allows you to run the workflow manually",
      icon: Play,
      bgColor: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      data: {
        label: "Manual",
        triggerType: "workflow_dispatch",
        description: "Manually triggered workflow",
      },
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-lg bg-white rounded-xl shadow-xl p-8 border border-gray-200">
        {/* Header */}
        <div className="mb-8">
          <Zap className="w-20 h-20 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Create Your First Workflow
          </h2>
          <p className="text-gray-600 text-lg">
            Every GitHub Actions workflow starts with a trigger.
            <br />
            <span className="font-medium">
              Choose how you want your workflow to start:
            </span>
          </p>
        </div>

        {/* Quick Start Options */}
        <div className="space-y-4 mb-8">
          {quickStartOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <button
                key={index}
                onClick={() => handleAddFirstNode(option.type, option.data)}
                className="w-full p-5 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${option.bgColor} transition-colors`}
                  >
                    <IconComponent className={`w-6 h-6 ${option.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700 text-lg">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Alternative: Custom Node Picker */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need something else? Browse all available trigger types:
          </p>
          <div className="flex justify-center">
            <AddNodeButton
              onAddNode={handleAddFirstNode}
              context="empty"
              className="transform scale-110"
            />
          </div>
        </div>

        {/* Help text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> After adding a trigger, you can hover over
            it to add jobs and steps to your workflow.
          </p>
        </div>
      </div>
    </div>
  );
}
