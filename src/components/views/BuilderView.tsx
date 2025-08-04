import { useState } from "react";
import { Play, Download, Upload, Save, Undo, Redo } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import WorkflowCanvas from "../WorkflowCanvas";
import Button from "../ui/Button";
import ToolbarSeparator from "../ui/ToolbarSeparator";
import PropertiesPanel from "../layout/PropertiesPanel";

export default function BuilderView() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar selectedTool={selectedTool} onToolSelect={setSelectedTool} />

      <main className="flex-1 flex flex-col bg-gray-50">
        {/* Toolbar */}
        <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="primary">
              <Play className="w-4 h-4" />
              Test Workflow
            </Button>

            <ToolbarSeparator />

            <Link to="/import">
              <Button>
                <Upload className="w-4 h-4" />
                Import YAML
              </Button>
            </Link>

            <Link to="/export">
              <Button>
                <Download className="w-4 h-4" />
                Export YAML
              </Button>
            </Link>

            <ToolbarSeparator />

            <Button>
              <Save className="w-4 h-4" />
              Save
            </Button>

            <Button size="sm" title="Undo">
              <Undo className="w-4 h-4" />
            </Button>

            <Button size="sm" title="Redo">
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showPropertiesPanel ? "primary" : "secondary"}
              onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
            >
              Properties
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <WorkflowCanvas />
          </div>

          {showPropertiesPanel && (
            <div className="w-80 border-l bg-white">
              <PropertiesPanel onClose={() => setShowPropertiesPanel(false)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
