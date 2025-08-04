import { 
  Workflow, 
  Zap, 
  PlayCircle, 
  Package, 
  Terminal, 
  GitPullRequest,
  Clock,
  Layers,
  Code
} from 'lucide-react'

interface SidebarProps {
  selectedTool: string | null
  onToolSelect: (tool: string | null) => void
}

const toolCategories = [
  {
    title: 'Triggers',
    items: [
      { id: 'push', icon: GitPullRequest, label: 'Push', description: 'On push to repository' },
      { id: 'pull_request', icon: GitPullRequest, label: 'Pull Request', description: 'On pull request events' },
      { id: 'schedule', icon: Clock, label: 'Schedule', description: 'Cron-based triggers' },
      { id: 'workflow_dispatch', icon: PlayCircle, label: 'Manual', description: 'Manual workflow trigger' },
    ]
  },
  {
    title: 'Jobs & Steps',
    items: [
      { id: 'job', icon: Workflow, label: 'Job', description: 'Create a new job' },
      { id: 'action', icon: Package, label: 'Action', description: 'Use an existing action' },
      { id: 'run', icon: Terminal, label: 'Run Script', description: 'Execute shell commands' },
      { id: 'setup', icon: Layers, label: 'Setup', description: 'Environment setup actions' },
    ]
  },
  {
    title: 'Advanced',
    items: [
      { id: 'matrix', icon: Code, label: 'Matrix', description: 'Matrix build strategy' },
      { id: 'environment', icon: Zap, label: 'Environment', description: 'Deployment environment' },
    ]
  }
]

export default function Sidebar({ selectedTool, onToolSelect }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Workflow Components
        </h2>
        
        <div className="space-y-6">
          {toolCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {category.title}
              </h3>
              
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const isSelected = selectedTool === item.id
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onToolSelect(isSelected ? null : item.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-primary-50 border-primary-200 text-primary-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-4 h-4 mt-0.5 ${
                          isSelected ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
