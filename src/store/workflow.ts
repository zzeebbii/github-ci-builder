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
  removeNode: (id: string) => void;
  addEdge: (edge: VisualEdge) => void;
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
