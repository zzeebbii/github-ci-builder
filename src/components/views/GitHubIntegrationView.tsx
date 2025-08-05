import { useEffect, useState, useCallback } from "react";
import { Github, GitBranch, Clock, AlertCircle } from "lucide-react";
import { useGitHubStore } from "../../store/github";
import { GitHubService } from "../../utils/github-service";
import type { GitHubRepository } from "../../store/github";
import Button from "../ui/Button";

export function GitHubIntegrationView() {
  const { isAuthenticated, user, accessToken, error } = useGitHubStore();
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const loadRepositories = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      setLoadingRepos(true);
      const service = new GitHubService(accessToken);
      const repos = await service.getRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error("Failed to load repositories:", error);
    } finally {
      setLoadingRepos(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadRepositories();
    }
  }, [isAuthenticated, accessToken, loadRepositories]);

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect to GitHub
          </h2>
          <p className="text-gray-600 mb-6">
            Connect your GitHub account to import workflows, sync with
            repositories, and deploy your workflows directly to GitHub.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> To use GitHub integration, you need to set
              up a GitHub OAuth App with your client ID and secret in the
              environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* User Info */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar_url}
              alt={user?.login}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.name || user?.login}
              </h2>
              <p className="text-gray-600">@{user?.login}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Repositories */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Repositories
                </h3>
              </div>
              <Button onClick={loadRepositories} disabled={loadingRepos}>
                {loadingRepos ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="p-6">
            {loadingRepos ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading repositories...</p>
              </div>
            ) : repositories.length > 0 ? (
              <div className="grid gap-4">
                {repositories.slice(0, 10).map(repo => (
                  <div
                    key={repo.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-medium text-blue-600 hover:text-blue-800">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {repo.name}
                            </a>
                          </h4>
                          {repo.private && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {repo.full_name}
                        </p>
                        {repo.description && (
                          <p className="text-gray-500 text-sm mt-2">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Updated{" "}
                              {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span>Default: {repo.default_branch}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                          View Workflows
                        </Button>
                        <Button size="sm" variant="primary">
                          Import
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No repositories found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
