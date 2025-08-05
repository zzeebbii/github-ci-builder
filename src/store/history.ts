import { create } from "zustand";
import type {
  GitHubWorkflow,
  VisualNode,
  VisualEdge,
} from "../types/github-actions";

export interface HistoryAction {
  id: string;
  type:
    | "add_node"
    | "remove_node"
    | "update_node"
    | "add_edge"
    | "remove_edge"
    | "update_workflow"
    | "import_workflow"
    | "arrange_nodes";
  description: string;
  timestamp: Date;
  data: {
    workflow: GitHubWorkflow;
    nodes: VisualNode[];
    edges: VisualEdge[];
  };
}

interface HistoryState {
  // State
  history: HistoryAction[];
  currentIndex: number;
  maxHistorySize: number;

  // Actions
  addAction: (action: Omit<HistoryAction, "id" | "timestamp">) => void;
  undo: () => HistoryAction | null;
  redo: () => HistoryAction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getUndoActions: () => HistoryAction[];
  getRedoActions: () => HistoryAction[];
  clearHistory: () => void;
  jumpToAction: (index: number) => HistoryAction | null;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  currentIndex: -1,
  maxHistorySize: 50,

  addAction: action => {
    set(state => {
      const newAction: HistoryAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      // Remove any actions after current index (when we add a new action after undoing)
      const newHistory = state.history.slice(0, state.currentIndex + 1);

      // Check for duplicate actions within 500ms (deduplication)
      const lastAction = newHistory[newHistory.length - 1];
      if (
        lastAction &&
        lastAction.type === newAction.type &&
        lastAction.description === newAction.description &&
        newAction.timestamp.getTime() - lastAction.timestamp.getTime() < 500
      ) {
        // Skip adding this duplicate action
        return state;
      }

      // Add the new action
      newHistory.push(newAction);

      // Trim history if it exceeds max size
      const trimmedHistory = newHistory.slice(-state.maxHistorySize);
      const newCurrentIndex = trimmedHistory.length - 1;

      return {
        history: trimmedHistory,
        currentIndex: newCurrentIndex,
      };
    });
  },

  undo: () => {
    const { history, currentIndex } = get();

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const targetAction = history[newIndex];

      set({ currentIndex: newIndex });

      // Import and call workflow store's restoreState method
      import("./workflow").then(({ useWorkflowStore }) => {
        const workflowStore = useWorkflowStore.getState();
        workflowStore.restoreState(targetAction.data);
        workflowStore.addToast(`Undone: ${targetAction.description}`, "info");
      });

      return targetAction;
    }

    return null;
  },

  redo: () => {
    const { history, currentIndex } = get();

    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const targetAction = history[newIndex];

      set({ currentIndex: newIndex });

      // Import and call workflow store's restoreState method
      import("./workflow").then(({ useWorkflowStore }) => {
        const workflowStore = useWorkflowStore.getState();
        workflowStore.restoreState(targetAction.data);
        workflowStore.addToast(`Redone: ${targetAction.description}`, "info");
      });

      return targetAction;
    }

    return null;
  },

  canUndo: () => {
    const { currentIndex } = get();
    return currentIndex > 0;
  },

  canRedo: () => {
    const { history, currentIndex } = get();
    return currentIndex < history.length - 1;
  },

  getUndoActions: () => {
    const { history, currentIndex } = get();
    return history.slice(0, currentIndex + 1).reverse();
  },

  getRedoActions: () => {
    const { history, currentIndex } = get();
    return history.slice(currentIndex + 1);
  },

  clearHistory: () => {
    set({ history: [], currentIndex: -1 });
  },

  jumpToAction: (index: number) => {
    const { history } = get();

    if (index >= 0 && index < history.length) {
      const targetAction = history[index];
      set({ currentIndex: index });

      // Import and call workflow store's restoreState method
      import("./workflow").then(({ useWorkflowStore }) => {
        useWorkflowStore.getState().restoreState(targetAction.data);
      });

      return targetAction;
    }

    return null;
  },
}));
