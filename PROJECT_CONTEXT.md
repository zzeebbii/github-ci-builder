# GitHub CI Builder - Project Context

## 📋 Project Overview

**GitHub CI Builder** is a visual drag-and-drop workflow designer for GitHub Actions. Users can design workflows using nodes and connections, then export them as GitHub Actions YAML files. The tool also supports importing existing YAML workflows and rendering them visually.

### Core Features

- 🎨 **Visual Workflow Designer**: Drag-and-drop interface with nodes and connections
- 🔄 **Bidirectional Conversion**: YAML ↔ Visual representation
- 🎯 **Real-time Validation**: GitHub Actions schema validation
- 🖥️ **Code Editor**: Monaco Editor integration with syntax highlighting
- 📚 **Properties Panels**: Configure triggers, jobs, and steps
- ⏪ **Undo/Redo System**: Track changes with visual history
- 🎭 **Edge Animation**: Interactive job relationship visualization
- 📐 **Auto-layout**: Waterfall positioning with dependency-aware ordering

## 🏗️ Technical Architecture

### Frontend Stack

- **React 18+** with TypeScript (strict mode)
- **Vite 7.0.6** - Build tool and dev server
- **Tailwind CSS** - Styling with @tailwindcss/vite plugin
- **React Flow (@xyflow/react)** - Node-based visual interface
- **Zustand** - State management
- **Monaco Editor (@monaco-editor/react)** - Code editor
- **React Hook Form + Zod** - Form handling and validation
- **js-yaml** - YAML parsing and serialization
- **Lucide React** - Icon library

### Project Structure

```
src/
├── components/
│   ├── layout/           # Header, Sidebar
│   ├── views/            # BuilderView, ImportView
│   ├── nodes/            # TriggerNode, JobNode, StepNode
│   ├── properties/       # Property panels for each node type
│   └── ui/               # Reusable UI components
├── data/
│   └── default-workflows.ts # Default workflow templates with icons
├── store/
│   ├── workflow.ts       # Main workflow state (Zustand)
│   └── history.ts        # Undo/redo system
├── types/
│   └── github-actions.ts # Comprehensive GitHub Actions TypeScript interfaces
├── utils/
│   └── workflow-mapper.ts # YAML ↔ Visual conversion logic
└── styles/
    └── globals.css       # Global styles and Tailwind imports
```

## 🎯 Current State (as of Latest Commit)

### Recent Major Enhancements

1. **Refactored Default Workflows** (Commit: ae5d59d)
   - Created `src/data/default-workflows.ts` with centralized workflow templates
   - Added engaging icons (🚀🧪✨🏗️📥⚙️🔍🔧💄🔨📤🏥📢) to all names
   - Simplified default workflow to 4 jobs with clear dependency structure:
     - `test` and `lint` run in parallel (independent jobs)
     - `build` depends on both `test` and `lint`
     - `deploy` depends on `build`
   - Support for multiple workflow templates (DEFAULT_WORKFLOW, SIMPLE_WORKFLOW)

2. **Enhanced Workflow Layout** (Commit: 006ec0a)
   - Job ordering: Independent jobs render first (left), dependent jobs second (right)
   - Step node spacing: 120px vertical distance for optimal readability
   - Center-aligned step nodes under parent jobs

3. **Fixed Edge Animation System**
   - Resolved selection bug where clicking job nodes didn't properly toggle animations
   - Exclusive selection: only one job can have animated edges at a time
   - Bidirectional animation for job-to-job connections with visual feedback

4. **Refined Data Structure**
   - Complete action name extraction and display in step nodes
   - Proper handling of action versions, run commands, shell, working directory, etc.

```
src/
├── components/
│   ├── layout/           # Header, Sidebar
│   ├── views/            # BuilderView, ImportView
│   ├── nodes/            # TriggerNode, JobNode, StepNode
│   ├── properties/       # Property panels for each node type
│   └── ui/               # Reusable UI components
├── store/
│   ├── workflow.ts       # Main workflow state (Zustand)
│   └── history.ts        # Undo/redo system
├── types/
│   └── github-actions.ts # Comprehensive GitHub Actions TypeScript interfaces
├── utils/
│   └── workflow-mapper.ts # YAML ↔ Visual conversion logic
└── styles/
    └── globals.css       # Global styles and Tailwind imports
```

## 🎯 Current State (as of Latest Commit)

### Recent Major Enhancements

1. **Enhanced Workflow Layout** (Commit: 006ec0a)
   - Job ordering: Independent jobs render first (left), dependent jobs second (right)
   - Step node spacing: 120px vertical distance for optimal readability
   - Center-aligned step nodes under parent jobs

2. **Fixed Edge Animation System**
   - Resolved selection bug where clicking job nodes didn't properly toggle animations
   - Exclusive selection: only one job can have animated edges at a time
   - Bidirectional animation for job-to-job connections with visual feedback

3. **Refined Data Structure**
   - Complete action name extraction and display in step nodes
   - Proper handling of action versions, run commands, shell, working directory, etc.

### Key Layout Constants

```typescript
// Positioning constants in workflow-mapper.ts
const triggerY = 50; // Trigger node Y position
const jobStartY = 300; // Job nodes start Y (increased spacing)
const jobSpacing = 400; // Horizontal space between jobs
const stepHeight = 120; // Vertical space between steps
const jobToStepSpacing = 150; // Job to first step spacing
```

### Component Hierarchy

```
App
├── Header (navigation)
├── Sidebar (drag-and-drop tools, collapsible)
├── BuilderView
│   ├── WorkflowCanvas (React Flow)
│   │   ├── TriggerNode (click disabled)
│   │   ├── JobNode (click for edge animation)
│   │   └── StepNode (center-aligned)
│   ├── PropertiesPanel (automated, left-side)
│   └── CodeSidebar (Monaco Editor, collapsible)
└── HistoryPanel (undo/redo with action count)
```

## 🔧 State Management

### Workflow Store (Zustand)

- **Primary State**: `workflow`, `nodes`, `edges`, `selectedNode`
- **Animation State**: `animatedEdges: Set<string>` for exclusive selection
- **UI State**: `showWorkflowProperties`, validation results, toast messages
- **Actions**: CRUD operations with history tracking integration

### History Store

- **Undo/Redo System**: 50-action limit with 500ms deduplication
- **Action Types**: add_node, update_node, remove_node, add_edge, update_workflow
- **Integration**: Automatic history tracking on all state-changing operations

## 🎨 Visual Design System

### Node Types & Styling

1. **TriggerNode**: Blue theme, positioned at top center relative to jobs
2. **JobNode**: Purple theme with orange animation state, hover effects
3. **StepNode**: Green theme, center-aligned under jobs, shows action names

### Edge Types & Styling

1. **Step Flow**: Green solid lines (`#10b981`, 2px width)
2. **Job Dependencies**: Purple dashed lines (`#8b5cf6`, 3px width, "8,4" dash)
3. **Trigger Connections**: Blue solid lines (`#3b82f6`, 2px width)
4. **Animated Edges**: Orange with glow effect (`#ff6b35`, 5px width)

### Layout Algorithm

- **Waterfall Layout**: Jobs arranged horizontally, steps cascade vertically
- **Dependency-Aware Ordering**: Independent jobs first, dependent jobs second
- **Center Alignment**: Triggers centered relative to all jobs, steps centered under jobs

## 🔍 Key Features Deep Dive

### 1. YAML ↔ Visual Conversion

**File**: `src/utils/workflow-mapper.ts`

- **yamlToVisual()**: Converts GitHub Actions YAML to visual nodes/edges
- **visualToYaml()**: Converts visual representation back to YAML
- **applyWaterfallLayout()**: Consistent positioning algorithm
- **Step Data Mapping**: Extracts actionName, actionVersion, runCommand, etc.

### 2. Edge Animation System

**Files**: `src/store/workflow.ts`, `src/components/nodes/JobNode.tsx`

- **Exclusive Selection**: Only one job can have animated edges
- **Bidirectional Animation**: Shows both incoming and outgoing job-to-job connections
- **Visual Feedback**: Orange styling with glow, pulsing Zap icons
- **Toggle Logic**: Click to select/deselect, automatic clearing of previous selections

### 3. Properties Panel Automation

**File**: `src/components/properties/PropertiesPanel.tsx`

- **Auto-opens** when nodes are selected
- **Node-specific panels**: TriggerProperties, JobProperties, StepProperties
- **Workflow properties** when no node selected
- **Debounced updates** to prevent excessive re-renders

### 4. Validation System

- **Real-time validation** of GitHub Actions schema
- **Visual feedback** with error states and tooltips
- **Connection validation** to prevent invalid workflow structures

## 🐛 Known Issues & Solutions

### Recently Fixed

1. **Edge Animation Selection Bug** ✅
   - Issue: Clicking job nodes didn't properly toggle animations
   - Solution: Simplified toggleEdgeAnimation logic with explicit return statements

2. **Step Node Action Names** ✅
   - Issue: Action names not displaying in nodes or properties panel
   - Solution: Enhanced step data mapping with proper actionName extraction

3. **Layout Inconsistencies** ✅
   - Issue: Jobs and steps not properly aligned
   - Solution: Implemented consistent waterfall layout with center alignment

### Current State

- All major features are functional and tested
- No known critical bugs
- Performance is optimal for typical workflow sizes

## 📚 Development Patterns

### State Updates

```typescript
// Always use history tracking for state changes
useHistoryStore.getState().addAction({
  type: "update_node",
  description: `Updated ${nodeType}: ${nodeName}`,
  data: { workflow, nodes, edges },
});
```

### Component Patterns

```typescript
// Use memo for performance
export default memo(NodeComponent);

// Zustand state selection
const { nodes, edges, toggleEdgeAnimation } = useWorkflowStore(state => ({
  nodes: state.nodes,
  edges: state.edges,
  toggleEdgeAnimation: state.toggleEdgeAnimation,
}));
```

### Layout Updates

```typescript
// Always use WorkflowMapper for consistent positioning
const arrangedNodes = WorkflowMapper.applyWaterfallLayout(nodes);
```

## 🚀 Future Enhancement Areas

### Potential Improvements

1. **Workflow Templates**: Pre-built workflow templates for common use cases
2. **Advanced Validation**: More sophisticated GitHub Actions rule checking
3. **Export Options**: Multiple export formats (YAML, JSON, etc.)
4. **Collaboration**: Multi-user editing capabilities
5. **Performance**: Virtualization for large workflows
6. **Accessibility**: Enhanced keyboard navigation and screen reader support

### Technical Debt

- Consider migrating to React Query for better data management
- Implement proper error boundaries for better error handling
- Add comprehensive unit tests for critical components
- Consider WebWorkers for heavy YAML processing

## 📖 Development Guidelines

### Adding New Features

1. Update TypeScript interfaces in `types/github-actions.ts`
2. Extend workflow mapper if needed
3. Add history tracking for state changes
4. Update this context document
5. Add appropriate validation logic
6. Follow existing naming conventions

### Code Style

- Use TypeScript strict mode
- Follow React best practices (hooks, memo, etc.)
- Prefer composition over inheritance
- Keep components focused and single-purpose
- Use descriptive commit messages with conventional commits format

### Testing Strategy

- Manual testing with complex workflows
- Edge case validation (empty workflows, circular dependencies)
- Performance testing with large node counts
- Cross-browser compatibility verification

## 📝 Maintenance Notes

### Regular Updates Needed

1. **This Context File**: Update after major features or architectural changes
2. **Dependencies**: Keep React Flow, Monaco Editor, and other core deps updated
3. **GitHub Actions Schema**: Update types when GitHub adds new features
4. **Performance Monitoring**: Watch for memory leaks in complex workflows

### Deployment Considerations

- Build optimization for production
- Environment-specific configurations
- CDN considerations for Monaco Editor assets
- Browser compatibility testing

---

## 🔄 Changelog

### v1.1.0 (Latest - Commit: ae5d59d)

- ✅ Refactored default workflows to separate file for better maintainability
- ✅ Added engaging icons to workflow, job, and step names for better UX
- ✅ Simplified default workflow to clear 4-job dependency structure
- ✅ Created template system supporting multiple workflow types
- ✅ Centralized workflow definitions in `src/data/default-workflows.ts`

### v1.0.0 (Commit: 006ec0a)

- ✅ Enhanced workflow layout with dependency-aware job ordering
- ✅ Fixed edge animation selection bug with exclusive selection
- ✅ Improved step node spacing (120px vertical distance)
- ✅ Center-aligned step nodes under parent jobs
- ✅ Complete step node data structure with action name extraction
- ✅ Bidirectional edge animation for job-to-job connections
- ✅ Enhanced connection styling with distinct colors for edge types

### Previous Major Milestones

- v0.9.0: Undo/redo system with visual history panel
- v0.8.0: Enhanced connection styling and waterfall layout
- v0.7.0: Auto-arrange algorithm and layout improvements
- v0.6.0: Properties panel automation and collapsible sidebars
- v0.5.0: Monaco Editor integration and code sidebar
- v0.4.0: Enhanced trigger node visualization and workflow properties
- v0.3.0: Connection validation and workflow logic
- v0.2.0: YAML import/export functionality
- v0.1.0: Basic node system with drag-and-drop

---

_Last Updated: August 5, 2025_
_Maintainer: Development Team_
_Next Review: After next major feature addition_
