import { useState } from "react";
import { useHistoryStore } from "../store/history";
import {
  History,
  Undo,
  Redo,
  X,
  Clock,
  Plus,
  Minus,
  Edit,
  Upload,
  LayoutGrid,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface HistoryPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function HistoryPanel({
  isVisible,
  onToggle,
}: HistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    history,
    currentIndex,
    canUndo,
    canRedo,
    undo,
    redo,
    jumpToAction,
    clearHistory,
  } = useHistoryStore();

  const getActionIcon = (type: string) => {
    switch (type) {
      case "add_node":
        return <Plus className="w-3 h-3 text-green-600" />;
      case "remove_node":
        return <Minus className="w-3 h-3 text-red-600" />;
      case "update_node":
        return <Edit className="w-3 h-3 text-blue-600" />;
      case "add_edge":
        return <Plus className="w-3 h-3 text-purple-600" />;
      case "remove_edge":
        return <Minus className="w-3 h-3 text-purple-600" />;
      case "update_workflow":
        return <Settings className="w-3 h-3 text-gray-600" />;
      case "import_workflow":
        return <Upload className="w-3 h-3 text-indigo-600" />;
      case "arrange_nodes":
        return <LayoutGrid className="w-3 h-3 text-orange-600" />;
      default:
        return <Edit className="w-3 h-3 text-gray-600" />;
    }
  };

  const handleUndo = () => {
    undo(); // The history store now automatically restores state
  };

  const handleRedo = () => {
    redo(); // The history store now automatically restores state
  };

  const handleJumpToAction = (index: number) => {
    jumpToAction(index); // The history store now automatically restores state
  };

  if (!isVisible) {
    return null;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className={`fixed top-16 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-30 transition-all duration-300 flex flex-col ${
        isExpanded ? "h-96" : "h-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Action History</h3>
          <span className="text-xs text-gray-500">({history.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Undo/Redo buttons */}
          <button
            onClick={handleUndo}
            disabled={!canUndo()}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <Undo className="w-3 h-3 text-gray-600" />
          </button>

          <button
            onClick={handleRedo}
            disabled={!canRedo()}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <Redo className="w-3 h-3 text-gray-600" />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronDown className="w-3 h-3 text-gray-600" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Close History"
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Expanded History List */}
      {isExpanded && (
        <div className="flex-1 overflow-hidden min-h-0">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No actions yet</p>
              <p className="text-xs">Start editing to see history</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="p-2 space-y-1">
                {history.map((action, index) => {
                  const isCurrentIndex = index === currentIndex;
                  const isFutureAction = index > currentIndex;

                  return (
                    <div
                      key={action.id}
                      className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                        isCurrentIndex
                          ? "bg-blue-100 border border-blue-200"
                          : isFutureAction
                          ? "bg-gray-50 opacity-60 hover:opacity-80"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleJumpToAction(index)}
                    >
                      {/* Action Icon */}
                      <div className="flex-shrink-0">
                        {getActionIcon(action.type)}
                      </div>

                      {/* Action Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-900 font-medium truncate">
                          {action.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(action.timestamp)}
                        </div>
                      </div>

                      {/* Current Indicator */}
                      {isCurrentIndex && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          {history.length > 0 && (
            <div className="border-t border-gray-200 p-2 flex-shrink-0">
              <button
                onClick={clearHistory}
                className="w-full text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
