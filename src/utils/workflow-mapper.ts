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

    // Improved layout for waterfall arrangement
    let currentJobX = 150;
    const triggerY = 50;
    const jobStartY = 300; // Increased from 200 to 300 for more vertical spacing
    const jobSpacing = 400; // Horizontal space between job columns
    const stepHeight = 120; // Vertical space between step nodes
    const jobToStepSpacing = 150; // Increased space between job and its first step for better edge visibility

    const getJobPosition = () => {
      const pos = { x: currentJobX, y: jobStartY };
      currentJobX += jobSpacing;
      return pos;
    };

    const getStepPosition = (
      jobPos: { x: number; y: number },
      stepIndex: number
    ) => {
      // Calculate center alignment: job is 180px wide, step is 140px wide
      // So we need to offset step by (180-140)/2 = 20px to center it
      const jobWidth = 180;
      const stepWidth = 140;
      const centerOffset = (jobWidth - stepWidth) / 2;

      return {
        x: jobPos.x + centerOffset, // Center-align steps under the job
        y: jobPos.y + jobToStepSpacing + stepIndex * stepHeight, // Waterfall below job
      };
    };

    // Create trigger node - positioned at the top center
    const triggerNode: VisualNode = {
      id: "trigger",
      type: "trigger",
      position: { x: 100, y: triggerY },
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

    // Create job nodes and their dependencies
    const jobIds = Object.keys(workflow.jobs);

    // Separate jobs by dependency status - jobs without dependencies first
    const jobsWithoutDependencies: string[] = [];
    const jobsWithDependencies: string[] = [];

    jobIds.forEach((jobId) => {
      const job = workflow.jobs[jobId];
      if (
        job.needs &&
        (Array.isArray(job.needs) ? job.needs.length > 0 : job.needs)
      ) {
        jobsWithDependencies.push(jobId);
      } else {
        jobsWithoutDependencies.push(jobId);
      }
    });

    // Combine arrays - independent jobs first, then dependent jobs
    const orderedJobIds = [...jobsWithoutDependencies, ...jobsWithDependencies];
    const jobNodeMap = new Map<string, string>(); // jobId -> nodeId

    orderedJobIds.forEach((jobId) => {
      const job = workflow.jobs[jobId];
      const nodeId = `job-${jobId}`;
      jobNodeMap.set(jobId, nodeId);

      const jobPosition = getJobPosition();
      const jobNode: VisualNode = {
        id: nodeId,
        type: "job",
        position: jobPosition,
        data: {
          label: job.name || jobId,
          job,
          isValid: true,
          errors: [],
        },
      };
      nodes.push(jobNode);

      // Create step nodes for this job in waterfall layout (center-aligned)
      if (job.steps && job.steps.length > 0) {
        job.steps.forEach((step, stepIndex) => {
          const stepNodeId = `${nodeId}-step-${stepIndex}`;
          const stepPosition = getStepPosition(jobPosition, stepIndex);

          const stepNode: VisualNode = {
            id: stepNodeId,
            type: "step",
            position: stepPosition,
            data: {
              label:
                step.name ||
                step.uses ||
                step.run?.substring(0, 30) + "..." ||
                `Step ${stepIndex + 1}`,
              step,
              // Add proper step node data for StepNode component
              type: step.uses ? "action" : "run",
              actionName: step.uses ? step.uses.split("@")[0] : undefined, // Extract action name without version
              actionVersion: step.uses
                ? step.uses.split("@")[1] || "latest"
                : undefined,
              runCommand: step.run || undefined,
              shell: step.shell || undefined,
              workingDirectory: step["working-directory"] || undefined,
              continueOnError: step["continue-on-error"] || false,
              condition: step.if || undefined,
              isValid: true,
              errors: [],
            },
          };
          nodes.push(stepNode);

          // Connect job to its first step, or previous step to current step
          const sourceId =
            stepIndex === 0 ? nodeId : `${nodeId}-step-${stepIndex - 1}`;
          const edgeId = `${sourceId}-${stepNodeId}`;

          edges.push({
            id: edgeId,
            source: sourceId,
            target: stepNodeId,
            sourceHandle: stepIndex === 0 ? "job-source" : "step-source",
            targetHandle: "step-target",
            type: "default",
            animated: true,
            style: {
              stroke: "#10b981", // Green for step flow
              strokeWidth: 2,
              strokeDasharray: undefined, // Solid line
            },
            label: stepIndex === 0 ? "starts" : undefined,
            labelStyle: { fontSize: 10, fontWeight: 600 },
            labelBgStyle: { fill: "#10b981", fillOpacity: 0.1 },
          });
        });
      }
    });

    // Create job dependency edges
    orderedJobIds.forEach((jobId) => {
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
              sourceHandle: "job-source",
              targetHandle: "job-target",
              type: "default",
              animated: false,
              style: {
                stroke: "#8b5cf6", // Purple for job dependencies
                strokeWidth: 3,
                strokeDasharray: "8,4", // Dashed line to show dependency
              },
              label: "depends on",
              labelStyle: { fontSize: 10, fontWeight: 600, fill: "#8b5cf6" },
              labelBgStyle: {
                fill: "#ffffff",
                fillOpacity: 0.9,
                stroke: "#8b5cf6",
                strokeWidth: 1,
              },
            });
          }
        });
      } else {
        // Connect trigger to jobs without dependencies
        edges.push({
          id: `trigger-${targetNodeId}`,
          source: "trigger",
          target: targetNodeId,
          sourceHandle: "trigger-source",
          targetHandle: "job-target",
          type: "default",
          animated: true,
          style: {
            stroke: "#3b82f6", // Blue for trigger connections
            strokeWidth: 2,
            strokeDasharray: undefined, // Solid line
          },
          label: "triggers",
          labelStyle: { fontSize: 10, fontWeight: 600, fill: "#3b82f6" },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.9,
            stroke: "#3b82f6",
            strokeWidth: 1,
          },
        });
      }
    });

    // Reposition trigger nodes to be centered relative to all jobs
    const jobNodes = nodes.filter((n) => n.type === "job");
    const triggerNodes = nodes.filter((n) => n.type === "trigger");

    if (jobNodes.length > 0 && triggerNodes.length > 0) {
      const firstJobX = jobNodes[0].position.x;
      const lastJobX = jobNodes[jobNodes.length - 1].position.x;
      const centerX = (firstJobX + lastJobX) / 2;

      triggerNodes.forEach((node, index) => {
        node.position = {
          x: centerX + (index - (triggerNodes.length - 1) / 2) * 200, // Center and spread triggers
          y: node.position.y, // Keep the same Y position
        };
      });
    }

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
        // Add proper step node data for StepNode component
        type: "run",
        actionName: undefined,
        isValid: true,
        errors: [],
      },
    };
  }

  /**
   * Apply waterfall layout to nodes - reusable function for consistent positioning
   */
  static applyWaterfallLayout(nodes: VisualNode[]): VisualNode[] {
    const layoutNodes = [...nodes];
    const jobNodes = layoutNodes.filter((n) => n.type === "job");
    const stepNodes = layoutNodes.filter((n) => n.type === "step");
    const triggerNodes = layoutNodes.filter((n) => n.type === "trigger");

    // Layout constants - improved spacing for better edge visibility
    let currentJobX = 150;
    const triggerY = 50;
    const jobStartY = 300; // Increased from 200 to 300 for more vertical spacing
    const jobSpacing = 400; // Horizontal space between job columns
    const stepHeight = 120; // Vertical space between step nodes
    const jobToStepSpacing = 150; // Increased space between job and its first step for better edge visibility

    // Position job nodes horizontally with proper spacing first to calculate total width
    jobNodes.forEach((node) => {
      node.position = {
        x: currentJobX,
        y: jobStartY,
      };
      currentJobX += jobSpacing;
    });

    // Calculate the center position for trigger nodes based on job positions
    if (jobNodes.length > 0) {
      const firstJobX = jobNodes[0].position.x;
      const lastJobX = jobNodes[jobNodes.length - 1].position.x;
      const centerX = (firstJobX + lastJobX) / 2;

      // Position trigger nodes at the center relative to all jobs
      triggerNodes.forEach((node, index) => {
        node.position = {
          x: centerX + (index - (triggerNodes.length - 1) / 2) * 200, // Center and spread triggers
          y: triggerY,
        };
      });
    } else {
      // Fallback if no jobs exist
      triggerNodes.forEach((node, index) => {
        node.position = {
          x: 100 + index * 200,
          y: triggerY,
        };
      });
    }

    // Position step nodes in waterfall under their parent jobs (center-aligned)
    stepNodes.forEach((stepNode) => {
      const jobId = stepNode.id.split("-step-")[0];
      const stepIndex = parseInt(stepNode.id.split("-step-")[1]);
      const parentJob = jobNodes.find((job) => job.id === jobId);

      if (parentJob) {
        // Calculate center alignment: job is 180px wide, step is 140px wide
        // So we need to offset step by (180-140)/2 = 20px to center it
        const jobWidth = 180;
        const stepWidth = 140;
        const centerOffset = (jobWidth - stepWidth) / 2;

        stepNode.position = {
          x: parentJob.position.x + centerOffset, // Center-align under job
          y: parentJob.position.y + jobToStepSpacing + stepIndex * stepHeight, // Waterfall layout
        };
      }
    });

    return layoutNodes;
  }

  /**
   * Validate and update node positions using waterfall layout
   */
  static optimizeNodeLayout(nodes: VisualNode[]): VisualNode[] {
    return this.applyWaterfallLayout(nodes);
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
