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
 * Node.js CI workflow for testing and building Node.js applications
 */
export const NODEJS_CI_WORKFLOW: GitHubWorkflow = {
  name: "🟢 Node.js CI",
  on: {
    push: {
      branches: ["main", "develop"],
    },
    pull_request: {
      branches: ["main"],
    },
  },
  jobs: {
    test: {
      name: "🧪 Test on Node.js",
      "runs-on": "ubuntu-latest",
      strategy: {
        matrix: {
          "node-version": ["16", "18", "20"],
        },
      },
      steps: [
        {
          name: "📥 Checkout repository",
          uses: "actions/checkout@v4",
        },
        {
          name: "⚙️ Setup Node.js ${{ matrix.node-version }}",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "${{ matrix.node-version }}",
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
        {
          name: "🔧 Run linter",
          run: "npm run lint",
        },
      ],
    },
  },
};

/**
 * React application with GitHub Pages deployment
 */
export const REACT_DEPLOY_WORKFLOW: GitHubWorkflow = {
  name: "⚛️ React Deploy",
  on: {
    push: {
      branches: ["main"],
    },
    workflow_dispatch: {},
  },
  permissions: {
    contents: "read",
    pages: "write",
    "id-token": "write",
  },
  jobs: {
    build: {
      name: "🏗️ Build React App",
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
          name: "🔨 Build for production",
          run: "npm run build",
        },
        {
          name: "📤 Upload Pages artifact",
          uses: "actions/upload-pages-artifact@v3",
          with: {
            path: "./dist",
          },
        },
      ],
    },
    deploy: {
      name: "🚀 Deploy to GitHub Pages",
      "runs-on": "ubuntu-latest",
      needs: "build",
      environment: {
        name: "github-pages",
        url: "${{ steps.deployment.outputs.page_url }}",
      },
      steps: [
        {
          name: "🌐 Deploy to GitHub Pages",
          id: "deployment",
          uses: "actions/deploy-pages@v4",
        },
      ],
    },
  },
};

/**
 * Python application with testing and code quality checks
 */
export const PYTHON_TESTING_WORKFLOW: GitHubWorkflow = {
  name: "🐍 Python Testing",
  on: {
    push: {
      branches: ["main", "develop"],
    },
    pull_request: {
      branches: ["main"],
    },
  },
  jobs: {
    test: {
      name: "🧪 Test Python App",
      "runs-on": "ubuntu-latest",
      strategy: {
        matrix: {
          "python-version": ["3.9", "3.10", "3.11"],
        },
      },
      steps: [
        {
          name: "📥 Checkout repository",
          uses: "actions/checkout@v4",
        },
        {
          name: "🐍 Setup Python ${{ matrix.python-version }}",
          uses: "actions/setup-python@v5",
          with: {
            "python-version": "${{ matrix.python-version }}",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "pip install -r requirements.txt",
        },
        {
          name: "🔧 Run Black formatter check",
          run: "black --check .",
        },
        {
          name: "🔍 Run Flake8 linter",
          run: "flake8 .",
        },
        {
          name: "🧪 Run pytest",
          run: "pytest --cov=. --cov-report=xml",
        },
        {
          name: "📊 Upload coverage to Codecov",
          uses: "codecov/codecov-action@v4",
          with: {
            file: "./coverage.xml",
            flags: "unittests",
          },
        },
      ],
    },
  },
};

/**
 * Docker build and push workflow
 */
export const DOCKER_BUILD_WORKFLOW: GitHubWorkflow = {
  name: "🐳 Docker Build & Push",
  on: {
    push: {
      branches: ["main"],
      tags: ["v*"],
    },
    pull_request: {
      branches: ["main"],
    },
  },
  env: {
    REGISTRY: "ghcr.io",
    IMAGE_NAME: "${{ github.repository }}",
  },
  jobs: {
    build: {
      name: "🏗️ Build Docker Image",
      "runs-on": "ubuntu-latest",
      permissions: {
        contents: "read",
        packages: "write",
      },
      steps: [
        {
          name: "📥 Checkout repository",
          uses: "actions/checkout@v4",
        },
        {
          name: "🐳 Setup Docker Buildx",
          uses: "docker/setup-buildx-action@v3",
        },
        {
          name: "🔐 Login to Container Registry",
          if: "github.event_name != 'pull_request'",
          uses: "docker/login-action@v3",
          with: {
            registry: "${{ env.REGISTRY }}",
            username: "${{ github.actor }}",
            password: "${{ secrets.GITHUB_TOKEN }}",
          },
        },
        {
          name: "🏷️ Extract metadata",
          id: "meta",
          uses: "docker/metadata-action@v5",
          with: {
            images: "${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}",
            tags: "type=ref,event=branch\ntype=ref,event=pr\ntype=semver,pattern={{version}}\ntype=semver,pattern={{major}}.{{minor}}",
          },
        },
        {
          name: "🔨 Build and push Docker image",
          uses: "docker/build-push-action@v5",
          with: {
            context: ".",
            push: "${{ github.event_name != 'pull_request' }}",
            tags: "${{ steps.meta.outputs.tags }}",
            labels: "${{ steps.meta.outputs.labels }}",
            "cache-from": "type=gha",
            "cache-to": "type=gha,mode=max",
          },
        },
      ],
    },
  },
};

/**
 * Automated release with semantic versioning
 */
export const RELEASE_AUTOMATION_WORKFLOW: GitHubWorkflow = {
  name: "🏷️ Release Automation",
  on: {
    push: {
      branches: ["main"],
    },
  },
  permissions: {
    contents: "write",
    issues: "write",
    "pull-requests": "write",
  },
  jobs: {
    release: {
      name: "🚀 Create Release",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "📥 Checkout repository",
          uses: "actions/checkout@v4",
          with: {
            "fetch-depth": 0,
          },
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
        {
          name: "🏗️ Build project",
          run: "npm run build",
        },
        {
          name: "🏷️ Create release",
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
            NPM_TOKEN: "${{ secrets.NPM_TOKEN }}",
          },
          run: "npx semantic-release",
        },
      ],
    },
  },
};

/**
 * Security Scanner Workflow - Comprehensive security scanning
 */
export const SECURITY_SCANNER_WORKFLOW: GitHubWorkflow = {
  name: "🔒 Security Scanner",
  on: {
    push: {
      branches: ["main", "develop"],
    },
    pull_request: {
      branches: ["main"],
    },
    schedule: [
      {
        cron: "0 2 * * 1", // Weekly on Mondays at 2 AM
      },
    ],
  },
  jobs: {
    "security-scan": {
      name: "🔍 Security Analysis",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
          with: {
            "fetch-depth": 0,
          },
        },
        {
          name: "⚙️ Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "20",
            cache: "npm",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "npm ci",
        },
        {
          name: "🔒 Run CodeQL Analysis",
          uses: "github/codeql-action/init@v3",
          with: {
            languages: "javascript",
          },
        },
        {
          name: "🏗️ Autobuild",
          uses: "github/codeql-action/autobuild@v3",
        },
        {
          name: "🔍 Perform CodeQL Analysis",
          uses: "github/codeql-action/analyze@v3",
        },
        {
          name: "🔧 Run npm audit",
          run: "npm audit --audit-level=high",
        },
        {
          name: "🔒 Snyk Security Scan",
          uses: "snyk/actions/node@master",
          env: {
            SNYK_TOKEN: "${{ secrets.SNYK_TOKEN }}",
          },
          with: {
            command: "test",
          },
        },
        {
          name: "📋 Upload SARIF results",
          uses: "github/codeql-action/upload-sarif@v3",
          if: "always()",
        },
      ],
    },
  },
};

/**
 * Multi-Environment Deploy Workflow - Deploy to dev/staging/prod with approvals
 */
export const MULTI_ENV_DEPLOY_WORKFLOW: GitHubWorkflow = {
  name: "🚀 Multi-Environment Deploy",
  on: {
    push: {
      branches: ["main"],
    },
    workflow_dispatch: {
      inputs: {
        environment: {
          description: "Environment to deploy to",
          required: true,
          default: "development",
          type: "choice",
          options: ["development", "staging", "production"],
        },
      },
    },
  },
  env: {
    NODE_VERSION: "20",
  },
  jobs: {
    build: {
      name: "🏗️ Build Application",
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
            "node-version": "${{ env.NODE_VERSION }}",
            cache: "npm",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "npm ci",
        },
        {
          name: "🧪 Run tests",
          run: "npm test",
        },
        {
          name: "🏗️ Build application",
          run: "npm run build",
        },
        {
          name: "📦 Archive build artifacts",
          uses: "actions/upload-artifact@v4",
          with: {
            name: "build-files",
            path: "dist/",
          },
        },
      ],
    },
    "deploy-dev": {
      name: "🚀 Deploy to Development",
      "runs-on": "ubuntu-latest",
      needs: ["build"],
      if: "github.ref == 'refs/heads/main' || github.event.inputs.environment == 'development'",
      environment: {
        name: "development",
        url: "https://dev.example.com",
      },
      steps: [
        {
          name: "📥 Download build artifacts",
          uses: "actions/download-artifact@v4",
          with: {
            name: "build-files",
            path: "dist/",
          },
        },
        {
          name: "🚀 Deploy to Development",
          run: "echo 'Deploying to development environment...'",
          env: {
            DEPLOY_URL: "${{ vars.DEV_DEPLOY_URL }}",
            API_KEY: "${{ secrets.DEV_API_KEY }}",
          },
        },
      ],
    },
    "deploy-staging": {
      name: "🎭 Deploy to Staging",
      "runs-on": "ubuntu-latest",
      needs: ["deploy-dev"],
      if: "github.event.inputs.environment == 'staging' || github.event.inputs.environment == 'production'",
      environment: {
        name: "staging",
        url: "https://staging.example.com",
      },
      steps: [
        {
          name: "📥 Download build artifacts",
          uses: "actions/download-artifact@v4",
          with: {
            name: "build-files",
            path: "dist/",
          },
        },
        {
          name: "🎭 Deploy to Staging",
          run: "echo 'Deploying to staging environment...'",
          env: {
            DEPLOY_URL: "${{ vars.STAGING_DEPLOY_URL }}",
            API_KEY: "${{ secrets.STAGING_API_KEY }}",
          },
        },
        {
          name: "🧪 Run E2E tests",
          run: "npm run test:e2e",
          env: {
            TEST_URL: "https://staging.example.com",
          },
        },
      ],
    },
    "deploy-prod": {
      name: "🌟 Deploy to Production",
      "runs-on": "ubuntu-latest",
      needs: ["deploy-staging"],
      if: "github.event.inputs.environment == 'production'",
      environment: {
        name: "production",
        url: "https://example.com",
      },
      steps: [
        {
          name: "📥 Download build artifacts",
          uses: "actions/download-artifact@v4",
          with: {
            name: "build-files",
            path: "dist/",
          },
        },
        {
          name: "🌟 Deploy to Production",
          run: "echo 'Deploying to production environment...'",
          env: {
            DEPLOY_URL: "${{ vars.PROD_DEPLOY_URL }}",
            API_KEY: "${{ secrets.PROD_API_KEY }}",
          },
        },
        {
          name: "📈 Update monitoring",
          run: "echo 'Updating monitoring dashboards...'",
        },
      ],
    },
  },
};

/**
 * Monorepo CI Workflow - Optimized for monorepos with selective building
 */
export const MONOREPO_CI_WORKFLOW: GitHubWorkflow = {
  name: "📦 Monorepo CI",
  on: {
    push: {
      branches: ["main"],
    },
    pull_request: {
      branches: ["main"],
    },
  },
  jobs: {
    changes: {
      name: "🔍 Detect Changes",
      "runs-on": "ubuntu-latest",
      outputs: {
        frontend: "${{ steps.changes.outputs.frontend }}",
        backend: "${{ steps.changes.outputs.backend }}",
        shared: "${{ steps.changes.outputs.shared }}",
      },
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "🔍 Detect changes",
          uses: "dorny/paths-filter@v3",
          id: "changes",
          with: {
            filters: `
              frontend:
                - 'packages/frontend/**'
                - 'packages/shared/**'
              backend:
                - 'packages/backend/**'
                - 'packages/shared/**'
              shared:
                - 'packages/shared/**'
            `,
          },
        },
      ],
    },
    "test-frontend": {
      name: "🧪 Test Frontend",
      "runs-on": "ubuntu-latest",
      needs: ["changes"],
      if: "${{ needs.changes.outputs.frontend == 'true' }}",
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "⚙️ Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "20",
            cache: "npm",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "npm ci",
        },
        {
          name: "🧪 Test frontend",
          run: "npm run test --workspace=frontend",
        },
        {
          name: "🏗️ Build frontend",
          run: "npm run build --workspace=frontend",
        },
      ],
    },
    "test-backend": {
      name: "🧪 Test Backend",
      "runs-on": "ubuntu-latest",
      needs: ["changes"],
      if: "${{ needs.changes.outputs.backend == 'true' }}",
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "⚙️ Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "20",
            cache: "npm",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "npm ci",
        },
        {
          name: "🧪 Test backend",
          run: "npm run test --workspace=backend",
        },
        {
          name: "🏗️ Build backend",
          run: "npm run build --workspace=backend",
        },
      ],
    },
    "test-shared": {
      name: "🧪 Test Shared",
      "runs-on": "ubuntu-latest",
      needs: ["changes"],
      if: "${{ needs.changes.outputs.shared == 'true' }}",
      steps: [
        {
          name: "📥 Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "⚙️ Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "20",
            cache: "npm",
          },
        },
        {
          name: "📦 Install dependencies",
          run: "npm ci",
        },
        {
          name: "🧪 Test shared packages",
          run: "npm run test --workspace=shared",
        },
        {
          name: "🏗️ Build shared packages",
          run: "npm run build --workspace=shared",
        },
      ],
    },
  },
};

/**
 * Template metadata for the template browser
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  workflow: GitHubWorkflow;
  requiredSecrets?: string[];
  requiredVariables?: string[];
}

/**
 * All available workflow templates with metadata
 */
export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  default: {
    id: "default",
    name: "🚀 Full CI/CD Pipeline",
    description:
      "Complete pipeline with testing, linting, building, and deployment",
    category: "Full Stack",
    tags: ["ci/cd", "testing", "deployment", "nodejs"],
    difficulty: "advanced",
    requiredSecrets: ["DEPLOY_TOKEN"],
    requiredVariables: ["NODE_VERSION", "DEPLOY_URL"],
    workflow: DEFAULT_WORKFLOW,
  },
  simple: {
    id: "simple",
    name: "🚀 Simple CI/CD",
    description: "Basic workflow for small projects with essential steps",
    category: "Getting Started",
    tags: ["ci/cd", "basic", "nodejs"],
    difficulty: "beginner",
    requiredSecrets: [],
    requiredVariables: ["NODE_VERSION"],
    workflow: SIMPLE_WORKFLOW,
  },
  nodejs: {
    id: "nodejs",
    name: "🟢 Node.js CI",
    description: "Test Node.js applications across multiple versions",
    category: "Backend",
    tags: ["nodejs", "testing", "matrix", "ci"],
    difficulty: "intermediate",
    requiredSecrets: [],
    requiredVariables: ["NODE_VERSION"],
    workflow: NODEJS_CI_WORKFLOW,
  },
  react: {
    id: "react",
    name: "⚛️ React Deploy",
    description: "Build and deploy React apps to GitHub Pages",
    category: "Frontend",
    tags: ["react", "deployment", "github-pages", "spa"],
    difficulty: "intermediate",
    requiredSecrets: [],
    requiredVariables: ["PUBLIC_URL"],
    workflow: REACT_DEPLOY_WORKFLOW,
  },
  python: {
    id: "python",
    name: "🐍 Python Testing",
    description: "Comprehensive testing and quality checks for Python projects",
    category: "Backend",
    tags: ["python", "testing", "coverage", "quality"],
    difficulty: "intermediate",
    requiredSecrets: [],
    requiredVariables: ["PYTHON_VERSION"],
    workflow: PYTHON_TESTING_WORKFLOW,
  },
  docker: {
    id: "docker",
    name: "🐳 Docker Build & Push",
    description: "Build Docker images and push to GitHub Container Registry",
    category: "DevOps",
    tags: ["docker", "containers", "registry", "ghcr"],
    difficulty: "advanced",
    requiredSecrets: ["GITHUB_TOKEN"],
    requiredVariables: ["REGISTRY_URL"],
    workflow: DOCKER_BUILD_WORKFLOW,
  },
  release: {
    id: "release",
    name: "🏷️ Release Automation",
    description: "Automated releases with semantic versioning and changelog",
    category: "DevOps",
    tags: ["release", "semantic-release", "automation", "npm"],
    difficulty: "advanced",
    requiredSecrets: ["NPM_TOKEN", "GITHUB_TOKEN"],
    requiredVariables: [],
    workflow: RELEASE_AUTOMATION_WORKFLOW,
  },
  security: {
    id: "security",
    name: "🔒 Security Scanner",
    description:
      "Comprehensive security scanning with CodeQL, Snyk, and dependency auditing",
    category: "DevOps",
    tags: ["security", "codeql", "snyk", "audit", "sast"],
    difficulty: "advanced",
    requiredSecrets: ["SNYK_TOKEN"],
    requiredVariables: [],
    workflow: SECURITY_SCANNER_WORKFLOW,
  },
  "multi-env": {
    id: "multi-env",
    name: "🚀 Multi-Environment Deploy",
    description:
      "Deploy to dev/staging/prod environments with approval gates and E2E testing",
    category: "DevOps",
    tags: ["deployment", "environments", "approval", "e2e", "staging"],
    difficulty: "advanced",
    requiredSecrets: ["DEV_API_KEY", "STAGING_API_KEY", "PROD_API_KEY"],
    requiredVariables: [
      "DEV_DEPLOY_URL",
      "STAGING_DEPLOY_URL",
      "PROD_DEPLOY_URL",
    ],
    workflow: MULTI_ENV_DEPLOY_WORKFLOW,
  },
  monorepo: {
    id: "monorepo",
    name: "📦 Monorepo CI",
    description:
      "Optimized CI for monorepos with selective testing and building based on changes",
    category: "Full Stack",
    tags: ["monorepo", "selective", "workspaces", "optimization", "changes"],
    difficulty: "intermediate",
    requiredSecrets: [],
    requiredVariables: [],
    workflow: MONOREPO_CI_WORKFLOW,
  },
} as const;

export type WorkflowTemplateKey = keyof typeof WORKFLOW_TEMPLATES;
