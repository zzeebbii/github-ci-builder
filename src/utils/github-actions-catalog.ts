import type {
  PopularAction,
  ActionCategory,
  NodeTemplate,
  NodeTemplateCategory,
  Step,
  Job,
} from "../types/github-actions";

/**
 * Enhanced popular actions catalog with more comprehensive coverage
 */
export const ENHANCED_POPULAR_ACTIONS: PopularAction[] = [
  // Utility Actions
  {
    uses: "actions/checkout@v4",
    name: "Checkout Repository",
    description:
      "Check out your repository under $GITHUB_WORKSPACE so your job can access it",
    category: "utility",
    inputs: {
      repository: {
        description:
          "Repository name with owner. For example, actions/checkout",
        required: false,
        default: "${{ github.repository }}",
      },
      ref: {
        description:
          "The branch, tag or SHA to checkout. When checking out the repository that triggered a workflow, this defaults to the reference or SHA for that event.",
        required: false,
        default: "${{ github.sha }}",
      },
      token: {
        description: "Personal access token (PAT) used to fetch the repository",
        required: false,
        default: "${{ github.token }}",
      },
      "ssh-key": {
        description: "SSH key used to fetch the repository",
        required: false,
      },
      path: {
        description:
          "Relative path under $GITHUB_WORKSPACE to place the repository",
        required: false,
      },
      clean: {
        description:
          "Whether to execute `git clean -ffdx && git reset --hard HEAD` before fetching",
        required: false,
        type: "boolean",
        default: "true",
      },
      "fetch-depth": {
        description:
          "Number of commits to fetch. 0 indicates all history for all branches and tags",
        required: false,
        type: "number",
        default: "1",
      },
      lfs: {
        description: "Whether to download Git-LFS files",
        required: false,
        type: "boolean",
        default: "false",
      },
      submodules: {
        description:
          "Whether to checkout submodules: `true` to checkout submodules or `recursive` to recursively checkout submodules",
        required: false,
        type: "choice",
        options: ["true", "false", "recursive"],
        default: "false",
      },
    },
  },

  // Language Setup Actions
  {
    uses: "actions/setup-node@v4",
    name: "Setup Node.js",
    description:
      "Set up a specific version of Node.js and add the command-line tools to the PATH",
    category: "utility",
    inputs: {
      "node-version": {
        description:
          "Version Spec of the version to use. Examples: 12.x, 10.15.1, >=10.15.0",
        required: false,
      },
      "node-version-file": {
        description:
          "File containing the version Spec of the version to use. Examples: .nvmrc, .node-version, .tool-versions",
        required: false,
      },
      architecture: {
        description:
          "Target architecture for Node to use. Examples: x86, x64. Will use system architecture by default",
        required: false,
        type: "choice",
        options: ["x86", "x64"],
      },
      "check-latest": {
        description:
          "Set this option if you want the action to check for the latest available version that satisfies the version spec",
        required: false,
        type: "boolean",
        default: "false",
      },
      registry: {
        description:
          "Optional registry to set up for auth. Will set the registry in a project level .npmrc and .yarnrc file, and set up auth to read in from env.NODE_AUTH_TOKEN",
        required: false,
      },
      scope: {
        description:
          "Optional scope for authenticating against scoped registries",
        required: false,
      },
      cache: {
        description:
          "Used to specify a package manager for caching in the default directory. Supported values: npm, yarn, pnpm",
        required: false,
        type: "choice",
        options: ["npm", "yarn", "pnpm"],
      },
      "cache-dependency-path": {
        description:
          "Used to specify the path to a dependency file: package-lock.json, yarn.lock, etc. Supports wildcards or a list of file names for caching multiple dependencies",
        required: false,
      },
    },
    outputs: {
      "cache-hit": {
        description: "A boolean value to indicate if a cache was hit",
      },
      "node-version": {
        description:
          "The installed node version. Useful when given a version range as input",
      },
    },
  },

  {
    uses: "actions/setup-python@v5",
    name: "Setup Python",
    description:
      "Set up a specific version of Python and add the command-line tools to the PATH",
    category: "utility",
    inputs: {
      "python-version": {
        description:
          "Version range or exact version of a Python version to use",
        required: false,
        default: "3.x",
      },
      "python-version-file": {
        description:
          "File containing the Python version to use. Examples: .python-version, pyproject.toml",
        required: false,
      },
      cache: {
        description:
          "Used to specify a package manager for caching in the default directory. Supported values: pip, pipenv, poetry",
        required: false,
        type: "choice",
        options: ["pip", "pipenv", "poetry"],
      },
      architecture: {
        description:
          "The target architecture (x86, x64) of the Python interpreter",
        required: false,
        type: "choice",
        options: ["x86", "x64"],
      },
      "check-latest": {
        description:
          "Set this option if you want the action to check for the latest available version that satisfies the version spec",
        required: false,
        type: "boolean",
        default: "false",
      },
      token: {
        description:
          "The token used to authenticate when fetching Python distributions from https://github.com/actions/python-versions",
        required: false,
        default: "${{ github.token }}",
      },
      "cache-dependency-path": {
        description:
          "Used to specify the path to dependency files. Supports wildcards or a list of file names for caching multiple dependencies",
        required: false,
      },
    },
    outputs: {
      "python-version": {
        description:
          "The installed python version. Useful when given a version range as input",
      },
      "cache-hit": {
        description: "A boolean value to indicate if a cache was hit",
      },
      "python-path": {
        description: "The absolute path to the Python or pypy executable",
      },
    },
  },

  {
    uses: "actions/setup-java@v4",
    name: "Setup Java",
    description:
      "Set up a specific version of Java and add the command-line tools to the PATH",
    category: "utility",
    inputs: {
      "java-version": {
        description:
          "The Java version to set up. Takes a whole or semver Java version. See examples of supported syntax",
        required: true,
      },
      "java-version-file": {
        description:
          "The path to the .java-version file. See examples of supported syntax",
        required: false,
      },
      distribution: {
        description:
          "Java distribution. See the list of supported distributions",
        required: true,
        type: "choice",
        options: [
          "temurin",
          "zulu",
          "adopt",
          "liberica",
          "microsoft",
          "corretto",
          "oracle",
        ],
      },
      "java-package": {
        description: "The package type (jdk, jre, jdk+fx, jre+fx)",
        required: false,
        type: "choice",
        options: ["jdk", "jre", "jdk+fx", "jre+fx"],
        default: "jdk",
      },
      architecture: {
        description: "The architecture of the package",
        required: false,
        type: "choice",
        options: ["x86", "x64", "armv7", "aarch64", "ppc64le", "s390x"],
        default: "x64",
      },
      "check-latest": {
        description:
          "Set this option if you want the action to check for the latest available version",
        required: false,
        type: "boolean",
        default: "false",
      },
      cache: {
        description:
          "Name of the build platform to cache dependencies. It can be maven, gradle or sbt",
        required: false,
        type: "choice",
        options: ["maven", "gradle", "sbt"],
      },
    },
    outputs: {
      distribution: {
        description: "Distribution of Java that has been installed",
      },
      path: {
        description:
          "Path to where Java has been installed (same as $JAVA_HOME)",
      },
      version: {
        description: "Actual version of Java that has been installed",
      },
    },
  },

  // Artifact Actions
  {
    uses: "actions/upload-artifact@v4",
    name: "Upload Build Artifacts",
    description:
      "Upload artifacts from your workflow allowing you to share data between jobs and store data once a workflow is complete",
    category: "utility",
    inputs: {
      name: {
        description: "Artifact name",
        required: true,
      },
      path: {
        description:
          "A file, directory or wildcard pattern that describes what to upload",
        required: true,
      },
      "if-no-files-found": {
        description:
          "The desired behavior if no files are found using the provided path",
        required: false,
        type: "choice",
        options: ["warn", "error", "ignore"],
        default: "warn",
      },
      "retention-days": {
        description:
          "Duration after which artifact will expire in days. 0 means using default retention",
        required: false,
        type: "number",
      },
      "compression-level": {
        description:
          "The level of compression for Zlib to be applied to the artifact archive",
        required: false,
        type: "number",
        default: "6",
      },
      overwrite: {
        description:
          "If true, an artifact with a matching name will be deleted before a new one is uploaded",
        required: false,
        type: "boolean",
        default: "false",
      },
    },
    outputs: {
      "artifact-id": {
        description: "GitHub ID of an Artifact, can be used by the REST API",
      },
      "artifact-url": {
        description:
          "URL to download an Artifact. Can be used in many scenarios such as linking to artifacts in issues or pull requests",
      },
    },
  },

  {
    uses: "actions/download-artifact@v4",
    name: "Download Build Artifacts",
    description: "Download artifacts from your build",
    category: "utility",
    inputs: {
      name: {
        description:
          "Name of the artifact to download. If unspecified, all artifacts for the run are downloaded",
        required: false,
      },
      path: {
        description: "Destination path. Supports basic tilde expansion",
        required: false,
        default: "$GITHUB_WORKSPACE",
      },
      pattern: {
        description:
          "A glob pattern matching the artifacts that should be downloaded",
        required: false,
      },
      "merge-multiple": {
        description:
          "When multiple artifacts are matched, this changes the behavior of the destination directories",
        required: false,
        type: "boolean",
        default: "false",
      },
    },
    outputs: {
      "download-path": {
        description: "Absolute path where the artifacts were downloaded",
      },
    },
  },

  // Testing Actions
  {
    uses: "codecov/codecov-action@v4",
    name: "Codecov Coverage Upload",
    description: "Upload coverage reports to Codecov",
    category: "testing",
    inputs: {
      token: {
        description: "Repository upload token - get it from codecov.io",
        required: false,
      },
      file: {
        description: "Path to coverage file to upload",
        required: false,
      },
      files: {
        description: "Comma separated list of files to upload",
        required: false,
      },
      directory: {
        description: "Directory to search for coverage reports",
        required: false,
      },
      flags: {
        description: "Flag upload to group coverage metrics",
        required: false,
      },
      name: {
        description: "Custom defined name of the upload",
        required: false,
      },
      fail_ci_if_error: {
        description:
          "Specify whether or not CI build should fail if Codecov runs into an error during upload",
        required: false,
        type: "boolean",
        default: "false",
      },
    },
  },

  // Security Actions
  {
    uses: "github/codeql-action/analyze@v3",
    name: "CodeQL Analysis",
    description: "Run CodeQL analysis on your code",
    category: "security",
    inputs: {
      languages: {
        description: "Languages to analyze",
        required: false,
      },
      queries: {
        description: "Paths to CodeQL query suites to run",
        required: false,
      },
      "config-file": {
        description: "Path to CodeQL configuration file",
        required: false,
      },
      "upload-sarif": {
        description: "Whether to upload SARIF results to GitHub",
        required: false,
        type: "boolean",
        default: "true",
      },
    },
  },

  // Deployment Actions
  {
    uses: "peaceiris/actions-gh-pages@v3",
    name: "Deploy to GitHub Pages",
    description: "Deploy your website to GitHub Pages",
    category: "deployment",
    inputs: {
      github_token: {
        description: "GitHub token for authentication",
        required: false,
        default: "${{ github.token }}",
      },
      personal_token: {
        description: "Personal access token for authentication",
        required: false,
      },
      publish_dir: {
        description: "Directory to publish",
        required: true,
        default: "./public",
      },
      publish_branch: {
        description: "Branch to publish to",
        required: false,
        default: "gh-pages",
      },
      destination_dir: {
        description: "Destination directory on the target branch",
        required: false,
      },
      cname: {
        description: "Custom domain for GitHub Pages",
        required: false,
      },
      commit_message: {
        description: "Commit message for the publish commit",
        required: false,
      },
    },
  },

  // Notification Actions
  {
    uses: "8398a7/action-slack@v3",
    name: "Slack Notification",
    description: "Send Slack notifications about workflow status",
    category: "notification",
    inputs: {
      status: {
        description: "Job status (success, failure, cancelled)",
        required: true,
        type: "choice",
        options: ["success", "failure", "cancelled"],
      },
      webhook_url: {
        description: "Slack webhook URL",
        required: true,
      },
      channel: {
        description: "Slack channel to send message to",
        required: false,
      },
      username: {
        description: "Bot username",
        required: false,
        default: "GitHub Actions",
      },
      icon_emoji: {
        description: "Bot icon emoji",
        required: false,
        default: ":octocat:",
      },
      text: {
        description: "Custom message text",
        required: false,
      },
    },
  },
];

/**
 * Get actions by category
 */
export function getActionsByCategory(
  category: ActionCategory
): PopularAction[] {
  return ENHANCED_POPULAR_ACTIONS.filter(
    (action) => action.category === category
  );
}

/**
 * Search actions by name or description
 */
export function searchActions(query: string): PopularAction[] {
  const lowercaseQuery = query.toLowerCase();
  return ENHANCED_POPULAR_ACTIONS.filter(
    (action) =>
      action.name.toLowerCase().includes(lowercaseQuery) ||
      action.description.toLowerCase().includes(lowercaseQuery) ||
      action.uses.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get action details by uses string
 */
export function getActionDetails(uses: string): PopularAction | undefined {
  return ENHANCED_POPULAR_ACTIONS.find((action) => action.uses === uses);
}

/**
 * Enhanced job templates with more comprehensive patterns
 */
export const ENHANCED_JOB_TEMPLATES: NodeTemplate[] = [
  {
    id: "node-ci",
    name: "Node.js CI",
    description: "Complete Node.js CI pipeline with testing and linting",
    category: "ci-cd",
    icon: "🟢",
    template: {
      name: "Node.js CI",
      "runs-on": "ubuntu-latest",
      strategy: {
        matrix: {
          "node-version": ["18.x", "20.x", "22.x"],
        },
      },
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js ${{ matrix.node-version }}",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "${{ matrix.node-version }}",
            cache: "npm",
          },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Run linter",
          run: "npm run lint",
        },
        {
          name: "Run tests",
          run: "npm test",
        },
        {
          name: "Build project",
          run: "npm run build",
        },
      ],
    },
  },

  {
    id: "python-ci",
    name: "Python CI",
    description: "Python CI pipeline with multiple Python versions",
    category: "ci-cd",
    icon: "🐍",
    template: {
      name: "Python CI",
      "runs-on": "ubuntu-latest",
      strategy: {
        matrix: {
          "python-version": ["3.9", "3.10", "3.11", "3.12"],
        },
      },
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Python ${{ matrix.python-version }}",
          uses: "actions/setup-python@v5",
          with: {
            "python-version": "${{ matrix.python-version }}",
          },
        },
        {
          name: "Install dependencies",
          run: "pip install -r requirements.txt",
        },
        {
          name: "Run tests",
          run: "python -m pytest",
        },
      ],
    },
  },

  {
    id: "docker-build",
    name: "Docker Build & Push",
    description: "Build and push Docker images to registry",
    category: "deployment",
    icon: "🐳",
    template: {
      name: "Docker Build and Push",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Docker Buildx",
          uses: "docker/setup-buildx-action@v3",
        },
        {
          name: "Login to Container Registry",
          uses: "docker/login-action@v3",
          with: {
            registry: "ghcr.io",
            username: "${{ github.actor }}",
            password: "${{ secrets.GITHUB_TOKEN }}",
          },
        },
        {
          name: "Build and push",
          uses: "docker/build-push-action@v5",
          with: {
            context: ".",
            push: true,
            tags: "ghcr.io/${{ github.repository }}:latest",
          },
        },
      ],
    },
  },

  {
    id: "security-scan",
    name: "Security Scanning",
    description: "Comprehensive security scanning with CodeQL",
    category: "security",
    icon: "🔒",
    template: {
      name: "Security Scan",
      "runs-on": "ubuntu-latest",
      permissions: {
        "security-events": "write",
        contents: "read",
      },
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Initialize CodeQL",
          uses: "github/codeql-action/init@v3",
          with: {
            languages: "javascript,python",
          },
        },
        {
          name: "Autobuild",
          uses: "github/codeql-action/autobuild@v3",
        },
        {
          name: "Perform CodeQL Analysis",
          uses: "github/codeql-action/analyze@v3",
        },
      ],
    },
  },

  {
    id: "release-job",
    name: "Release & Deploy",
    description: "Release job with semantic versioning and deployment",
    category: "deployment",
    icon: "🚀",
    template: {
      name: "Release",
      "runs-on": "ubuntu-latest",
      if: "github.ref == 'refs/heads/main'",
      needs: ["test"],
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
          with: {
            "fetch-depth": 0,
          },
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "20.x",
            cache: "npm",
          },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Build project",
          run: "npm run build",
        },
        {
          name: "Create Release",
          uses: "semantic-release/semantic-release@v23",
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
            NPM_TOKEN: "${{ secrets.NPM_TOKEN }}",
          },
        },
      ],
    },
  },
];

/**
 * Get job templates by category
 */
export function getJobTemplatesByCategory(
  category: NodeTemplateCategory
): NodeTemplate[] {
  return ENHANCED_JOB_TEMPLATES.filter(
    (template) => template.category === category
  );
}

/**
 * Enhanced step templates
 */
export const ENHANCED_STEP_TEMPLATES: NodeTemplate[] = [
  {
    id: "checkout",
    name: "Checkout Repository",
    description: "Check out the repository code",
    category: "utility",
    icon: "📥",
    template: {
      name: "Checkout code",
      uses: "actions/checkout@v4",
      with: {
        "fetch-depth": 0,
      },
    },
  },

  {
    id: "setup-node",
    name: "Setup Node.js",
    description: "Set up Node.js environment with caching",
    category: "utility",
    icon: "🟢",
    template: {
      name: "Setup Node.js",
      uses: "actions/setup-node@v4",
      with: {
        "node-version": "20.x",
        cache: "npm",
      },
    },
  },

  {
    id: "install-deps",
    name: "Install Dependencies",
    description: "Install project dependencies",
    category: "ci-cd",
    icon: "📦",
    template: {
      name: "Install dependencies",
      run: "npm ci",
    },
  },

  {
    id: "run-tests",
    name: "Run Tests",
    description: "Execute test suite with coverage",
    category: "testing",
    icon: "🧪",
    template: {
      name: "Run tests",
      run: "npm test -- --coverage",
    },
  },

  {
    id: "lint-code",
    name: "Lint Code",
    description: "Run code linting and formatting checks",
    category: "code-quality",
    icon: "✨",
    template: {
      name: "Lint code",
      run: "npm run lint",
    },
  },

  {
    id: "build-project",
    name: "Build Project",
    description: "Build the project for production",
    category: "ci-cd",
    icon: "🔨",
    template: {
      name: "Build project",
      run: "npm run build",
    },
  },

  {
    id: "upload-coverage",
    name: "Upload Coverage",
    description: "Upload test coverage to Codecov",
    category: "testing",
    icon: "📊",
    template: {
      name: "Upload coverage to Codecov",
      uses: "codecov/codecov-action@v4",
      with: {
        token: "${{ secrets.CODECOV_TOKEN }}",
        file: "./coverage/lcov.info",
        fail_ci_if_error: true,
      },
    },
  },

  {
    id: "deploy-pages",
    name: "Deploy to GitHub Pages",
    description: "Deploy static site to GitHub Pages",
    category: "deployment",
    icon: "🌐",
    template: {
      name: "Deploy to GitHub Pages",
      uses: "peaceiris/actions-gh-pages@v3",
      with: {
        github_token: "${{ secrets.GITHUB_TOKEN }}",
        publish_dir: "./dist",
      },
    },
  },
];

/**
 * Create a step from template
 */
export function createStepFromTemplate(templateId: string): Step | null {
  const template = ENHANCED_STEP_TEMPLATES.find((t) => t.id === templateId);
  if (!template || !template.template) return null;

  return template.template as Step;
}

/**
 * Create a job from template
 */
export function createJobFromTemplate(templateId: string): Job | null {
  const template = ENHANCED_JOB_TEMPLATES.find((t) => t.id === templateId);
  if (!template || !template.template) return null;

  return template.template as Job;
}

/**
 * Get all available categories
 */
export function getAllCategories(): {
  action: ActionCategory[];
  template: NodeTemplateCategory[];
} {
  const actionCategories = Array.from(
    new Set(ENHANCED_POPULAR_ACTIONS.map((a) => a.category))
  );
  const templateCategories = Array.from(
    new Set(
      [...ENHANCED_JOB_TEMPLATES, ...ENHANCED_STEP_TEMPLATES].map(
        (t) => t.category
      )
    )
  );

  return {
    action: actionCategories,
    template: templateCategories,
  };
}
