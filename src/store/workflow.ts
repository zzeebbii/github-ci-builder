import { create } from "zustand";
import type {
  GitHubWorkflow,
  VisualNode,
  VisualEdge,
  ValidationResult,
} from "../types/github-actions";
import { validateGitHubWorkflow } from "../utils/github-actions-validator";
import {
  WorkflowMapper,
  workflowToVisual,
  visualToWorkflow,
} from "../utils/workflow-mapper";

export interface ToastItem {
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
}

// Default workflow structure
const defaultWorkflow: GitHubWorkflow = {
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
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
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
    const workflow = visualToWorkflow(nodes, edges);
    set({ workflow });
    get().validateWorkflow();
  },

  syncToVisual: () => {
    const { workflow } = get();
    const { nodes, edges } = workflowToVisual(workflow);
    const optimizedNodes = WorkflowMapper.optimizeNodeLayout(nodes);
    set({ nodes: optimizedNodes, edges });
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    get().syncFromVisual();
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
    get().syncFromVisual();
  },

  updateNodeData: (id, data) => {
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

    // Simple auto-layout algorithm - arrange nodes in layers
    const arrangedNodes = [...nodes];
    const visited = new Set<string>();
    const layers: string[][] = [];

    // Find root nodes (triggers - nodes with no incoming edges)
    const rootNodes = nodes.filter(
      (node) =>
        !edges.some((edge) => edge.target === node.id) ||
        node.type === "trigger"
    );

    // Layer-based layout
    const processLayer = (currentNodes: string[], layer: number) => {
      if (currentNodes.length === 0) return;
      layers[layer] = currentNodes;

      const nextNodes: string[] = [];
      currentNodes.forEach((nodeId) => {
        visited.add(nodeId);
        // Find connected nodes
        edges.forEach((edge) => {
          if (edge.source === nodeId && !visited.has(edge.target)) {
            nextNodes.push(edge.target);
          }
        });
      });

      if (nextNodes.length > 0) {
        processLayer(nextNodes, layer + 1);
      }
    };

    processLayer(
      rootNodes.map((n) => n.id),
      0
    );

    // Position nodes based on layers
    const layerHeight = 120;
    const nodeWidth = 200;
    const nodeSpacing = 50;

    layers.forEach((layer, layerIndex) => {
      layer.forEach((nodeId, positionIndex) => {
        const nodeIndex = arrangedNodes.findIndex((n) => n.id === nodeId);
        if (nodeIndex !== -1) {
          const totalWidth =
            layer.length * nodeWidth + (layer.length - 1) * nodeSpacing;
          const startX = -totalWidth / 2;

          // Create a new node object with updated position
          arrangedNodes[nodeIndex] = {
            ...arrangedNodes[nodeIndex],
            position: {
              x:
                startX +
                positionIndex * (nodeWidth + nodeSpacing) +
                nodeWidth / 2,
              y: layerIndex * layerHeight,
            },
          };
        }
      });
    });

    set({ nodes: arrangedNodes });
    get().syncFromVisual();
  },

  removeNode: (id) => {
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
}));

// Initialize the store with default workflow and visual representation
setTimeout(() => {
  useWorkflowStore.getState().resetToDefault();
}, 0);
