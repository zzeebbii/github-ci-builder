import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from "@xyflow/react";
import type { Connection } from "@xyflow/react";

// Sample initial nodes for demonstration
const initialNodes = [
  {
    id: "1",
    type: "default",
    position: { x: 250, y: 25 },
    data: {
      label: "Workflow Trigger",
    },
    style: {
      background: "#e0f2fe",
      border: "2px solid #0277bd",
      borderRadius: "8px",
      padding: "10px",
    },
  },
  {
    id: "2",
    type: "default",
    position: { x: 250, y: 125 },
    data: {
      label: "Build Job",
    },
    style: {
      background: "#f3e5f5",
      border: "2px solid #7b1fa2",
      borderRadius: "8px",
      padding: "10px",
    },
  },
  {
    id: "3",
    type: "default",
    position: { x: 250, y: 225 },
    data: {
      label: "Test Job",
    },
    style: {
      background: "#e8f5e8",
      border: "2px solid #388e3c",
      borderRadius: "8px",
      padding: "10px",
    },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#0277bd" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    style: { stroke: "#7b1fa2" },
  },
];

export default function WorkflowCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-gray-50"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.style?.background) {
              return node.style.background as string;
            }
            return "#e2e8f0";
          }}
          className="!bg-white !border !border-gray-200"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      {/* Placeholder for when no workflow is loaded */}
      {nodes.length === 3 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-medium mb-2">
              Start Building Your Workflow
            </h3>
            <p className="text-sm">
              Drag components from the sidebar or import an existing YAML file
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
