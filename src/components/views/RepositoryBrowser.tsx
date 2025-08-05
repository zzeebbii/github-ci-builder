import { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  FileText,
  Download,
  Eye,
  Calendar,
  Lock,
  Globe,
  Folder,
  PlayCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGitHubStore } from "../../store/github";
import { useWorkflowStore } from "../../store/workflow";
import { GitHubService } from "../../utils/github-service";
import type { GitHubRepository } from "../../store/github";
import type { WorkflowFile } from "../../utils/github-service";
import type { GitHubWorkflow } from "../../types/github-actions";
import Button from "../ui/Button";
import { load as parseYaml } from "js-yaml";

interface RepositoryWithWorkflows extends GitHubRepository {
  workflows?: WorkflowFile[];
  workflowCount?: number;
  isLoadingWorkflows?: boolean;
}

export function RepositoryBrowser() {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useGitHubStore();
  const { setWorkflow, addToast } = useWorkflowStore();

  const [repositories, setRepositories] = useState<RepositoryWithWorkflows[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] =
    useState<RepositoryWithWorkflows | null>(null);
  const [workflowPreview, setWorkflowPreview] = useState<{
    content: string;
    filename: string;
    repo: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "all" | "with-workflows" | "without-workflows"
  >("all");

  const loadRepositories = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      setLoading(true);
      const service = new GitHubService(accessToken);
      const repos = await service.getRepositories();
      setRepositories(repos.map(repo => ({ ...repo, workflowCount: 0 })));
    } catch (error) {
      console.error("Failed to load repositories:", error);
      addToast("Failed to load repositories", "error");
    } finally {
      setLoading(false);
    }
  }, [accessToken, addToast]);

  const loadWorkflowsForRepo = useCallback(
    async (repo: RepositoryWithWorkflows) => {
      if (!accessToken) {
        return;
      }

      try {
        setRepositories(prev =>
          prev.map(r =>
            r.id === repo.id ? { ...r, isLoadingWorkflows: true } : r
          )
        );

        const service = new GitHubService(accessToken);
        const [owner, repoName] = repo.full_name.split("/");
        const workflows = await service.getWorkflowFiles(owner, repoName);

        setRepositories(prev =>
          prev.map(r =>
            r.id === repo.id
              ? {
                  ...r,
                  workflows,
                  workflowCount: workflows.length,
                  isLoadingWorkflows: false,
                }
              : r
          )
        );
      } catch (error) {
        console.error("Failed to load workflows:", error);
        setRepositories(prev =>
          prev.map(r =>
            r.id === repo.id ? { ...r, isLoadingWorkflows: false } : r
          )
        );
        addToast(`Failed to load workflows for ${repo.name}`, "error");
      }
    },
    [accessToken, addToast]
  );

  const previewWorkflow = async (
    repo: RepositoryWithWorkflows,
    workflow: WorkflowFile
  ) => {
    if (!accessToken) {
      return;
    }

    try {
      const service = new GitHubService(accessToken);
      const [owner, repoName] = repo.full_name.split("/");
      const content = await service.getWorkflowContent(
        owner,
        repoName,
        workflow.path
      );

      setWorkflowPreview({
        content,
        filename: workflow.name,
        repo: repo.full_name,
      });
    } catch (error) {
      console.error("Failed to preview workflow:", error);
      addToast(`Failed to preview ${workflow.name}`, "error");
    }
  };

  const importWorkflow = async (
    repo: RepositoryWithWorkflows,
    workflow: WorkflowFile
  ) => {
    if (!accessToken) {
      return;
    }

    try {
      const service = new GitHubService(accessToken);
      const [owner, repoName] = repo.full_name.split("/");
      const yamlContent = await service.getWorkflowContent(
        owner,
        repoName,
        workflow.path
      );

      // Parse and validate the YAML
      const workflowData = parseYaml(yamlContent) as GitHubWorkflow;

      // Load into the workflow store
      setWorkflow({
        name: workflow.name.replace(/\.(yml|yaml)$/, ""),
        on: workflowData.on || {},
        jobs: workflowData.jobs || {},
        env: workflowData.env || {},
        permissions: workflowData.permissions || {},
        "run-name": workflowData["run-name"] || "",
      });

      addToast(`Imported ${workflow.name} successfully!`, "success");

      // Navigate to builder
      navigate("/builder");
    } catch (error) {
      console.error("Failed to import workflow:", error);
      addToast(
        `Failed to import ${workflow.name}. Please check the workflow format.`,
        "error"
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadRepositories();
    }
  }, [isAuthenticated, accessToken, loadRepositories]);

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description &&
        repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filter === "with-workflows") {
      return matchesSearch && (repo.workflowCount || 0) > 0;
    }
    if (filter === "without-workflows") {
      return matchesSearch && (repo.workflowCount || 0) === 0;
    }
    return matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect to GitHub
          </h2>
          <p className="text-gray-600">
            Connect your GitHub account to browse repositories and import
            workflows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Repository Browser
            </h1>
            <p className="text-gray-600">
              Browse your repositories and import workflows
            </p>
          </div>
          <Button onClick={loadRepositories} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Repositories</option>
            <option value="with-workflows">With Workflows</option>
            <option value="without-workflows">Without Workflows</option>
          </select>
        </div>

        {/* Repository Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading repositories...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRepositories.map(repo => (
              <RepositoryCard
                key={repo.id}
                repo={repo}
                onLoadWorkflows={loadWorkflowsForRepo}
                onPreviewWorkflow={previewWorkflow}
                onImportWorkflow={importWorkflow}
                isExpanded={selectedRepo?.id === repo.id}
                onToggleExpanded={() =>
                  setSelectedRepo(selectedRepo?.id === repo.id ? null : repo)
                }
              />
            ))}
          </div>
        )}

        {filteredRepositories.length === 0 && !loading && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No repositories found</p>
          </div>
        )}

        {/* Workflow Preview Modal */}
        {workflowPreview && (
          <WorkflowPreviewModal
            workflow={workflowPreview}
            onClose={() => setWorkflowPreview(null)}
          />
        )}
      </div>
    </div>
  );
}

interface RepositoryCardProps {
  repo: RepositoryWithWorkflows;
  onLoadWorkflows: (repo: RepositoryWithWorkflows) => void;
  onPreviewWorkflow: (
    repo: RepositoryWithWorkflows,
    workflow: WorkflowFile
  ) => void;
  onImportWorkflow: (
    repo: RepositoryWithWorkflows,
    workflow: WorkflowFile
  ) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

function RepositoryCard({
  repo,
  onLoadWorkflows,
  onPreviewWorkflow,
  onImportWorkflow,
  isExpanded,
  onToggleExpanded,
}: RepositoryCardProps) {
  const handleLoadWorkflows = () => {
    if (!repo.workflows) {
      onLoadWorkflows(repo);
    }
    onToggleExpanded();
  };

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Repository Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-800">
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                {repo.name}
              </a>
            </h3>
            {repo.private ? (
              <Lock className="w-4 h-4 text-gray-400" />
            ) : (
              <Globe className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{repo.full_name}</p>
          {repo.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {repo.description}
            </p>
          )}
        </div>
      </div>

      {/* Repository Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
        <span>•</span>
        <span>{repo.default_branch}</span>
      </div>

      {/* Workflow Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {repo.workflowCount !== undefined
              ? `${repo.workflowCount} workflow${repo.workflowCount !== 1 ? "s" : ""}`
              : "Click to load workflows"}
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleLoadWorkflows}
          disabled={repo.isLoadingWorkflows}
        >
          {repo.isLoadingWorkflows ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : isExpanded ? (
            "Hide"
          ) : (
            "View Workflows"
          )}
        </Button>
      </div>

      {/* Expanded Workflow List */}
      {isExpanded && repo.workflows && (
        <div className="mt-4 pt-4 border-t">
          {repo.workflows.length > 0 ? (
            <div className="space-y-2">
              {repo.workflows.map(workflow => (
                <div
                  key={workflow.path}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{workflow.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onPreviewWorkflow(repo, workflow)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onImportWorkflow(repo, workflow)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No workflows found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface WorkflowPreviewModalProps {
  workflow: {
    content: string;
    filename: string;
    repo: string;
  };
  onClose: () => void;
}

function WorkflowPreviewModal({
  workflow,
  onClose,
}: WorkflowPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">{workflow.filename}</h3>
            <p className="text-sm text-gray-600">{workflow.repo}</p>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
            <code>{workflow.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
