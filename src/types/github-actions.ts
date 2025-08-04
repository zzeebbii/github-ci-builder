// GitHub Actions Workflow Types
export interface GitHubWorkflow {
  name?: string;
  on: WorkflowTriggers;
  env?: Record<string, string>;
  defaults?: {
    run?: {
      shell?: string;
      "working-directory"?: string;
    };
  };
  concurrency?:
    | string
    | {
        group: string;
        "cancel-in-progress"?: boolean;
      };
  jobs: Record<string, Job>;
}

export interface WorkflowTriggers {
  push?: PushTrigger | null;
  pull_request?: PullRequestTrigger | null;
  schedule?: ScheduleTrigger[];
  workflow_dispatch?: WorkflowDispatchTrigger;
  workflow_call?: WorkflowCallTrigger;
  [key: string]: any;
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

export interface Job {
  name?: string;
  "runs-on": string | string[];
  needs?: string | string[];
  if?: string;
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
    matrix?: Record<string, any>;
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
  services?: Record<string, any>;
  steps: Step[];
}

export interface Step {
  id?: string;
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, any>;
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

export interface NodeData {
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
