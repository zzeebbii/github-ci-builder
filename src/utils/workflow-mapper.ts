import type {
  GitHubWorkflow,
  VisualNode,
  VisualEdge,
  Job,
  Step,
} from "../types/github-actions";

/**
 * Utility class for mapping between GitHub Actions YAML and visual representation
 */
export class WorkflowMapper {
  /**
   * Convert a GitHub Actions workflow to visual nodes and edges
   */
  static yamlToVisual(workflow: GitHubWorkflow): {
    nodes: VisualNode[];
    edges: VisualEdge[];
  } {
    const nodes: VisualNode[] = [];
    const edges: VisualEdge[] = [];

    let nodeIndex = 0;
    const getPosition = () => ({
      x: 100 + (nodeIndex % 4) * 250,
      y: 100 + Math.floor(nodeIndex / 4) * 200,
    });

    // Create trigger node
    const triggerNode: VisualNode = {
      id: "trigger",
      type: "trigger",
      position: getPosition(),
      data: {
        label: this.getTriggerLabel(workflow.on),
        triggerType: this.getPrimaryTriggerType(workflow.on),
        triggers: workflow.on, // Pass the full triggers object
        trigger: workflow.on, // Keep for backward compatibility
        isValid: true,
        errors: [],
      },
    };
    nodes.push(triggerNode);
    nodeIndex++;

    // Create job nodes and their dependencies
    const jobIds = Object.keys(workflow.jobs);
    const jobNodeMap = new Map<string, string>(); // jobId -> nodeId

    jobIds.forEach((jobId) => {
      const job = workflow.jobs[jobId];
      const nodeId = `job-${jobId}`;
      jobNodeMap.set(jobId, nodeId);

      const jobNode: VisualNode = {
        id: nodeId,
        type: "job",
        position: getPosition(),
        data: {
          label: job.name || jobId,
          job,
          isValid: true,
          errors: [],
        },
      };
      nodes.push(jobNode);
      nodeIndex++;

      // Create step nodes for this job
      job.steps.forEach((step, stepIndex) => {
        const stepNodeId = `${nodeId}-step-${stepIndex}`;
        const stepNode: VisualNode = {
          id: stepNodeId,
          type: "step",
          position: getPosition(),
          data: {
            label:
              step.name ||
              step.uses ||
              step.run?.substring(0, 30) + "..." ||
              `Step ${stepIndex + 1}`,
            step,
            isValid: true,
            errors: [],
          },
        };
        nodes.push(stepNode);
        nodeIndex++;

        // Connect job to its first step, or previous step to current step
        const sourceId =
          stepIndex === 0 ? nodeId : `${nodeId}-step-${stepIndex - 1}`;
        edges.push({
          id: `${sourceId}-${stepNodeId}`,
          source: sourceId,
          target: stepNodeId,
          type: "flow",
          animated: true,
        });
      });
    });

    // Create job dependency edges
    jobIds.forEach((jobId) => {
      const job = workflow.jobs[jobId];
      const targetNodeId = jobNodeMap.get(jobId)!;

      if (job.needs) {
        const dependencies = Array.isArray(job.needs) ? job.needs : [job.needs];
        dependencies.forEach((dependency) => {
          const sourceNodeId = jobNodeMap.get(dependency);
          if (sourceNodeId) {
            edges.push({
              id: `${sourceNodeId}-${targetNodeId}`,
              source: sourceNodeId,
              target: targetNodeId,
              type: "dependency",
              animated: false,
            });
          }
        });
      } else {
        // Connect trigger to jobs without dependencies
        edges.push({
          id: `trigger-${targetNodeId}`,
          source: "trigger",
          target: targetNodeId,
          type: "flow",
          animated: true,
        });
      }
    });

    return { nodes, edges };
  }

  /**
   * Convert visual nodes and edges back to GitHub Actions workflow
   */
  static visualToYaml(
    nodes: VisualNode[],
    edges: VisualEdge[]
  ): GitHubWorkflow {
    const triggerNode = nodes.find((node) => node.type === "trigger");
    const jobNodes = nodes.filter((node) => node.type === "job");
    const stepNodes = nodes.filter((node) => node.type === "step");

    // Build workflow structure
    const workflow: GitHubWorkflow = {
      name: "Generated Workflow",
      on: triggerNode?.data.trigger || { push: { branches: ["main"] } },
      jobs: {},
    };

    // Process job nodes
    jobNodes.forEach((jobNode) => {
      const jobId = jobNode.id.replace("job-", "");

      // Find steps for this job
      const jobSteps = stepNodes
        .filter((stepNode) => stepNode.id.startsWith(`${jobNode.id}-step-`))
        .sort((a, b) => {
          const aIndex = parseInt(a.id.split("-step-")[1]);
          const bIndex = parseInt(b.id.split("-step-")[1]);
          return aIndex - bIndex;
        })
        .map((stepNode) => stepNode.data.step!)
        .filter(Boolean);

      // Find job dependencies
      const dependencyEdges = edges.filter(
        (edge) => edge.target === jobNode.id && edge.source !== "trigger"
      );
      const needs = dependencyEdges
        .map((edge) => edge.source.replace("job-", ""))
        .filter((sourceJobId) => sourceJobId !== jobId);

      // Build job object from node data or fallback to nested job object
      const existingJobData =
        (jobNode.data.job as unknown as Record<string, unknown>) || {};
      const jobData = {
        ...existingJobData, // Include any other existing properties first
        // Override with current node data values
        name: jobNode.data.label as string,
        "runs-on": (jobNode.data.runsOn as string) || "ubuntu-latest",
        steps: (existingJobData.steps as Step[]) || [
          {
            name: "Checkout code",
            uses: "actions/checkout@v4",
          },
        ],
      };

      // Add optional properties if they exist
      const jobConfig: Record<string, unknown> = { ...jobData };

      if (jobNode.data.timeoutMinutes) {
        jobConfig["timeout-minutes"] = jobNode.data.timeoutMinutes as number;
      }

      if (jobNode.data.strategy) {
        jobConfig.strategy = jobNode.data.strategy as string;
      }

      if (jobNode.data.environment) {
        jobConfig.environment = jobNode.data.environment as string;
      }

      if (jobNode.data.permissions) {
        jobConfig.permissions = jobNode.data.permissions as string;
      }

      workflow.jobs[jobId] = {
        name: jobConfig.name as string,
        "runs-on": jobConfig["runs-on"] as string,
        ...jobConfig,
        steps: jobSteps.length > 0 ? jobSteps : (jobConfig.steps as Step[]),
        ...(needs.length > 0 && {
          needs: needs.length === 1 ? needs[0] : needs,
        }),
      } as Job;
    });

    return workflow;
  }

  /**
   * Get a human-readable label for workflow triggers
   */
  private static getTriggerLabel(triggers: GitHubWorkflow["on"]): string {
    const triggerKeys = Object.keys(triggers);

    if (triggerKeys.length === 1) {
      const key = triggerKeys[0];
      switch (key) {
        case "push":
          return "On Push";
        case "pull_request":
          return "On Pull Request";
        case "schedule":
          return "On Schedule";
        case "workflow_dispatch":
          return "Manual Trigger";
        case "workflow_call":
          return "Reusable Workflow";
        default:
          return `On ${key.replace(/_/g, " ")}`;
      }
    }

    if (triggerKeys.length <= 3) {
      return `On ${triggerKeys.map((k) => k.replace(/_/g, " ")).join(", ")}`;
    }

    return `Multiple Triggers (${triggerKeys.length})`;
  }

  /**
   * Get the primary trigger type for visual representation
   */
  private static getPrimaryTriggerType(triggers: GitHubWorkflow["on"]): string {
    // Priority order for trigger types
    const priorityOrder = [
      "push",
      "pull_request",
      "workflow_dispatch",
      "schedule",
    ];

    for (const triggerType of priorityOrder) {
      if (triggers[triggerType as keyof typeof triggers]) {
        return triggerType;
      }
    }

    // If none of the priority triggers are found, return the first available
    const triggerKeys = Object.keys(triggers);
    return triggerKeys.length > 0 ? triggerKeys[0] : "workflow_dispatch";
  }

  /**
   * Generate a default workflow structure
   */
  static createDefaultWorkflow(): GitHubWorkflow {
    return {
      name: "CI",
      on: {
        push: {
          branches: ["main"],
        },
        pull_request: {
          branches: ["main"],
        },
      },
      jobs: {
        build: {
          name: "Build and Test",
          "runs-on": "ubuntu-latest",
          steps: [
            {
              name: "Checkout code",
              uses: "actions/checkout@v4",
            },
            {
              name: "Setup Node.js",
              uses: "actions/setup-node@v4",
              with: {
                "node-version": "20.x",
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
    };
  }

  /**
   * Generate visual nodes from job templates
   */
  static createJobNodeFromTemplate(
    _templateId: string,
    position: { x: number; y: number }
  ): VisualNode | null {
    // This would integrate with the JOB_TEMPLATES from github-actions.ts
    // For now, return a basic job node
    return {
      id: `job-${Date.now()}`,
      type: "job",
      position,
      data: {
        label: "New Job",
        job: {
          name: "New Job",
          "runs-on": "ubuntu-latest",
          steps: [
            {
              name: "Checkout code",
              uses: "actions/checkout@v4",
            },
          ],
        },
        isValid: true,
        errors: [],
      },
    };
  }

  /**
   * Generate visual nodes from step templates
   */
  static createStepNodeFromTemplate(
    _templateId: string,
    position: { x: number; y: number }
  ): VisualNode | null {
    // This would integrate with the STEP_TEMPLATES from github-actions.ts
    // For now, return a basic step node
    return {
      id: `step-${Date.now()}`,
      type: "step",
      position,
      data: {
        label: "New Step",
        step: {
          name: "New Step",
          run: "echo 'Hello World'",
        },
        isValid: true,
        errors: [],
      },
    };
  }

  /**
   * Validate and update node positions to avoid overlaps
   */
  static optimizeNodeLayout(nodes: VisualNode[]): VisualNode[] {
    const nodeSpacing = { x: 250, y: 200 };
    const startPosition = { x: 100, y: 100 };

    const optimizedNodes = [...nodes];
    const jobNodes = optimizedNodes.filter((n) => n.type === "job");
    const stepNodes = optimizedNodes.filter((n) => n.type === "step");
    const triggerNodes = optimizedNodes.filter((n) => n.type === "trigger");

    // Position trigger nodes at the top
    triggerNodes.forEach((node, index) => {
      node.position = {
        x: startPosition.x + index * nodeSpacing.x,
        y: startPosition.y,
      };
    });

    // Position job nodes in rows
    jobNodes.forEach((node, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      node.position = {
        x: startPosition.x + col * nodeSpacing.x,
        y: startPosition.y + (row + 1) * nodeSpacing.y,
      };
    });

    // Position step nodes below their parent jobs
    stepNodes.forEach((stepNode) => {
      const jobId = stepNode.id.split("-step-")[0];
      const stepIndex = parseInt(stepNode.id.split("-step-")[1]);
      const parentJob = jobNodes.find((job) => job.id === jobId);

      if (parentJob) {
        stepNode.position = {
          x: parentJob.position.x + (stepIndex % 2) * (nodeSpacing.x / 2),
          y:
            parentJob.position.y +
            nodeSpacing.y +
            Math.floor(stepIndex / 2) * (nodeSpacing.y / 2),
        };
      }
    });

    return optimizedNodes;
  }
}

/**
 * Helper function to quickly convert YAML to visual
 */
export function workflowToVisual(workflow: GitHubWorkflow) {
  return WorkflowMapper.yamlToVisual(workflow);
}

/**
 * Helper function to quickly convert visual to YAML
 */
export function visualToWorkflow(nodes: VisualNode[], edges: VisualEdge[]) {
  return WorkflowMapper.visualToYaml(nodes, edges);
}
