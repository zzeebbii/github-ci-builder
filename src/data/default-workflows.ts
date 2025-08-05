import type { GitHubWorkflow } from "../types/github-actions";

/**
 * Default workflow templates for the GitHub CI Builder
 */

export const DEFAULT_WORKFLOW: GitHubWorkflow = {
  name: "🚀 CI/CD Pipeline",
  on: {
    push: {
      branches: ["main"],
    },
    pull_request: {
      branches: ["main"],
    },
    workflow_dispatch: {},
  },
  jobs: {
    test: {
      name: "🧪 Run Tests",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "⚙️ Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "18",
            cache: "npm",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "npm ci",
        },
        {
          name: "🔍 Run tests",
          run: "npm test",
        },
      ],
    },
    lint: {
      name: "✨ Code Quality",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "⚙️ Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "18",
            cache: "npm",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "npm ci",
        },
        {
          name: "🔧 Run ESLint",
          run: "npm run lint",
        },
        {
          name: "💄 Check formatting",
          run: "npm run format:check",
        },
      ],
    },
    build: {
      name: "🏗️ Build Application",
      "runs-on": "ubuntu-latest",
      needs: ["test", "lint"],
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "⚙️ Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "18",
            cache: "npm",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "npm ci",
        },
        {
          name: "🔨 Build project",
          run: "npm run build",
        },
        {
          name: "📤 Upload artifacts",
          uses: "actions/upload-artifact@v4",
          with: {
            name: "build-artifacts",
            path: "dist/",
          },
        },
      ],
    },
    deploy: {
      name: "🚀 Deploy to Production",
      "runs-on": "ubuntu-latest",
      needs: ["build"],
      if: "github.ref == 'refs/heads/main'",
      steps: [
        {
          name: "📥 Download artifacts",
          uses: "actions/download-artifact@v4",
          with: {
            name: "build-artifacts",
            path: "dist/",
          },
        },
        {
          name: "🚀 Deploy to server",
          run: "echo 'Deploying to production server...'",
        },
        {
          name: "🏥 Health check",
          run: "curl -f https://myapp.com/health",
        },
        {
          name: "📢 Notify team",
          run: "echo 'Deployment successful! 🎉'",
        },
      ],
    },
  },
};

/**
 * Simple workflow template for basic use cases
 */
export const SIMPLE_WORKFLOW: GitHubWorkflow = {
  name: "🚀 Simple CI/CD",
  on: {
    push: {
      branches: ["main"],
    },
    pull_request: {
      branches: ["main"],
    },
    workflow_dispatch: {},
  },
  jobs: {
    test: {
      name: "🧪 Run Tests",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "⚙️ Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "18",
            cache: "npm",
          },
        },
        {
          name: "🔍 Run tests",
          run: "npm test",
        },
      ],
    },
    lint: {
      name: "✨ Code Quality",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "🔧 Run ESLint",
          run: "npm run lint",
        },
      ],
    },
    build: {
      name: "🏗️ Build App",
      "runs-on": "ubuntu-latest",
      needs: ["test", "lint"],
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "🔨 Build project",
          run: "npm run build",
        },
      ],
    },
    deploy: {
      name: "🚀 Deploy",
      "runs-on": "ubuntu-latest",
      needs: ["build"],
      steps: [
        {
          name: "🚀 Deploy to server",
          run: "echo 'Deploying...'",
        },
      ],
    },
  },
};

/**
 * Additional workflow templates for different use cases
 */
export const WORKFLOW_TEMPLATES = {
  default: DEFAULT_WORKFLOW,
  simple: SIMPLE_WORKFLOW,
} as const;

export type WorkflowTemplateKey = keyof typeof WORKFLOW_TEMPLATES;
