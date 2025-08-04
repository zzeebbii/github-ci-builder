import { useState } from 'react'
import { Play, Download, Upload, Save, Undo, Redo } from 'lucide-react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import WorkflowCanvas from './components/WorkflowCanvas'

function App() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  return (
    <div className="workflow-builder">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedTool={selectedTool} onToolSelect={setSelectedTool} />
        
        <main className="flex-1 flex flex-col bg-gray-50">
          {/* Toolbar */}
          <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <Play className="w-4 h-4" />
              Test Workflow
            </button>
            
            <div className="h-4 w-px bg-gray-300 mx-2" />
            
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import YAML
            </button>
            
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export YAML
            </button>
            
            <div className="h-4 w-px bg-gray-300 mx-2" />
            
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Save className="w-4 h-4" />
              Save
            </button>
            
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Undo className="w-4 h-4" />
            </button>
            
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Redo className="w-4 h-4" />
            </button>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 relative">
            <WorkflowCanvas />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
