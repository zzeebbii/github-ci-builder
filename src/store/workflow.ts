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
    const { nodes } = get();
    if (nodes.length === 0) return;

    // Apply the same waterfall layout as initial render
    const arrangedNodes = WorkflowMapper.optimizeNodeLayout(nodes);

    set({ nodes: arrangedNodes });
    get().syncToVisual();
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
