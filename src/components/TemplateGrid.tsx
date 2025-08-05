import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { useWorkflowStore } from "../store/workflow";
import { WORKFLOW_TEMPLATES, type WorkflowTemplate } from "../data/default-workflows";
import Button from "./ui/Button";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

interface TemplateCardProps {
  template: WorkflowTemplate;
  onPreview: (template: WorkflowTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview }) => {
  const { setWorkflow, addToast } = useWorkflowStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleUseTemplate = async () => {
    setIsLoading(true);
    
    try {
      setWorkflow(template.workflow);
      addToast(`Template "${template.name}" loaded successfully!`, "success");
      
      // Navigate to builder page after a short delay to show the toast
      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      addToast(`Failed to load template: ${error}`, "error");
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    onPreview(template);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Frontend":
        return "bg-blue-100 text-blue-800";
      case "Backend":
        return "bg-purple-100 text-purple-800";
      case "DevOps":
        return "bg-orange-100 text-orange-800";
      case "Full Stack":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
            template.difficulty,
          )}`}
        >
          {template.difficulty}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
            template.category,
          )}`}
        >
          {template.category}
        </span>
        {template.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
          >
            {tag}
          </span>
        ))}
        {template.tags.length > 2 && (
          <span className="text-xs text-gray-500">+{template.tags.length - 2} more</span>
        )}
      </div>

      <div className="flex justify-between items-center gap-2">
        <div className="text-sm text-gray-500">
          {Object.keys(template.workflow.jobs).length} job
          {Object.keys(template.workflow.jobs).length !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePreview} size="sm" variant="ghost" disabled={isLoading}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button onClick={handleUseTemplate} size="sm" disabled={isLoading}>
            {isLoading ? "Loading..." : "Use Template"}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TemplateGridProps {
  searchQuery?: string;
  selectedCategory?: string;
  selectedDifficulty?: string;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  searchQuery = "",
  selectedCategory = "",
  selectedDifficulty = "",
}) => {
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { setWorkflow, addToast } = useWorkflowStore();
  const navigate = useNavigate();
  const templates = Object.values(WORKFLOW_TEMPLATES);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "" || template.category === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === "" || template.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handlePreview = (template: WorkflowTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewTemplate(null);
  };

  const handleUseTemplate = (template: WorkflowTemplate) => {
    setWorkflow(template.workflow);
    addToast(`Template "${template.name}" loaded successfully!`, "success");
    
    // Navigate to builder page after a short delay to show the toast
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} onPreview={handlePreview} />
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-2">No templates found</div>
            <p className="text-sm text-gray-500">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>

      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onUseTemplate={handleUseTemplate}
      />
    </>
  );
};
