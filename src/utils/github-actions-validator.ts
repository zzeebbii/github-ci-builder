import type {
  GitHubWorkflow,
  Job,
  Step,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  WorkflowEventTrigger,
} from "../types/github-actions";
import {
  GITHUB_HOSTED_RUNNERS,
  WORKFLOW_EVENT_TRIGGERS,
} from "../types/github-actions";

/**
 * Comprehensive GitHub Actions workflow validator
 */
export class GitHubActionsValidator {
  /**
   * Validate a complete GitHub Actions workflow
   */
  static validateWorkflow(workflow: GitHubWorkflow): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate workflow name
    if (workflow.name && workflow.name.length > 255) {
      errors.push({
        path: "name",
        message: "Workflow name cannot exceed 255 characters",
        code: "WORKFLOW_NAME_TOO_LONG",
      });
    }

    // Validate triggers
    const triggerValidation = this.validateTriggers(workflow.on);
    errors.push(...triggerValidation.errors);
    warnings.push(...triggerValidation.warnings);

    // Validate jobs
    if (!workflow.jobs || Object.keys(workflow.jobs).length === 0) {
      errors.push({
        path: "jobs",
        message: "Workflow must contain at least one job",
        code: "NO_JOBS_DEFINED",
      });
    } else {
      Object.entries(workflow.jobs).forEach(([jobId, job]) => {
        const jobValidation = this.validateJob(job, jobId);
        errors.push(
          ...jobValidation.errors.map(error => ({
            ...error,
            path: `jobs.${jobId}.${error.path}`,
          }))
        );
        warnings.push(
          ...jobValidation.warnings.map(warning => ({
            ...warning,
            path: `jobs.${jobId}.${warning.path}`,
          }))
        );
      });
    }

    // Validate job dependencies
    const dependencyValidation = this.validateJobDependencies(workflow.jobs);
    errors.push(...dependencyValidation.errors);
    warnings.push(...dependencyValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate workflow triggers
   */
  private static validateTriggers(
    triggers: GitHubWorkflow["on"]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!triggers || Object.keys(triggers).length === 0) {
      errors.push({
        path: "on",
        message: "Workflow must have at least one trigger",
        code: "NO_TRIGGERS_DEFINED",
      });
      return { isValid: false, errors, warnings };
    }

    // Check for unknown trigger events
    Object.keys(triggers).forEach(trigger => {
      if (!WORKFLOW_EVENT_TRIGGERS.includes(trigger as WorkflowEventTrigger)) {
        warnings.push({
          path: `on.${trigger}`,
          message: `Unknown trigger event: ${trigger}`,
          code: "UNKNOWN_TRIGGER_EVENT",
        });
      }
    });

    // Validate schedule triggers
    if (triggers.schedule) {
      if (!Array.isArray(triggers.schedule)) {
        errors.push({
          path: "on.schedule",
          message: "Schedule trigger must be an array",
          code: "INVALID_SCHEDULE_FORMAT",
        });
      } else {
        triggers.schedule.forEach(
          (schedule: { cron: string }, index: number) => {
            if (!schedule.cron) {
              errors.push({
                path: `on.schedule[${index}]`,
                message: "Schedule trigger must have a cron expression",
                code: "MISSING_CRON_EXPRESSION",
              });
            } else if (!this.isValidCronExpression(schedule.cron)) {
              errors.push({
                path: `on.schedule[${index}].cron`,
                message: "Invalid cron expression",
                code: "INVALID_CRON_EXPRESSION",
              });
            }
          }
        );
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate a single job
   */
  private static validateJob(job: Job, jobId: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate job ID
    if (!this.isValidJobId(jobId)) {
      errors.push({
        path: "id",
        message:
          "Job ID must start with a letter or _ and contain only alphanumeric characters, -, and _",
        code: "INVALID_JOB_ID",
      });
    }

    // Validate runs-on
    if (!job["runs-on"]) {
      errors.push({
        path: "runs-on",
        message: "Job must specify runs-on",
        code: "MISSING_RUNS_ON",
      });
    } else {
      const runnerValidation = this.validateRunner(job["runs-on"]);
      errors.push(...runnerValidation.errors);
      warnings.push(...runnerValidation.warnings);
    }

    // Validate steps
    if (!job.steps || job.steps.length === 0) {
      errors.push({
        path: "steps",
        message: "Job must contain at least one step",
        code: "NO_STEPS_DEFINED",
      });
    } else {
      job.steps.forEach((step, index) => {
        const stepValidation = this.validateStep(step);
        errors.push(
          ...stepValidation.errors.map(error => ({
            ...error,
            path: `steps[${index}].${error.path}`,
          }))
        );
        warnings.push(
          ...stepValidation.warnings.map(warning => ({
            ...warning,
            path: `steps[${index}].${warning.path}`,
          }))
        );
      });
    }

    // Validate timeout
    if (
      job["timeout-minutes"] &&
      (job["timeout-minutes"] < 1 || job["timeout-minutes"] > 2160)
    ) {
      errors.push({
        path: "timeout-minutes",
        message: "Timeout must be between 1 and 2160 minutes",
        code: "INVALID_TIMEOUT",
      });
    }

    // Validate strategy matrix
    if (job.strategy?.matrix) {
      const matrixValidation = this.validateMatrix(job.strategy.matrix);
      errors.push(
        ...matrixValidation.errors.map(error => ({
          ...error,
          path: `strategy.matrix.${error.path}`,
        }))
      );
      warnings.push(
        ...matrixValidation.warnings.map(warning => ({
          ...warning,
          path: `strategy.matrix.${warning.path}`,
        }))
      );
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate a single step
   */
  private static validateStep(step: Step): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // A step must have either 'uses' or 'run'
    if (!step.uses && !step.run) {
      errors.push({
        path: "step",
        message: "Step must have either 'uses' or 'run'",
        code: "MISSING_STEP_ACTION",
      });
    }

    // A step cannot have both 'uses' and 'run'
    if (step.uses && step.run) {
      errors.push({
        path: "step",
        message: "Step cannot have both 'uses' and 'run'",
        code: "CONFLICTING_STEP_ACTIONS",
      });
    }

    // Validate action reference format
    if (step.uses) {
      if (!this.isValidActionReference(step.uses)) {
        errors.push({
          path: "uses",
          message: "Invalid action reference format",
          code: "INVALID_ACTION_REFERENCE",
        });
      }
    }

    // Validate step ID
    if (step.id && !this.isValidStepId(step.id)) {
      errors.push({
        path: "id",
        message: "Step ID must contain only alphanumeric characters, -, and _",
        code: "INVALID_STEP_ID",
      });
    }

    // Validate timeout
    if (
      step["timeout-minutes"] &&
      (step["timeout-minutes"] < 1 || step["timeout-minutes"] > 2160)
    ) {
      errors.push({
        path: "timeout-minutes",
        message: "Step timeout must be between 1 and 2160 minutes",
        code: "INVALID_STEP_TIMEOUT",
      });
    }

    // Warn about missing step names
    if (!step.name) {
      warnings.push({
        path: "name",
        message: "Consider adding a name to improve workflow readability",
        code: "MISSING_STEP_NAME",
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate job dependencies and detect cycles
   */
  private static validateJobDependencies(
    jobs: Record<string, Job>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const jobIds = Object.keys(jobs);

    // Check for invalid job dependencies
    Object.entries(jobs).forEach(([jobId, job]) => {
      if (job.needs) {
        const dependencies = Array.isArray(job.needs) ? job.needs : [job.needs];
        dependencies.forEach(dependency => {
          if (!jobIds.includes(dependency)) {
            errors.push({
              path: `jobs.${jobId}.needs`,
              message: `Job '${jobId}' depends on non-existent job '${dependency}'`,
              code: "INVALID_JOB_DEPENDENCY",
            });
          }
        });
      }
    });

    // Detect circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (jobId: string): boolean => {
      if (recursionStack.has(jobId)) {
        return true;
      }
      if (visited.has(jobId)) {
        return false;
      }

      visited.add(jobId);
      recursionStack.add(jobId);

      const job = jobs[jobId];
      if (job.needs) {
        const dependencies = Array.isArray(job.needs) ? job.needs : [job.needs];
        for (const dependency of dependencies) {
          if (jobIds.includes(dependency) && hasCycle(dependency)) {
            return true;
          }
        }
      }

      recursionStack.delete(jobId);
      return false;
    };

    for (const jobId of jobIds) {
      if (hasCycle(jobId)) {
        errors.push({
          path: `jobs.${jobId}`,
          message: "Circular dependency detected in job dependencies",
          code: "CIRCULAR_JOB_DEPENDENCY",
        });
        break;
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate runner specification
   */
  private static validateRunner(runsOn: string | string[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const runners = Array.isArray(runsOn) ? runsOn : [runsOn];

    runners.forEach((runner, index) => {
      const path = Array.isArray(runsOn) ? `[${index}]` : "";

      if (!runner || typeof runner !== "string") {
        errors.push({
          path,
          message: "Runner must be a non-empty string",
          code: "INVALID_RUNNER_FORMAT",
        });
        return;
      }

      // Check if it's a GitHub-hosted runner
      if (
        !GITHUB_HOSTED_RUNNERS.includes(
          runner as (typeof GITHUB_HOSTED_RUNNERS)[number]
        ) &&
        !runner.startsWith("self-hosted")
      ) {
        warnings.push({
          path,
          message: `Unknown runner: ${runner}. Consider using a GitHub-hosted runner or self-hosted label.`,
          code: "UNKNOWN_RUNNER",
        });
      }
    });

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate strategy matrix
   */
  private static validateMatrix(
    matrix: Record<string, unknown>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!matrix || typeof matrix !== "object") {
      errors.push({
        path: "",
        message: "Matrix must be an object",
        code: "INVALID_MATRIX_FORMAT",
      });
      return { isValid: false, errors, warnings };
    }

    // Count total matrix combinations
    let totalCombinations = 1;
    const matrixKeys = Object.keys(matrix).filter(
      key => key !== "include" && key !== "exclude"
    );

    matrixKeys.forEach(key => {
      const values = matrix[key];
      if (Array.isArray(values)) {
        totalCombinations *= values.length;
      }
    });

    // Warn about large matrices
    if (totalCombinations > 20) {
      warnings.push({
        path: "",
        message: `Matrix generates ${totalCombinations} job combinations. Consider reducing matrix size for faster execution.`,
        code: "LARGE_MATRIX_SIZE",
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Helper validation methods
  private static isValidJobId(jobId: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(jobId);
  }

  private static isValidStepId(stepId: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(stepId);
  }

  private static isValidActionReference(actionRef: string): boolean {
    // Format: owner/repo@ref or ./path/to/action
    return /^([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+|\.\/[\w/-]+)$/.test(
      actionRef
    );
  }

  private static isValidCronExpression(cron: string): boolean {
    // Basic cron validation - 5 fields separated by spaces
    const cronParts = cron.trim().split(/\s+/);
    return cronParts.length === 5;
  }
}

/**
 * Quick validation function for workflows
 */
export function validateGitHubWorkflow(
  workflow: GitHubWorkflow
): ValidationResult {
  return GitHubActionsValidator.validateWorkflow(workflow);
}

/**
 * Helper function to get validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
  const { errors, warnings } = result;

  if (errors.length === 0 && warnings.length === 0) {
    return "✅ Workflow is valid with no issues";
  }

  const errorText =
    errors.length > 0
      ? `${errors.length} error${errors.length > 1 ? "s" : ""}`
      : "";
  const warningText =
    warnings.length > 0
      ? `${warnings.length} warning${warnings.length > 1 ? "s" : ""}`
      : "";

  const parts = [errorText, warningText].filter(Boolean);
  return `⚠️ Workflow has ${parts.join(" and ")}`;
}
