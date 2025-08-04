import { create } from "zustand";
import type {
  GitHubWorkflow,
  VisualNode,
  VisualEdge,
  ValidationResult,
} from "../types/github-actions";
import { WorkflowMapper } from "../utils/workflow-mapper";
import { useHistoryStore } from "./history";

// Simple validation function
const validateGitHubWorkflow = (workflow: GitHubWorkflow): ValidationResult => {
  const errors: { path: string; message: string; code: string }[] = [];

  if (!workflow.name || workflow.name.trim() === "") {
    errors.push({
      path: "name",
      message: "Workflow name is required",
      code: "MISSING_NAME",
    });
  }

  if (!workflow.on || Object.keys(workflow.on).length === 0) {
    errors.push({
      path: "on",
      message: "At least one trigger is required",
      code: "MISSING_TRIGGERS",
    });
  }

  if (!workflow.jobs || Object.keys(workflow.jobs).length === 0) {
    errors.push({
      path: "jobs",
      message: "At least one job is required",
      code: "MISSING_JOBS",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
};

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface WorkflowState {
  // State
  workflow: GitHubWorkflow;
  nodes: VisualNode[];
  edges: VisualEdge[];
  selectedNode: string | null;
  showWorkflowProperties: boolean;
  isValid: boolean;
  errors: string[];
  validationResult: ValidationResult | null;
  toasts: ToastItem[];

  // Actions
  setWorkflow: (workflow: GitHubWorkflow) => void;
  updateWorkflow: (updates: Partial<GitHubWorkflow>) => void;
  importFromYaml: (yamlContent: string) => void;
  exportToYaml: () => string;
  syncFromVisual: () => void;
  syncToVisual: () => void;
  addNode: (node: VisualNode) => void;
  updateNode: (id: string, updates: Partial<VisualNode>) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  updateNodePositions: (nodes: VisualNode[]) => void;
  autoArrangeNodes: () => void;
  removeNode: (id: string) => void;
  addEdge: (edge: VisualEdge) => void;
  updateEdges: (edges: VisualEdge[]) => void;
  removeEdge: (id: string) => void;
  validateConnection: (
    sourceId: string,
    targetId: string
  ) => { isValid: boolean; error?: string };
  isValidConnectionType: (sourceType: string, targetType: string) => boolean;
  setSelectedNode: (id: string | null) => void;
  setShowWorkflowProperties: (show: boolean) => void;
  validateWorkflow: () => void;
  clearWorkflow: () => void;
  resetToDefault: () => void;
  addToast: (message: string, type: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  restoreState: (state: {
    workflow: GitHubWorkflow;
    nodes: VisualNode[];
    edges: VisualEdge[];
  }) => void;
}

// Default workflow structure - Comprehensive CI/CD Pipeline
const defaultWorkflow: GitHubWorkflow = {
  name: "CI/CD Pipeline",
  on: {
    push: {
      branches: ["main", "develop"],
    },
    pull_request: {
      branches: ["main", "develop"],
    },
    release: {
      types: ["published"],
    },
    workflow_dispatch: {
      inputs: {
        environment: {
          description: "Environment to deploy to",
          required: true,
          default: "staging",
          type: "choice",
          options: ["staging", "production"],
        },
      },
    },
  },
  env: {
    NODE_VERSION: "18",
    REGISTRY: "ghcr.io",
  },
  jobs: {
    test: {
      "runs-on": "ubuntu-latest",
      strategy: {
        matrix: {
          "node-version": ["16", "18", "20"],
        },
      },
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js ${{ matrix.node-version }}",
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
          run: "npm test -- --coverage",
        },
        {
          name: "Upload coverage reports",
          uses: "codecov/codecov-action@v3",
          if: "matrix.node-version == '18'",
        },
      ],
    },
    lint: {
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
            "node-version": "18",
            cache: "npm",
          },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Run ESLint",
          run: "npm run lint",
        },
        {
          name: "Run Prettier",
          run: "npm run format:check",
        },
        {
          name: "Type check",
          run: "npm run type-check",
        },
      ],
    },
    "security-scan": {
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Run security audit",
          run: "npm audit --audit-level high",
        },
        {
          name: "Run CodeQL Analysis",
          uses: "github/codeql-action/analyze@v2",
          with: {
            languages: "javascript",
          },
        },
      ],
    },
    build: {
      "runs-on": "ubuntu-latest",
      needs: ["test", "lint"],
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "18",
            cache: "npm",
          },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Build application",
          run: "npm run build",
        },
        {
          name: "Upload build artifacts",
          uses: "actions/upload-artifact@v3",
          with: {
            name: "build-files",
            path: "dist/",
            "retention-days": 7,
          },
        },
      ],
    },
    "cross-platform-test": {
      strategy: {
        matrix: {
          os: ["ubuntu-latest", "windows-latest", "macos-latest"],
        },
      },
      "runs-on": "${{ matrix.os }}",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "18",
          },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Run platform-specific tests",
          run: "npm run test:platform",
        },
      ],
    },
    deploy: {
      "runs-on": "ubuntu-latest",
      needs: ["build", "security-scan"],
      if: "github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'",
      environment: {
        name: "${{ github.event.inputs.environment || 'staging' }}",
        url: "https://${{ github.event.inputs.environment || 'staging' }}.example.com",
      },
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Download build artifacts",
          uses: "actions/download-artifact@v3",
          with: {
            name: "build-files",
            path: "dist/",
          },
        },
        {
          name: "Deploy to ${{ github.event.inputs.environment || 'staging' }}",
          run: "echo 'Deploying to ${{ github.event.inputs.environment || 'staging' }}'",
        },
        {
          name: "Run health check",
          run: "curl -f https://${{ github.event.inputs.environment || 'staging' }}.example.com/health",
        },
      ],
    },
  },
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  workflow: defaultWorkflow,
  nodes: [],
  edges: [],
  selectedNode: null,
  showWorkflowProperties: false,
  isValid: true,
  errors: [],
  validationResult: null,
  toasts: [],

  // Actions
  setWorkflow: (workflow) => {
    set({ workflow });
    get().syncToVisual();
    get().validateWorkflow();
  },

  updateWorkflow: (updates) => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;

    // Save current state to history
    useHistoryStore.getState().addAction({
      type: "update_workflow",
      description: `Updated workflow settings`,
      data: {
        workflow: currentWorkflow,
        nodes: currentNodes,
        edges: currentEdges,
      },
    });

    set((state) => ({
      workflow: { ...state.workflow, ...updates },
    }));
    get().syncToVisual();
    get().validateWorkflow();
  },

  importFromYaml: (yamlContent) => {
    try {
      // This would use a YAML parser like js-yaml
      // For now, we'll assume the workflow is provided as a JSON string
      const workflow = JSON.parse(yamlContent) as GitHubWorkflow;
      get().setWorkflow(workflow);
    } catch {
      set({
        errors: ["Failed to parse YAML content"],
        isValid: false,
      });
    }
  },

  exportToYaml: () => {
    const { workflow } = get();
    // This would use a YAML serializer
    // For now, return JSON string
    return JSON.stringify(workflow, null, 2);
  },

  syncFromVisual: () => {
    const { nodes, edges } = get();
    const workflow = WorkflowMapper.visualToYaml(nodes, edges);
    set({ workflow });
    get().validateWorkflow();
  },

  syncToVisual: () => {
    const { workflow } = get();
    const { nodes, edges } = WorkflowMapper.yamlToVisual(workflow);
    const optimizedNodes = WorkflowMapper.optimizeNodeLayout(nodes);
    set({ nodes: optimizedNodes, edges });
  },

  addNode: (node) => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;

    // Save current state to history
    useHistoryStore.getState().addAction({
      type: "add_node",
      description: `Added ${node.type} node: ${node.data.name || node.id}`,
      data: {
        workflow: currentWorkflow,
        nodes: currentNodes,
        edges: currentEdges,
      },
    });

    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    get().syncFromVisual();
  },

  updateNode: (id, updates) => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const nodeToUpdate = currentNodes.find((n) => n.id === id);

    // Save current state to history
    useHistoryStore.getState().addAction({
      type: "update_node",
      description: `Updated ${nodeToUpdate?.type || "node"}: ${
        nodeToUpdate?.data.name || id
      }`,
      data: {
        workflow: currentWorkflow,
        nodes: currentNodes,
        edges: currentEdges,
      },
    });

    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
    get().syncFromVisual();
  },

  updateNodeData: (id, data) => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const nodeToUpdate = currentNodes.find((n) => n.id === id);

    // Save current state to history
    useHistoryStore.getState().addAction({
      type: "update_node",
      description: `Updated ${nodeToUpdate?.type || "node"} data: ${
        nodeToUpdate?.data.name || id
      }`,
      data: {
        workflow: currentWorkflow,
        nodes: currentNodes,
        edges: currentEdges,
      },
    });

    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
    get().syncFromVisual();
  },

  updateNodePositions: (nodes) => {
    set({ nodes });
    get().syncFromVisual();
  },

  autoArrangeNodes: () => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;

    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;

    // Save current state to history
    useHistoryStore.getState().addAction({
      type: "arrange_nodes",
      description: `Auto-arranged ${nodes.length} nodes`,
      data: {
        workflow: currentWorkflow,
        nodes: currentNodes,
        edges: currentEdges,
      },
    });

    // Advanced auto-layout algorithm
    const arrangedNodes = [...nodes];

    // Configuration
    const config = {
      nodeWidth: 220,
      nodeHeight: 100,
      horizontalSpacing: 60,
      verticalSpacing: 120,
      groupSpacing: 40,
      startX: 100,
      startY: 100,
    };

    // Step 1: Categorize nodes by type
    const triggerNodes = nodes.filter((node) => node.type === "trigger");

    // Step 2: Build dependency graph from edges and GitHub Actions 'needs'
    const dependencyGraph = new Map<string, string[]>();
    const incomingEdges = new Map<string, string[]>();

    // Initialize maps
    nodes.forEach((node) => {
      dependencyGraph.set(node.id, []);
      incomingEdges.set(node.id, []);
    });

    // Add edges to dependency graph
    edges.forEach((edge) => {
      dependencyGraph.get(edge.source)?.push(edge.target);
      incomingEdges.get(edge.target)?.push(edge.source);
    });

    // Step 3: Topological sort with Kahn's algorithm
    const getTopologicalLayers = () => {
      const layers: string[][] = [];
      const nodeDepth = new Map<string, number>();
      const processing = new Set<string>();

      // Find nodes with no dependencies (roots)
      const roots = nodes
        .filter(
          (node) =>
            (incomingEdges.get(node.id)?.length || 0) === 0 ||
            node.type === "trigger"
        )
        .map((node) => node.id);

      if (roots.length === 0 && nodes.length > 0) {
        // If no clear roots, use all trigger nodes or first node
        roots.push(triggerNodes.length > 0 ? triggerNodes[0].id : nodes[0].id);
      }

      // Calculate depth for each node
      const calculateDepth = (nodeId: string): number => {
        if (nodeDepth.has(nodeId)) {
          return nodeDepth.get(nodeId)!;
        }

        if (processing.has(nodeId)) {
          // Circular dependency detected, assign depth 0
          return 0;
        }

        processing.add(nodeId);

        const dependencies = incomingEdges.get(nodeId) || [];
        const maxDepth =
          dependencies.length > 0
            ? Math.max(
                ...dependencies.map((depId) => calculateDepth(depId) + 1)
              )
            : 0;

        processing.delete(nodeId);
        nodeDepth.set(nodeId, maxDepth);
        return maxDepth;
      };

      // Calculate depths
      nodes.forEach((node) => calculateDepth(node.id));

      // Group nodes by depth
      const maxDepth = Math.max(...Array.from(nodeDepth.values()));
      for (let depth = 0; depth <= maxDepth; depth++) {
        const layerNodes = nodes
          .filter((node) => nodeDepth.get(node.id) === depth)
          .map((node) => node.id);
        if (layerNodes.length > 0) {
          layers.push(layerNodes);
        }
      }

      return layers;
    };

    const layers = getTopologicalLayers();

    // Step 4: Smart positioning with grouping
    const positionNodes = () => {
      let maxLayerWidth = 0;

      // Calculate positions for each layer
      layers.forEach((layer, layerIndex) => {
        // Sort nodes in layer by type priority (triggers first, then jobs, then steps)
        const sortedLayer = layer.sort((a, b) => {
          const nodeA = nodes.find((n) => n.id === a);
          const nodeB = nodes.find((n) => n.id === b);
          const typeOrder = { trigger: 0, job: 1, step: 2 };
          const orderA = typeOrder[nodeA?.type as keyof typeof typeOrder] ?? 3;
          const orderB = typeOrder[nodeB?.type as keyof typeof typeOrder] ?? 3;
          return orderA - orderB;
        });

        // Group parallel jobs (jobs with no dependencies between them)
        const groups: string[][] = [];
        const processed = new Set<string>();

        sortedLayer.forEach((nodeId) => {
          if (processed.has(nodeId)) return;

          const group = [nodeId];
          processed.add(nodeId);

          // Find nodes that can be grouped with this one (parallel execution)
          sortedLayer.forEach((otherNodeId) => {
            if (processed.has(otherNodeId) || nodeId === otherNodeId) return;

            // Check if these nodes can run in parallel (no direct dependency)
            const dependencies1 = dependencyGraph.get(nodeId) || [];
            const dependencies2 = dependencyGraph.get(otherNodeId) || [];
            const incoming1 = incomingEdges.get(nodeId) || [];
            const incoming2 = incomingEdges.get(otherNodeId) || [];

            const canBeParallel =
              !dependencies1.includes(otherNodeId) &&
              !dependencies2.includes(nodeId) &&
              !incoming1.includes(otherNodeId) &&
              !incoming2.includes(nodeId);

            if (canBeParallel) {
              group.push(otherNodeId);
              processed.add(otherNodeId);
            }
          });

          groups.push(group);
        });

        // Position groups within the layer
        const layerY =
          config.startY +
          layerIndex * (config.nodeHeight + config.verticalSpacing);
        let maxGroupWidth = 0;

        groups.forEach((group, groupIndex) => {
          const groupWidth =
            group.length * config.nodeWidth +
            (group.length - 1) * config.groupSpacing;
          maxGroupWidth = Math.max(maxGroupWidth, groupWidth);

          const groupStartX = config.startX + (maxLayerWidth - groupWidth) / 2;

          group.forEach((nodeId, nodeIndex) => {
            const nodeIndexInArranged = arrangedNodes.findIndex(
              (n) => n.id === nodeId
            );
            if (nodeIndexInArranged !== -1) {
              arrangedNodes[nodeIndexInArranged] = {
                ...arrangedNodes[nodeIndexInArranged],
                position: {
                  x:
                    groupStartX +
                    nodeIndex * (config.nodeWidth + config.groupSpacing),
                  y:
                    layerY +
                    groupIndex * (config.nodeHeight + config.groupSpacing),
                },
              };
            }
          });
        });

        maxLayerWidth = Math.max(
          maxLayerWidth,
          maxGroupWidth + config.horizontalSpacing
        );
      });
    };

    // Step 5: Apply positioning
    positionNodes();

    // Step 6: Center the entire layout
    if (arrangedNodes.length > 0) {
      const bounds = arrangedNodes.reduce(
        (acc, node) => ({
          minX: Math.min(acc.minX, node.position.x),
          maxX: Math.max(acc.maxX, node.position.x + config.nodeWidth),
          minY: Math.min(acc.minY, node.position.y),
          maxY: Math.max(acc.maxY, node.position.y + config.nodeHeight),
        }),
        {
          minX: Infinity,
          maxX: -Infinity,
          minY: Infinity,
          maxY: -Infinity,
        }
      );

      const centerOffsetX = -bounds.minX + 50;
      const centerOffsetY = -bounds.minY + 50;

      arrangedNodes.forEach((node) => {
        node.position.x += centerOffsetX;
        node.position.y += centerOffsetY;
      });
    }

    set({ nodes: arrangedNodes });
    get().syncFromVisual();
  },

  removeNode: (id) => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const nodeToRemove = currentNodes.find((n) => n.id === id);

    // Save current state to history
    useHistoryStore.getState().addAction({
      type: "remove_node",
      description: `Removed ${nodeToRemove?.type || "node"}: ${
        nodeToRemove?.data.name || id
      }`,
      data: {
        workflow: currentWorkflow,
        nodes: currentNodes,
        edges: currentEdges,
      },
    });

    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selectedNode: state.selectedNode === id ? null : state.selectedNode,
    }));
    get().syncFromVisual();
  },

  addEdge: (edge) => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const sourceNode = currentNodes.find((n) => n.id === edge.source);
    const targetNode = currentNodes.find((n) => n.id === edge.target);

    // Save current state to history
    useHistoryStore.getState().addAction({
      type: "add_edge",
      description: `Connected ${sourceNode?.type || "node"} to ${
        targetNode?.type || "node"
      }`,
      data: {
        workflow: currentWorkflow,
        nodes: currentNodes,
        edges: currentEdges,
      },
    });

    set((state) => ({
      edges: [...state.edges, edge],
    }));
    get().syncFromVisual();
  },

  updateEdges: (edges) => {
    set({ edges });
    get().syncFromVisual();
  },

  validateConnection: (sourceId, targetId) => {
    const { nodes } = get();
    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) {
      return { isValid: false, error: "Source or target node not found" };
    }

    // Check if connection already exists
    const { edges } = get();
    const existingConnection = edges.find(
      (e) => e.source === sourceId && e.target === targetId
    );
    if (existingConnection) {
      return { isValid: false, error: "Connection already exists" };
    }

    // Check for circular dependencies
    const wouldCreateCycle = (source: string, target: string): boolean => {
      if (source === target) return true;

      const targetEdges = edges.filter((e) => e.source === target);
      return targetEdges.some((edge) => wouldCreateCycle(source, edge.target));
    };

    if (wouldCreateCycle(sourceId, targetId)) {
      return {
        isValid: false,
        error: "Connection would create a circular dependency",
      };
    }

    // Validate connection types
    if (!get().isValidConnectionType(sourceNode.type, targetNode.type)) {
      return {
        isValid: false,
        error: `Cannot connect ${sourceNode.type} to ${targetNode.type}`,
      };
    }

    return { isValid: true };
  },

  isValidConnectionType: (sourceType, targetType) => {
    // GitHub Actions workflow connection rules:
    // - Triggers can connect to jobs
    // - Jobs can connect to other jobs (dependencies)
    // - Jobs can connect to steps (job contains steps)
    // - Steps cannot connect to other nodes (they are contained within jobs)

    switch (sourceType) {
      case "trigger":
        return targetType === "job";
      case "job":
        return targetType === "job" || targetType === "step";
      case "step":
        return false; // Steps cannot be source of connections
      default:
        return false;
    }
  },

  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
    get().syncFromVisual();
  },

  setSelectedNode: (id) => {
    set({ selectedNode: id, showWorkflowProperties: false });
  },

  setShowWorkflowProperties: (show) => {
    set({
      showWorkflowProperties: show,
      selectedNode: show ? null : get().selectedNode,
    });
  },

  validateWorkflow: () => {
    const { workflow } = get();
    const validationResult = validateGitHubWorkflow(workflow);

    set({
      validationResult,
      isValid: validationResult.isValid,
      errors: validationResult.errors.map(
        (error) => `${error.path}: ${error.message}`
      ),
    });
  },

  clearWorkflow: () => {
    set({
      workflow: { name: "", on: {}, jobs: {} },
      nodes: [],
      edges: [],
      selectedNode: null,
      isValid: false,
      errors: [],
      validationResult: null,
    });
  },

  resetToDefault: () => {
    set({
      workflow: defaultWorkflow,
      selectedNode: null,
      isValid: true,
      errors: [],
      validationResult: null,
    });
    get().syncToVisual();
  },

  addToast: (message, type) => {
    const toast: ToastItem = {
      id: Date.now().toString(),
      message,
      type,
      duration: 3000,
    };
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  restoreState: (state) => {
    set({
      workflow: state.workflow,
      nodes: state.nodes,
      edges: state.edges,
      selectedNode: null,
    });
    get().validateWorkflow();
  },
}));

// Initialize the store with default workflow and visual representation
setTimeout(() => {
  useWorkflowStore.getState().resetToDefault();
}, 0);
