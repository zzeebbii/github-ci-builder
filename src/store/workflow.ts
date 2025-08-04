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

interface WorkflowState {
  // Workflow data
  workflow: GitHubWorkflow;
  nodes: VisualNode[];
  edges: VisualEdge[];

  // UI state
  selectedNode: string | null;
  isValid: boolean;
  errors: string[];
  validationResult: ValidationResult | null;

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
  setSelectedNode: (id: string | null) => void;
  validateWorkflow: () => void;
  clearWorkflow: () => void;
  resetToDefault: () => void;
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
  isValid: true,
  errors: [],
  validationResult: null,

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

  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
    get().syncFromVisual();
  },

  setSelectedNode: (id) => {
    set({ selectedNode: id });
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
}));

// Initialize the store with default workflow and visual representation
setTimeout(() => {
  useWorkflowStore.getState().resetToDefault();
}, 0);
