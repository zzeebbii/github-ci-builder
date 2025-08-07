import { create } from "zustand";
import type {
  GitHubWorkflow,
  VisualNode,
  VisualEdge,
  ValidationResult,
} from "../types/github-actions";
import { WorkflowMapper } from "../utils/workflow-mapper";
import { useHistoryStore } from "./history";

// Empty workflow template
const EMPTY_WORKFLOW: GitHubWorkflow = {
  name: "New Workflow",
  on: {},
  jobs: {},
};

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
  animatedEdges: Set<string>; // New state for tracking animated edges

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
  toggleEdgeAnimation: (nodeId: string) => void; // New method for toggling edge animation
  clearEdgeAnimations: () => void; // New method to clear all animations
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  workflow: EMPTY_WORKFLOW,
  nodes: [],
  edges: [],
  selectedNode: null,
  showWorkflowProperties: false,
  isValid: true,
  errors: [],
  validationResult: null,
  toasts: [],
  animatedEdges: new Set<string>(), // Initialize animated edges set

  // Actions
  setWorkflow: workflow => {
    set({ workflow });
    get().syncToVisual();
    get().validateWorkflow();
  },

  updateWorkflow: updates => {
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

    set(state => ({
      workflow: { ...state.workflow, ...updates },
    }));
    // Don't call syncToVisual() for workflow property updates
    // syncToVisual is for syncing workflow structure to visual nodes/edges
    get().validateWorkflow();
  },

  importFromYaml: yamlContent => {
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
    const { nodes, edges, workflow: currentWorkflow } = get();

    const workflow = WorkflowMapper.visualToYaml(nodes, edges);

    // Preserve the existing workflow name and other metadata
    workflow.name = currentWorkflow.name || workflow.name;
    if (currentWorkflow["run-name"]) {
      workflow["run-name"] = currentWorkflow["run-name"];
    }

    set({ workflow });
    get().validateWorkflow();
  },

  syncToVisual: () => {
    const { workflow } = get();
    const { nodes, edges } = WorkflowMapper.yamlToVisual(workflow);
    const optimizedNodes = WorkflowMapper.optimizeNodeLayout(nodes);
    set({ nodes: optimizedNodes, edges });
  },

  addNode: node => {
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

    set(state => ({
      nodes: [...state.nodes, node],
    }));
    get().syncFromVisual();
  },

  updateNode: (id, updates) => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const nodeToUpdate = currentNodes.find(n => n.id === id);

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

    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
    get().syncFromVisual();
  },

  updateNodeData: (id, data) => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const nodeToUpdate = currentNodes.find(n => n.id === id);

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

    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
    get().syncFromVisual();
  },

  updateNodePositions: nodes => {
    set({ nodes });
    get().syncFromVisual();
  },

  autoArrangeNodes: () => {
    const { nodes } = get();
    if (nodes.length === 0) {
      return;
    }

    // Apply the same waterfall layout as initial render
    const arrangedNodes = WorkflowMapper.optimizeNodeLayout(nodes);

    set({ nodes: arrangedNodes });
    get().syncToVisual();
  },

  removeNode: id => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const nodeToRemove = currentNodes.find(n => n.id === id);

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

    set(state => ({
      nodes: state.nodes.filter(node => node.id !== id),
      edges: state.edges.filter(
        edge => edge.source !== id && edge.target !== id
      ),
      selectedNode: state.selectedNode === id ? null : state.selectedNode,
    }));
    get().syncFromVisual();
  },

  addEdge: edge => {
    const currentWorkflow = get().workflow;
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const sourceNode = currentNodes.find(n => n.id === edge.source);
    const targetNode = currentNodes.find(n => n.id === edge.target);

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

    set(state => ({
      edges: [...state.edges, edge],
    }));
    get().syncFromVisual();
  },

  updateEdges: edges => {
    set({ edges });
    get().syncFromVisual();
  },

  validateConnection: (sourceId, targetId) => {
    const { nodes } = get();
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    if (!sourceNode || !targetNode) {
      return { isValid: false, error: "Source or target node not found" };
    }

    // Check if connection already exists
    const { edges } = get();
    const existingConnection = edges.find(
      e => e.source === sourceId && e.target === targetId
    );
    if (existingConnection) {
      return { isValid: false, error: "Connection already exists" };
    }

    // Check for circular dependencies
    const wouldCreateCycle = (source: string, target: string): boolean => {
      if (source === target) {
        return true;
      }

      const targetEdges = edges.filter(e => e.source === target);
      return targetEdges.some(edge => wouldCreateCycle(source, edge.target));
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

  removeEdge: id => {
    set(state => ({
      edges: state.edges.filter(edge => edge.id !== id),
    }));
    get().syncFromVisual();
  },

  setSelectedNode: id => {
    set({ selectedNode: id, showWorkflowProperties: false });
  },

  setShowWorkflowProperties: show => {
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
        error => `${error.path}: ${error.message}`
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
      workflow: EMPTY_WORKFLOW,
      nodes: [],
      edges: [],
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
    set(state => ({
      toasts: [...state.toasts, toast],
    }));
  },

  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },

  restoreState: state => {
    set({
      workflow: state.workflow,
      nodes: state.nodes,
      edges: state.edges,
      selectedNode: null,
    });
    get().validateWorkflow();
  },

  toggleEdgeAnimation: (nodeId: string) => {
    const { edges, nodes } = get();

    // Find all edges that connect this job node to other job nodes (both incoming and outgoing)
    const jobToJobEdges = edges.filter(edge => {
      // Check if this edge connects to the clicked node (either as source or target)
      const isConnectedToNode =
        edge.source === nodeId || edge.target === nodeId;
      if (!isConnectedToNode) {
        return false;
      }

      // Check if both source and target are job nodes
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      return sourceNode?.type === "job" && targetNode?.type === "job";
    });

    set(state => {
      // Check if any job-to-job edge connected to this node is currently animated
      const hasAnimatedEdge = jobToJobEdges.some(edge =>
        state.animatedEdges.has(edge.id)
      );

      if (hasAnimatedEdge) {
        // If this node's edges are animated, clear all animations (deselect)
        return { animatedEdges: new Set<string>() };
      } else {
        // Clear all previous animations and add only this node's job-to-job edges
        const newAnimatedEdges = new Set<string>();
        jobToJobEdges.forEach(edge => {
          newAnimatedEdges.add(edge.id);
        });

        return { animatedEdges: newAnimatedEdges };
      }
    });
  },

  clearEdgeAnimations: () => {
    const { edges } = get();
    const updatedEdges = edges.map(edge => ({
      ...edge,
      animated: false,
    }));

    set({
      edges: updatedEdges,
      animatedEdges: new Set<string>(),
    });
  },
}));

// Initialize the store with default workflow and visual representation
setTimeout(() => {
  useWorkflowStore.getState().resetToDefault();
}, 0);
