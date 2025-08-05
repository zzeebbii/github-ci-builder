# GitHub CI Builder - Quick Development Guide

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Key Files to Know

### Core Logic

- `src/utils/workflow-mapper.ts` - YAML ↔ Visual conversion
- `src/store/workflow.ts` - Main state management
- `src/store/history.ts` - Undo/redo system
- `src/data/default-workflows.ts` - Default workflow templates

### Main Components

- `src/components/views/BuilderView.tsx` - Main editor view
- `src/components/WorkflowCanvas.tsx` - React Flow canvas
- `src/components/nodes/` - All node components
- `src/components/properties/` - Property panels

### Types

- `src/types/github-actions.ts` - All TypeScript interfaces

## 🎯 Common Development Tasks

### Adding New Workflow Templates
1. Add new template to `src/data/default-workflows.ts`
2. Export it in `WORKFLOW_TEMPLATES` object
3. Update `WorkflowTemplateKey` type
4. Consider adding template selector UI

### Adding a New Node Type

1. Create component in `src/components/nodes/`
2. Add type to `VisualNode` interface
3. Update `workflow-mapper.ts` conversion logic
4. Create properties panel in `src/components/properties/`
5. Add to node catalog in sidebar

### Modifying Layout

- Edit constants in `workflow-mapper.ts`:
  ```typescript
  const jobSpacing = 400; // Horizontal spacing
  const stepHeight = 120; // Vertical spacing
  const jobStartY = 300; // Job start position
  ```

### Adding New Edge Types

1. Update `VisualEdge` interface
2. Modify edge creation in `yamlToVisual()`
3. Add styling in `WorkflowCanvas.tsx`
4. Update animation logic if needed

### State Management

```typescript
// Get state
const nodes = useWorkflowStore((state) => state.nodes);

// Update with history
useHistoryStore.getState().addAction({
  type: "update_node",
  description: "Description of change",
  data: { workflow, nodes, edges },
});
```

## 🎨 Layout System

### Current Constants

```typescript
triggerY: 50; // Trigger Y position
jobStartY: 300; // Jobs start Y
jobSpacing: 400; // Job horizontal spacing
stepHeight: 120; // Step vertical spacing
jobToStepSpacing: 150; // Job to first step gap
```

### Node Positioning

- **Jobs**: Ordered left-to-right (independent first, dependent second)
- **Steps**: Center-aligned under jobs, waterfall layout
- **Triggers**: Centered relative to all jobs

## 🔧 Debugging Tips

### Common Issues

1. **Nodes not positioning correctly**: Check `applyWaterfallLayout()` logic
2. **Edges not connecting**: Verify `sourceHandle` and `targetHandle` IDs
3. **Animation not working**: Check `animatedEdges` Set in workflow store
4. **Properties not updating**: Ensure React keys are set properly

### Useful Debug Commands

```javascript
// In browser console
useWorkflowStore.getState().nodes; // Check current nodes
useWorkflowStore.getState().edges; // Check current edges
useWorkflowStore.getState().animatedEdges; // Check animated edges
```

## 📝 Code Patterns

### Component Structure

```typescript
import { memo } from "react";
import { useWorkflowStore } from "../../store/workflow";

function MyComponent({ data, id }) {
  const updateNode = useWorkflowStore((state) => state.updateNode);

  const handleChange = (updates) => {
    updateNode(id, updates);
  };

  return <div onClick={handleChange}>{/* Component content */}</div>;
}

export default memo(MyComponent);
```

### Adding History Tracking

```typescript
// Before making changes
const currentWorkflow = get().workflow;
const currentNodes = get().nodes;
const currentEdges = get().edges;

// Add to history
useHistoryStore.getState().addAction({
  type: "action_type",
  description: "What changed",
  data: { workflow: currentWorkflow, nodes: currentNodes, edges: currentEdges },
});

// Make the change
set(newState);
```

## 🎯 Testing Checklist

### Before Committing

- [ ] All TypeScript errors resolved
- [ ] Layout looks correct with sample workflow
- [ ] Edge animations work properly
- [ ] Properties panels update correctly
- [ ] Undo/redo functions properly
- [ ] YAML export is valid
- [ ] No console errors

### Test Scenarios

1. Load default workflow
2. Add/remove nodes and edges
3. Test edge animations by clicking jobs
4. Use undo/redo extensively
5. Import/export YAML workflows
6. Test properties panel updates

## 🔄 Update This Guide

When making significant changes, update:

- [ ] `PROJECT_CONTEXT.md` (comprehensive documentation)
- [ ] This quick guide
- [ ] Commit with clear message following conventional commits

---

_Quick Reference - Last Updated: August 5, 2025_
