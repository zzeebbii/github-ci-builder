# 🚀 GitHub CI Builder

A powerful visual drag-and-drop workflow designer for GitHub Actions. Design workflows using an intuitive node-based interface, then export them as GitHub Actions YAML files. Import existing workflows to visualize and modify them effortlessly.

![GitHub CI Builder](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7+-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 🎨 **Visual Workflow Designer**
- **Drag-and-drop interface** with intuitive node-based design
- **Real-time visual feedback** with animated edges and connections
- **Smart auto-layout** with waterfall positioning and dependency-aware ordering
- **Interactive edge animations** to visualize job relationships

### 🔄 **Bidirectional Conversion**
- **YAML to Visual**: Import existing GitHub Actions workflows and render them visually
- **Visual to YAML**: Export your visual designs as valid GitHub Actions YAML
- **Real-time preview** with Monaco Editor integration

### 🎯 **Intelligent Features**
- **Schema validation** with real-time GitHub Actions rule checking
- **Connection validation** to prevent invalid workflow structures
- **Auto-complete** with 300+ popular GitHub Actions
- **Property panels** for configuring triggers, jobs, and steps

### 🛠️ **Developer Experience**
- **Undo/redo system** with visual history tracking
- **Collapsible sidebars** for optimal workspace usage
- **Keyboard shortcuts** for efficient workflow building
- **Professional code editor** with syntax highlighting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/zzeebbii/github-ci-builder.git
cd github-ci-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🎯 How It Works

### 1. **Start with Templates**
Choose from pre-built workflow templates or start from scratch:
- 🚀 **Default CI/CD Pipeline**: Full-featured workflow with testing, linting, building, and deployment
- ✨ **Simple Workflow**: Minimal setup for basic CI/CD needs

### 2. **Design Visually**
- **Drag nodes** from the sidebar (Triggers, Jobs, Steps)
- **Connect nodes** to define dependencies and flow
- **Configure properties** using the automated properties panel
- **See real-time validation** with visual error indicators

### 3. **Workflow Structure**
```
🎯 Triggers (push, PR, manual, schedule)
    ↓
🏗️ Jobs (run in parallel or with dependencies)
    ↓
📋 Steps (sequential actions within jobs)
```

### 4. **Export & Use**
- **Copy YAML** directly from the code editor
- **Download** as `.yml` file
- **Import existing** workflows to modify visually

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Vite 7.0.6 with HMR
- **Styling**: Tailwind CSS with responsive design
- **Node Editor**: React Flow (@xyflow/react)
- **State Management**: Zustand with persistence
- **Code Editor**: Monaco Editor with GitHub Actions syntax
- **Validation**: Zod with comprehensive GitHub Actions schema
- **Icons**: Lucide React with consistent design system

### Key Components
```
src/
├── components/
│   ├── nodes/           # TriggerNode, JobNode, StepNode
│   ├── properties/      # Configuration panels
│   └── views/          # Main editor and import views
├── data/
│   └── default-workflows.ts  # Workflow templates
├── store/
│   ├── workflow.ts     # Main state management
│   └── history.ts      # Undo/redo system
├── utils/
│   └── workflow-mapper.ts    # YAML ↔ Visual conversion
└── types/
    └── github-actions.ts     # Comprehensive type definitions
```

## 🎨 Visual Design Features

### Node Types
- **🎯 Trigger Nodes**: Workflow triggers (push, PR, schedule, manual)
- **🏗️ Job Nodes**: Individual jobs with runner configuration
- **📋 Step Nodes**: Individual steps within jobs

### Smart Layout
- **Dependency-aware ordering**: Independent jobs first, dependent jobs follow
- **Waterfall layout**: Steps cascade cleanly under their parent jobs
- **Center alignment**: Professional visual hierarchy
- **Optimal spacing**: 120px step spacing, 400px job spacing

### Interactive Features
- **Click job nodes** to animate connected edges
- **Exclusive selection** - only one job's edges animate at a time
- **Color-coded connections**:
  - 🟢 Green: Step flow (solid lines)
  - 🟣 Purple: Job dependencies (dashed lines)
  - 🔵 Blue: Trigger connections (solid lines)
  - 🟠 Orange: Animated selection (glowing lines)

## 📚 Example Workflows

### Simple CI/CD Pipeline
```yaml
name: 🚀 CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: 🧪 Run Tests
    runs-on: ubuntu-latest
    # ... steps

  lint:
    name: ✨ Code Quality  
    runs-on: ubuntu-latest
    # ... steps

  build:
    name: 🏗️ Build Application
    needs: [test, lint]
    # ... steps

  deploy:
    name: 🚀 Deploy to Production
    needs: [build]
    # ... steps
```

## 🛠️ Development

### Getting Started
```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Project Structure
- See `PROJECT_CONTEXT.md` for comprehensive documentation
- See `DEVELOPMENT_GUIDE.md` for development instructions
- All major components are documented with TypeScript interfaces

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📋 Roadmap

### Current Features ✅
- [x] Visual workflow designer with drag-and-drop
- [x] Bidirectional YAML ↔ Visual conversion
- [x] Real-time validation and error checking
- [x] Undo/redo system with visual history
- [x] Monaco Editor integration
- [x] Responsive design with collapsible panels
- [x] Edge animation system for job relationships
- [x] Template system with default workflows

### Upcoming Features 🚧
- [ ] Workflow template gallery
- [ ] Advanced validation rules
- [ ] Collaboration features
- [ ] Export to multiple formats
- [ ] Workflow testing and simulation
- [ ] Integration with GitHub API
- [ ] Custom action marketplace integration

## 🤝 Support

- 📖 **Documentation**: Check `PROJECT_CONTEXT.md` and `DEVELOPMENT_GUIDE.md`
- 🐛 **Issues**: Report bugs or request features via GitHub Issues
- 💬 **Discussions**: Join discussions for questions and ideas

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Built with [React Flow](https://reactflow.dev/) for the visual node editor
- Powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for the GitHub Actions community**

*Transform your CI/CD workflows from code to visual and back again!* 🚀
