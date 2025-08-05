import { Octokit } from "@octokit/rest";
import type { GitHubRepository } from "../store/github";

export interface WorkflowFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string | null;
  git_url: string | null;
  download_url: string | null;
  type: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  node_id: string;
  head_branch: string;
  head_sha: string;
  path: string;
  display_title: string;
  run_number: number;
  event: string;
  status: string;
  conclusion: string | null;
  workflow_id: number;
  check_suite_id: number;
  check_suite_node_id: string;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  actor: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  run_attempt: number;
  referenced_workflows: unknown[];
  run_started_at: string;
  triggering_actor: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  jobs_url: string;
  logs_url: string;
  check_suite_url: string;
  artifacts_url: string;
  cancel_url: string;
  rerun_url: string;
  previous_attempt_url: string | null;
  workflow_url: string;
  head_commit: {
    id: string;
    tree_id: string;
    message: string;
    timestamp: string;
    author: {
      name: string;
      email: string;
    };
    committer: {
      name: string;
      email: string;
    };
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
  };
  head_repository: {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
  };
}

export interface WorkflowJob {
  id: number;
  run_id: number;
  workflow_name: string;
  head_branch: string;
  run_url: string;
  run_attempt: number;
  node_id: string;
  head_sha: string;
  url: string;
  html_url: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  started_at: string;
  completed_at: string | null;
  name: string;
  steps: Array<{
    name: string;
    status: string;
    conclusion: string | null;
    number: number;
    started_at: string | null;
    completed_at: string | null;
  }>;
  check_run_url: string;
  labels: string[];
  runner_id: number | null;
  runner_name: string | null;
  runner_group_id: number | null;
  runner_group_name: string | null;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  // Get user repositories
  async getRepositories(): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 50,
        page: 1,
      });

      return data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at || "",
      }));
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw error;
    }
  }

  // Get workflow files from a repository
  async getWorkflowFiles(owner: string, repo: string): Promise<WorkflowFile[]> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: ".github/workflows",
      });

      if (!Array.isArray(data)) {
        return [];
      }

      // Filter for YAML/YML files
      const workflowFiles = data.filter(
        file =>
          file.type === "file" &&
          (file.name.endsWith(".yml") || file.name.endsWith(".yaml"))
      );

      return workflowFiles;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404
      ) {
        // No workflows directory exists
        return [];
      }
      console.error("Error fetching workflow files:", error);
      throw error;
    }
  }

  // Get workflow file content
  async getWorkflowContent(
    owner: string,
    repo: string,
    path: string
  ): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if ("content" in data && data.content) {
        return Buffer.from(data.content, "base64").toString();
      }

      throw new Error("File content not found");
    } catch (error) {
      console.error("Error fetching workflow content:", error);
      throw error;
    }
  }

  // Create or update a workflow file
  async saveWorkflow(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<void> {
    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString("base64"),
        sha,
      });
    } catch (error) {
      console.error("Error saving workflow:", error);
      throw error;
    }
  }

  // Get workflow runs for a repository
  async getWorkflowRuns(owner: string, repo: string): Promise<WorkflowRun[]> {
    try {
      const { data } = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        per_page: 20,
      });

      return data.workflow_runs.map(run => ({
        ...run,
        name: run.name || "",
      })) as WorkflowRun[];
    } catch (error) {
      console.error("Error fetching workflow runs:", error);
      throw error;
    }
  }

  // Get workflow run details
  async getWorkflowRun(
    owner: string,
    repo: string,
    runId: number
  ): Promise<WorkflowRun> {
    try {
      const { data } = await this.octokit.rest.actions.getWorkflowRun({
        owner,
        repo,
        run_id: runId,
      });

      return {
        ...data,
        name: data.name || "",
      } as WorkflowRun;
    } catch (error) {
      console.error("Error fetching workflow run:", error);
      throw error;
    }
  }

  // Get workflow run jobs
  async getWorkflowRunJobs(
    owner: string,
    repo: string,
    runId: number
  ): Promise<WorkflowJob[]> {
    try {
      const { data } = await this.octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: runId,
      });

      return data.jobs as WorkflowJob[];
    } catch (error) {
      console.error("Error fetching workflow run jobs:", error);
      throw error;
    }
  }
}

// OAuth utilities
export const generateOAuthURL = (
  clientId: string,
  redirectUri: string,
  scopes: string[] = ["repo", "workflow"]
): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    state: generateRandomState(),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

export const generateRandomState = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const extractCodeFromURL = (url: string): string | null => {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get("code");
};
