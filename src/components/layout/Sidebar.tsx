import type { DragEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Workflow,
  Zap,
  PlayCircle,
  Package,
  Terminal,
  GitPullRequest,
  Clock,
  Layers,
  Code,
  GripVertical,
} from "lucide-react";

interface ToolItem {
  id: string;
  type: "trigger" | "job" | "step";
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
}

interface SidebarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string | null) => void;
}

const toolCategories = [
  {
    title: "Triggers",
    items: [
      {
        id: "push",
        type: "trigger",
        icon: GitPullRequest,
        label: "Push",
        description: "On push to repository",
        color: "blue",
      },
      {
        id: "pull_request",
        type: "trigger",
        icon: GitPullRequest,
        label: "Pull Request",
        description: "On pull request events",
        color: "blue",
      },
      {
        id: "schedule",
        type: "trigger",
        icon: Clock,
        label: "Schedule",
        description: "Cron-based triggers",
        color: "blue",
      },
      {
        id: "workflow_dispatch",
        type: "trigger",
        icon: PlayCircle,
        label: "Manual",
        description: "Manual workflow trigger",
        color: "blue",
      },
    ],
  },
  {
    title: "Jobs & Steps",
    items: [
      {
        id: "job",
        type: "job",
        icon: Workflow,
        label: "Job",
        description: "Create a new job",
        color: "purple",
      },
      {
        id: "action",
        type: "step",
        icon: Package,
        label: "Action",
        description: "Use an existing action",
        color: "green",
      },
      {
        id: "run",
        type: "step",
        icon: Terminal,
        label: "Run Script",
        description: "Execute shell commands",
        color: "green",
      },
      {
        id: "setup",
        type: "step",
        icon: Layers,
        label: "Setup",
        description: "Environment setup actions",
        color: "green",
      },
    ],
  },
  {
    title: "Advanced",
    items: [
      {
        id: "matrix",
        type: "job",
        icon: Code,
        label: "Matrix",
        description: "Matrix build strategy",
        color: "purple",
      },
      {
        id: "environment",
        type: "job",
        icon: Zap,
        label: "Environment",
        description: "Deployment environment",
        color: "purple",
      },
    ],
  },
];

export default function Sidebar({ selectedTool, onToolSelect }: SidebarProps) {
  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    item: ToolItem
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({
        type: item.type,
        id: item.id,
        label: item.label,
      })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-64 bg-white border-r overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Workflow Components
        </h2>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 text-xs">
            <GripVertical className="w-3 h-3" />
            <span>Drag components to canvas</span>
          </div>
        </div>

        <div className="space-y-6">
          {toolCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {category.title}
              </h3>

              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedTool === item.id;

                  return (
                    <button
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item as ToolItem)}
                      onClick={() => onToolSelect(isSelected ? null : item.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing ${
                        isSelected
                          ? "bg-primary-50 border-primary-200 text-primary-900"
                          : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-3 h-3 text-gray-400" />
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? "text-primary-600" : "text-gray-400"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
