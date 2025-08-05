// Debug script to test workflow mapping
const testWorkflow = {
  name: "Test",
  on: { push: { branches: ["main"] } },
  jobs: {
    test: {
      "runs-on": "ubuntu-latest",
      steps: [
        { name: "Checkout", uses: "actions/checkout@v4" },
        { name: "Setup Node", uses: "actions/setup-node@v4" },
        { name: "Install", run: "npm ci" },
      ],
    },
  },
};

// Simulate the yamlToVisual logic
function debugYamlToVisual(workflow) {
  const nodes = [];
  const edges = [];
  let nodeIndex = 0;

  const getPosition = () => ({
    x: 100 + (nodeIndex % 4) * 250,
    y: 100 + Math.floor(nodeIndex / 4) * 200,
  });

  // Create trigger node
  const triggerNode = {
    id: "trigger",
    type: "trigger",
    position: getPosition(),
    data: {
      label: "On Push",
      triggerType: "push",
      triggers: workflow.on,
      isValid: true,
      errors: [],
    },
  };
  nodes.push(triggerNode);
  nodeIndex++;

  // Create job nodes and their dependencies
  const jobIds = Object.keys(workflow.jobs);
  const jobNodeMap = new Map();

  jobIds.forEach((jobId) => {
    const job = workflow.jobs[jobId];
    const nodeId = `job-${jobId}`;
    jobNodeMap.set(jobId, nodeId);

    console.log(`Creating job node: ${nodeId}`);
    console.log(`Job has ${job.steps.length} steps`);

    const jobNode = {
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
      console.log(`Creating step node: ${stepNodeId}`);

      const stepNode = {
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
      const edgeId = `${sourceId}-${stepNodeId}`;

      console.log(`Creating edge: ${sourceId} -> ${stepNodeId}`);

      edges.push({
        id: edgeId,
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
    const targetNodeId = jobNodeMap.get(jobId);

    console.log(`Processing job dependencies for: ${jobId}`);

    if (job.needs) {
      console.log(`Job ${jobId} has dependencies:`, job.needs);
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
      console.log(`Connecting trigger to job: ${jobId}`);
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

const result = debugYamlToVisual(testWorkflow);
console.log("\n=== SUMMARY ===");
console.log("Nodes:", result.nodes.length);
console.log("Edges:", result.edges.length);
console.log("\nNodes:");
result.nodes.forEach((n) =>
  console.log(`- ${n.type}: ${n.id} (${n.data.label})`)
);
console.log("\nEdges:");
result.edges.forEach((e) =>
  console.log(`- ${e.source} -> ${e.target} (${e.type})`)
);
