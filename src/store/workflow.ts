import { create } from 'zustand'
import type { GitHubWorkflow, VisualNode, VisualEdge } from '../types/github-actions'

interface WorkflowState {
  // Workflow data
  workflow: GitHubWorkflow
  nodes: VisualNode[]
  edges: VisualEdge[]
  
  // UI state
  selectedNode: string | null
  isValid: boolean
  errors: string[]
  
  // Actions
  setWorkflow: (workflow: GitHubWorkflow) => void
  updateWorkflow: (updates: Partial<GitHubWorkflow>) => void
  addNode: (node: VisualNode) => void
  updateNode: (id: string, updates: Partial<VisualNode>) => void
  removeNode: (id: string) => void
  addEdge: (edge: VisualEdge) => void
  removeEdge: (id: string) => void
  setSelectedNode: (id: string | null) => void
  validateWorkflow: () => void
  clearWorkflow: () => void
}

// Default workflow structure
const defaultWorkflow: GitHubWorkflow = {
  name: 'CI',
  on: {
    push: {
      branches: ['main']
    },
    pull_request: {
      branches: ['main']
    }
  },
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [
        {
          name: 'Checkout code',
          uses: 'actions/checkout@v4'
        }
      ]
    }
  }
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  workflow: defaultWorkflow,
  nodes: [],
  edges: [],
  selectedNode: null,
  isValid: true,
  errors: [],

  // Actions
  setWorkflow: (workflow) => {
    set({ workflow })
    get().validateWorkflow()
  },

  updateWorkflow: (updates) => {
    set(state => ({ 
      workflow: { ...state.workflow, ...updates } 
    }))
    get().validateWorkflow()
  },

  addNode: (node) => {
    set(state => ({
      nodes: [...state.nodes, node]
    }))
  },

  updateNode: (id, updates) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, ...updates } : node
      )
    }))
  },

  removeNode: (id) => {
    set(state => ({
      nodes: state.nodes.filter(node => node.id !== id),
      edges: state.edges.filter(edge => edge.source !== id && edge.target !== id),
      selectedNode: state.selectedNode === id ? null : state.selectedNode
    }))
  },

  addEdge: (edge) => {
    set(state => ({
      edges: [...state.edges, edge]
    }))
  },

  removeEdge: (id) => {
    set(state => ({
      edges: state.edges.filter(edge => edge.id !== id)
    }))
  },

  setSelectedNode: (id) => {
    set({ selectedNode: id })
  },

  validateWorkflow: () => {
    const { workflow } = get()
    const errors: string[] = []

    // Basic validation
    if (!workflow.name) {
      errors.push('Workflow name is required')
    }

    if (!workflow.on || Object.keys(workflow.on).length === 0) {
      errors.push('At least one trigger is required')
    }

    if (!workflow.jobs || Object.keys(workflow.jobs).length === 0) {
      errors.push('At least one job is required')
    }

    // Validate jobs
    Object.entries(workflow.jobs).forEach(([jobId, job]) => {
      if (!job['runs-on']) {
        errors.push(`Job '${jobId}' must specify runs-on`)
      }

      if (!job.steps || job.steps.length === 0) {
        errors.push(`Job '${jobId}' must have at least one step`)
      }

      job.steps.forEach((step, index) => {
        if (!step.name && !step.uses && !step.run) {
          errors.push(`Step ${index + 1} in job '${jobId}' must have a name, uses, or run property`)
        }
      })
    })

    set({ 
      isValid: errors.length === 0,
      errors 
    })
  },

  clearWorkflow: () => {
    set({
      workflow: defaultWorkflow,
      nodes: [],
      edges: [],
      selectedNode: null,
      isValid: true,
      errors: []
    })
  }
}))
