import { useState, useCallback, useEffect } from "react";
import {
  Play,
  Upload,
  Save,
  Undo,
  Redo,
  Settings,
  Code2,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkflowStore } from "../../store/workflow";
import { useHistoryStore } from "../../store/history";
import Sidebar from "../layout/Sidebar";
import WorkflowCanvas from "../WorkflowCanvas";
import Button from "../ui/Button";
import ToolbarSeparator from "../ui/ToolbarSeparator";
import PropertiesPanel from "../PropertiesPanel";
import CodeSidebar from "../CodeSidebar";
import HistoryPanel from "../HistoryPanel";

export default function BuilderView() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showCodeSidebar, setShowCodeSidebar] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {
    selectedNode,
    showWorkflowProperties,
    setShowWorkflowProperties,
    clearEdgeAnimations,
  } = useWorkflowStore();
  const { canUndo, canRedo, undo, redo, history } = useHistoryStore();

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Clear edge animations on Escape key
      if (event.key === "Escape") {
        clearEdgeAnimations();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [clearEdgeAnimations]);

  // Automatically show left properties panel when there's something to show
  const showPropertiesLeft = !!(selectedNode || showWorkflowProperties);

  const handleWorkflowSettings = useCallback(() => {
    setShowWorkflowProperties(true);
  }, [setShowWorkflowProperties]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const handleUndo = useCallback(() => {
    undo(); // The history store now automatically restores state
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo(); // The history store now automatically restores state
  }, [redo]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <main className="flex-1 flex flex-col bg-gray-50 relative">
        {/* Toolbar */}
        <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="primary">
              <Play className="w-4 h-4" />
              Test Workflow
            </Button>

            <ToolbarSeparator />

            <Button onClick={handleWorkflowSettings}>
              <Settings className="w-4 h-4" />
              Workflow Settings
            </Button>

            <ToolbarSeparator />

            <Link to="/import">
              <Button>
                <Upload className="w-4 h-4" />
                Import YAML
              </Button>
            </Link>

            <Button
              onClick={() => setShowCodeSidebar(!showCodeSidebar)}
              variant={showCodeSidebar ? "primary" : "secondary"}
            >
              <Code2 className="w-4 h-4" />
              {showCodeSidebar ? "Hide Code" : "Show Code"}
            </Button>

            <Button
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              variant={showHistoryPanel ? "primary" : "secondary"}
              title="Action History"
            >
              <History className="w-4 h-4" />
              History
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                  {history.length}
                </span>
              )}
            </Button>

            <ToolbarSeparator />

            <Button>
              <Save className="w-4 h-4" />
              Save
            </Button>

            <Button
              size="sm"
              title="Undo"
              onClick={handleUndo}
              disabled={!canUndo()}
            >
              <Undo className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              title="Redo"
              onClick={handleRedo}
              disabled={!canRedo()}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className={`flex-1 relative transition-all duration-300 ${
            showCodeSidebar ? "mr-96" : ""
          } ${showPropertiesLeft ? "ml-80" : ""}`}
        >
          <WorkflowCanvas />
        </div>

        {/* Left Properties Panel - Positioned next to sidebar */}
        {showPropertiesLeft && (
          <div
            className={`fixed top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 shadow-lg z-40 overflow-hidden transition-all duration-300 ${
              isSidebarCollapsed ? "left-12" : "left-64"
            }`}
          >
            <PropertiesPanel position="left" />
          </div>
        )}

        {/* Right Properties Panel - Hidden since we always use left now */}

        {/* Code Sidebar */}
        <CodeSidebar
          isVisible={showCodeSidebar}
          onToggle={() => setShowCodeSidebar(!showCodeSidebar)}
        />

        {/* History Panel */}
        <HistoryPanel
          isVisible={showHistoryPanel}
          onToggle={() => setShowHistoryPanel(!showHistoryPanel)}
        />
      </main>
    </div>
  );
}
