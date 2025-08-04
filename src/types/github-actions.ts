// GitHub Actions Workflow Types
export interface GitHubWorkflow {
  name?: string;
  "run-name"?: string;
  on: WorkflowTriggers;
  env?: Record<string, string>;
  defaults?: WorkflowDefaults;
  concurrency?: WorkflowConcurrency;
  permissions?: WorkflowPermissions;
  jobs: Record<string, Job>;
}

export interface WorkflowDefaults {
  run?: {
    shell?: ShellType;
    "working-directory"?: string;
  };
}

export interface WorkflowConcurrency {
  group: string;
  "cancel-in-progress"?: boolean;
}

export interface WorkflowPermissions {
  actions?: PermissionLevel;
  checks?: PermissionLevel;
  contents?: PermissionLevel;
  deployments?: PermissionLevel;
  "id-token"?: PermissionLevel;
  issues?: PermissionLevel;
  discussions?: PermissionLevel;
  packages?: PermissionLevel;
  pages?: PermissionLevel;
  "pull-requests"?: PermissionLevel;
  "repository-projects"?: PermissionLevel;
  "security-events"?: PermissionLevel;
  statuses?: PermissionLevel;
}

export type PermissionLevel = "read" | "write" | "none";
export type ShellType =
  | "bash"
  | "pwsh"
  | "python"
  | "sh"
  | "cmd"
  | "powershell";

export interface WorkflowTriggers {
  push?: PushTrigger | null;
  pull_request?: PullRequestTrigger | null;
  pull_request_target?: PullRequestTrigger | null;
  schedule?: ScheduleTrigger[];
  workflow_dispatch?: WorkflowDispatchTrigger;
  workflow_call?: WorkflowCallTrigger;
  workflow_run?: WorkflowRunTrigger;
  repository_dispatch?: RepositoryDispatchTrigger;
  release?: ReleaseTrigger;
  create?: CreateTrigger;
  delete?: DeleteTrigger;
  fork?: ForkTrigger;
  gollum?: GollumTrigger;
  issue_comment?: IssueCommentTrigger;
  issues?: IssuesTrigger;
  label?: LabelTrigger;
  milestone?: MilestoneTrigger;
  page_build?: PageBuildTrigger;
  project?: ProjectTrigger;
  project_card?: ProjectCardTrigger;
  project_column?: ProjectColumnTrigger;
  public?: PublicTrigger;
  registry_package?: RegistryPackageTrigger;
  status?: StatusTrigger;
  watch?: WatchTrigger;
  // Allow for additional webhook events not explicitly listed
  [key: string]:
    | PushTrigger
    | PullRequestTrigger
    | ScheduleTrigger[]
    | WorkflowDispatchTrigger
    | WorkflowCallTrigger
    | WorkflowRunTrigger
    | RepositoryDispatchTrigger
    | ReleaseTrigger
    | CreateTrigger
    | DeleteTrigger
    | ForkTrigger
    | GollumTrigger
    | IssueCommentTrigger
    | IssuesTrigger
    | LabelTrigger
    | MilestoneTrigger
    | PageBuildTrigger
    | ProjectTrigger
    | ProjectCardTrigger
    | ProjectColumnTrigger
    | PublicTrigger
    | RegistryPackageTrigger
    | StatusTrigger
    | WatchTrigger
    | null
    | undefined;
}

export interface PushTrigger {
  branches?: string[];
  "branches-ignore"?: string[];
  tags?: string[];
  "tags-ignore"?: string[];
  paths?: string[];
  "paths-ignore"?: string[];
}

export interface PullRequestTrigger {
  types?: (
    | "opened"
    | "edited"
    | "closed"
    | "reopened"
    | "synchronize"
    | "ready_for_review"
  )[];
  branches?: string[];
  "branches-ignore"?: string[];
  paths?: string[];
  "paths-ignore"?: string[];
}

export interface ScheduleTrigger {
  cron: string;
}

export interface WorkflowDispatchTrigger {
  inputs?: Record<string, WorkflowInput>;
}

export interface WorkflowCallTrigger {
  inputs?: Record<string, WorkflowInput>;
  outputs?: Record<string, WorkflowOutput>;
  secrets?: Record<string, WorkflowSecret>;
}

export interface WorkflowInput {
  description?: string;
  required?: boolean;
  default?: string;
  type?: "boolean" | "choice" | "environment" | "number" | "string";
  options?: string[];
}

export interface WorkflowOutput {
  description?: string;
  value: string;
}

export interface WorkflowSecret {
  description?: string;
  required?: boolean;
}

// Additional Trigger Types
export interface WorkflowRunTrigger {
  workflows?: string[];
  types?: ("completed" | "requested")[];
  branches?: string[];
  "branches-ignore"?: string[];
}

export interface RepositoryDispatchTrigger {
  types?: string[];
}

export interface ReleaseTrigger {
  types?: (
    | "published"
    | "unpublished"
    | "created"
    | "edited"
    | "deleted"
    | "prereleased"
    | "released"
  )[];
}

export interface CreateTrigger {
  branches?: string[];
  tags?: string[];
}

export interface DeleteTrigger {
  branches?: string[];
  tags?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ForkTrigger {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GollumTrigger {}

export interface IssueCommentTrigger {
  types?: ("created" | "edited" | "deleted")[];
}

export interface IssuesTrigger {
  types?: (
    | "opened"
    | "edited"
    | "deleted"
    | "transferred"
    | "pinned"
    | "unpinned"
    | "closed"
    | "reopened"
    | "assigned"
    | "unassigned"
    | "labeled"
    | "unlabeled"
    | "locked"
    | "unlocked"
    | "milestoned"
    | "demilestoned"
  )[];
}

export interface LabelTrigger {
  types?: ("created" | "edited" | "deleted")[];
}

export interface MilestoneTrigger {
  types?: ("created" | "closed" | "opened" | "edited" | "deleted")[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PageBuildTrigger {}

export interface ProjectTrigger {
  types?: (
    | "created"
    | "updated"
    | "closed"
    | "reopened"
    | "edited"
    | "deleted"
  )[];
}

export interface ProjectCardTrigger {
  types?: ("created" | "moved" | "converted" | "edited" | "deleted")[];
}

export interface ProjectColumnTrigger {
  types?: ("created" | "updated" | "moved" | "deleted")[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PublicTrigger {}

export interface RegistryPackageTrigger {
  types?: ("published" | "updated")[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StatusTrigger {}

export interface WatchTrigger {
  types?: "started"[];
}

// Matrix and Container Types
export interface MatrixStrategy {
  include?: MatrixInclude[];
  exclude?: MatrixExclude[];
  [key: string]:
    | string[]
    | number[]
    | boolean[]
    | MatrixInclude[]
    | MatrixExclude[]
    | undefined;
}

export interface MatrixInclude {
  [key: string]: string | number | boolean;
}

export interface MatrixExclude {
  [key: string]: string | number | boolean;
}

export interface ServiceContainer {
  image: string;
  credentials?: {
    username: string;
    password: string;
  };
  env?: Record<string, string>;
  ports?: (number | string)[];
  volumes?: string[];
  options?: string;
}

export interface StepInputs {
  [key: string]: string | number | boolean;
}

export interface Job {
  name?: string;
  "runs-on": string | string[];
  needs?: string | string[];
  if?: string;
  permissions?: WorkflowPermissions;
  environment?:
    | string
    | {
        name: string;
        url?: string;
      };
  concurrency?:
    | string
    | {
        group: string;
        "cancel-in-progress"?: boolean;
      };
  outputs?: Record<string, string>;
  env?: Record<string, string>;
  defaults?: {
    run?: {
      shell?: string;
      "working-directory"?: string;
    };
  };
  "timeout-minutes"?: number;
  strategy?: {
    matrix?: MatrixStrategy;
    "fail-fast"?: boolean;
    "max-parallel"?: number;
  };
  "continue-on-error"?: boolean;
  container?:
    | string
    | {
        image: string;
        credentials?: {
          username: string;
          password: string;
        };
        env?: Record<string, string>;
        ports?: number[];
        volumes?: string[];
        options?: string;
      };
  services?: Record<string, ServiceContainer>;
  steps: Step[];
}

export interface Step {
  id?: string;
  name?: string;
  uses?: string;
  run?: string;
  with?: StepInputs;
  env?: Record<string, string>;
  if?: string;
  "continue-on-error"?: boolean;
  "timeout-minutes"?: number;
  shell?: string;
  "working-directory"?: string;
}

// Visual Builder Types
export interface VisualNode {
  id: string;
  type: "job" | "step" | "trigger";
  position: { x: number; y: number };
  data: NodeData;
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  job?: Job;
  step?: Step;
  trigger?: WorkflowTriggers;
  isValid?: boolean;
  errors?: string[];
}

export interface VisualEdge {
  id: string;
  source: string;
  target: string;
  type?: "dependency" | "flow";
  animated?: boolean;
}

export interface WorkflowStore {
  workflow: GitHubWorkflow;
  nodes: VisualNode[];
  edges: VisualEdge[];
  selectedNode: string | null;
  isValid: boolean;
  errors: string[];
}

// GitHub Actions Schema Utilities and Constants
export const GITHUB_HOSTED_RUNNERS = [
  "ubuntu-latest",
  "ubuntu-22.04",
  "ubuntu-20.04",
  "windows-latest",
  "windows-2022",
  "windows-2019",
  "macos-latest",
  "macos-14",
  "macos-13",
  "macos-12",
] as const;

export const COMMON_SHELLS: ShellType[] = [
  "bash",
  "pwsh",
  "python",
  "sh",
  "cmd",
  "powershell",
];

export const WORKFLOW_EVENT_TRIGGERS = [
  "push",
  "pull_request",
  "pull_request_target",
  "schedule",
  "workflow_dispatch",
  "workflow_call",
  "workflow_run",
  "repository_dispatch",
  "release",
  "create",
  "delete",
  "fork",
  "gollum",
  "issue_comment",
  "issues",
  "label",
  "milestone",
  "page_build",
  "project",
  "project_card",
  "project_column",
  "public",
  "registry_package",
  "status",
  "watch",
] as const;

export type WorkflowEventTrigger = (typeof WORKFLOW_EVENT_TRIGGERS)[number];

// Popular GitHub Actions
export interface PopularAction {
  uses: string;
  name: string;
  description: string;
  category: ActionCategory;
  inputs?: Record<string, ActionInput>;
  outputs?: Record<string, ActionOutput>;
}

export interface ActionInput {
  description: string;
  required?: boolean;
  default?: string;
  type?: "string" | "number" | "boolean" | "choice";
  options?: string[];
}

export interface ActionOutput {
  description: string;
}

export type ActionCategory =
  | "deployment"
  | "testing"
  | "code-quality"
  | "security"
  | "utility"
  | "notification"
  | "ci-cd"
  | "package-management";

export const POPULAR_ACTIONS: PopularAction[] = [
  {
    uses: "actions/checkout@v4",
    name: "Checkout",
    description: "Check out your repository under $GITHUB_WORKSPACE",
    category: "utility",
    inputs: {
      repository: { description: "Repository name", required: false },
      ref: {
        description: "The branch, tag or SHA to checkout",
        required: false,
      },
      token: { description: "Personal access token", required: false },
      path: {
        description: "Relative path under $GITHUB_WORKSPACE",
        required: false,
      },
      clean: {
        description: "Whether to execute git clean -ffdx",
        required: false,
        type: "boolean",
      },
      "fetch-depth": {
        description: "Number of commits to fetch",
        required: false,
        type: "number",
        default: "1",
      },
    },
  },
  {
    uses: "actions/setup-node@v4",
    name: "Setup Node.js",
    description: "Set up a specific version of Node.js",
    category: "utility",
    inputs: {
      "node-version": {
        description: "Version Spec of the version to use",
        required: false,
      },
      "node-version-file": {
        description: "File containing the version Spec",
        required: false,
      },
      cache: {
        description: "Used to specify a package manager for caching",
        required: false,
        type: "choice",
        options: ["npm", "yarn", "pnpm"],
      },
      "cache-dependency-path": {
        description: "Used to specify the path to a dependency file",
        required: false,
      },
    },
    outputs: {
      "cache-hit": {
        description: "A boolean value to indicate if a cache was hit",
      },
      "node-version": { description: "The installed node version" },
    },
  },
  {
    uses: "actions/setup-python@v5",
    name: "Setup Python",
    description: "Set up a specific version of Python",
    category: "utility",
    inputs: {
      "python-version": {
        description: "Version range or exact version of Python",
        required: false,
      },
      "python-version-file": {
        description: "File containing the Python version",
        required: false,
      },
      cache: {
        description: "Used to specify a package manager for caching",
        required: false,
        type: "choice",
        options: ["pip", "pipenv", "poetry"],
      },
      architecture: {
        description: "The target architecture (x86, x64)",
        required: false,
        type: "choice",
        options: ["x86", "x64"],
      },
    },
    outputs: {
      "python-version": { description: "The installed python version" },
      "cache-hit": {
        description: "A boolean value to indicate if a cache was hit",
      },
      "python-path": {
        description: "The absolute path to the Python executable",
      },
    },
  },
  {
    uses: "actions/upload-artifact@v4",
    name: "Upload Artifact",
    description: "Upload artifacts from your workflow",
    category: "utility",
    inputs: {
      name: { description: "Artifact name", required: true },
      path: {
        description: "A file, directory or wildcard pattern",
        required: true,
      },
      "if-no-files-found": {
        description: "Behavior if no files are found",
        required: false,
        type: "choice",
        options: ["warn", "error", "ignore"],
        default: "warn",
      },
      "retention-days": {
        description: "Duration after which artifact will expire",
        required: false,
        type: "number",
      },
    },
    outputs: {
      "artifact-id": { description: "GitHub ID of an Artifact" },
      "artifact-url": { description: "URL to download an Artifact" },
    },
  },
  {
    uses: "actions/download-artifact@v4",
    name: "Download Artifact",
    description: "Download artifacts from your build",
    category: "utility",
    inputs: {
      name: {
        description: "Name of the artifact to download",
        required: false,
      },
      path: { description: "Destination path", required: false },
      pattern: {
        description: "A glob pattern to match artifacts",
        required: false,
      },
      "merge-multiple": {
        description: "When multiple artifacts are matched",
        required: false,
        type: "boolean",
        default: "false",
      },
    },
    outputs: {
      "download-path": {
        description: "Absolute path where the artifacts were downloaded",
      },
    },
  },
];

// Validation Utilities
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
}

// GitHub Actions YAML to Visual Node Mapping
export interface WorkflowMapping {
  yamlToVisual: (workflow: GitHubWorkflow) => {
    nodes: VisualNode[];
    edges: VisualEdge[];
  };
  visualToYaml: (nodes: VisualNode[], edges: VisualEdge[]) => GitHubWorkflow;
}

// Node Templates for Common Patterns
export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: NodeTemplateCategory;
  template: Partial<Job> | Partial<Step>;
  icon?: string;
}

export type NodeTemplateCategory =
  | "ci-cd"
  | "testing"
  | "deployment"
  | "code-quality"
  | "security"
  | "notification"
  | "utility";

export const JOB_TEMPLATES: NodeTemplate[] = [
  {
    id: "basic-ci",
    name: "Basic CI Job",
    description: "A simple CI job with checkout and test",
    category: "ci-cd",
    template: {
      name: "CI",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Run tests",
          run: "npm test",
        },
      ],
    },
  },
  {
    id: "node-ci",
    name: "Node.js CI Job",
    description: "Complete Node.js CI with setup, install, and test",
    category: "ci-cd",
    template: {
      name: "Node.js CI",
      "runs-on": "ubuntu-latest",
      strategy: {
        matrix: {
          "node-version": ["18.x", "20.x", "22.x"],
        },
      },
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "${{ matrix.node-version }}",
            cache: "npm",
          },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Run tests",
          run: "npm test",
        },
      ],
    },
  },
  {
    id: "deploy-job",
    name: "Deployment Job",
    description: "Basic deployment job template",
    category: "deployment",
    template: {
      name: "Deploy",
      "runs-on": "ubuntu-latest",
      needs: ["test"],
      if: "github.ref == 'refs/heads/main'",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Deploy to production",
          run: "echo 'Deploy to production'",
        },
      ],
    },
  },
];

// Step Templates
export const STEP_TEMPLATES: NodeTemplate[] = [
  {
    id: "checkout",
    name: "Checkout Code",
    description: "Check out the repository code",
    category: "utility",
    template: {
      name: "Checkout code",
      uses: "actions/checkout@v4",
    },
  },
  {
    id: "setup-node",
    name: "Setup Node.js",
    description: "Set up Node.js environment",
    category: "utility",
    template: {
      name: "Setup Node.js",
      uses: "actions/setup-node@v4",
      with: {
        "node-version": "20.x",
        cache: "npm",
      },
    },
  },
  {
    id: "run-tests",
    name: "Run Tests",
    description: "Execute test suite",
    category: "testing",
    template: {
      name: "Run tests",
      run: "npm test",
    },
  },
  {
    id: "build",
    name: "Build Project",
    description: "Build the project",
    category: "ci-cd",
    template: {
      name: "Build project",
      run: "npm run build",
    },
  },
  {
    id: "lint",
    name: "Lint Code",
    description: "Run linting checks",
    category: "code-quality",
    template: {
      name: "Lint code",
      run: "npm run lint",
    },
  },
];
