/**
 * Goal Manager — API helpers
 *
 * Covers the full lifecycle of a ScalePad goal:
 *   - Fetching all goals and clients (paginated)
 *   - Creating, updating, and deleting goals
 *   - Deploying a goal template to one or more clients (step sequencer)
 *
 * All network calls go through `proxyCall` in api-client.ts, which forwards
 * requests to the scalepad-proxy edge function → api.scalepad.com.
 *
 * ScalePad API reference: https://developers.scalepad.com
 */

import { proxyCall, fetchAllPages } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PeriodType = "PeriodYear" | "PeriodHalf" | "PeriodQuarter";

/** A full-year goal period, e.g. { type: "PeriodYear", year: 2025 } */
export interface PeriodYear {
  type: "PeriodYear";
  year: number;
}

/** A half-year goal period, e.g. H1 2025 */
export interface PeriodHalf {
  type: "PeriodHalf";
  year: number;
  half: 1 | 2;
}

/** A quarterly goal period, e.g. Q3 2025 */
export interface PeriodQuarter {
  type: "PeriodQuarter";
  year: number;
  quarter: 1 | 2 | 3 | 4;
}

export type Period = PeriodYear | PeriodHalf | PeriodQuarter;

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  period: Period;
  client: { id: string; label: string };
  record_created_at: string;
  record_updated_at: string;
}

export interface GoalClient {
  id: string;
  name: string;
  lifecycle: string;
  num_hardware_assets: number;
}

/** Form state used in the Goal Builder UI */
export interface GoalTemplateForm {
  title: string;
  description: string;
  status: string;
  periodType: PeriodType;
  year: number;
  half: 1 | 2;
  quarter: 1 | 2 | 3 | 4;
}

/** Status of a single step in the deployment sequence */
export type StepStatus = "pending" | "running" | "success" | "error";

export interface DeploymentStep {
  name: string;
  status: StepStatus;
  error?: string;
}

/** Per-client deployment state used to render the deploy progress UI */
export interface GoalClientDeployment {
  clientId: string;
  clientName: string;
  steps: DeploymentStep[];
}

// ─── Period helpers ───────────────────────────────────────────────────────────

/**
 * Build a typed Period object from the Goal Builder form fields.
 * The API expects a discriminated union with a `type` tag.
 */
export function buildPeriodObject(
  periodType: PeriodType,
  year: number,
  half: 1 | 2,
  quarter: 1 | 2 | 3 | 4
): Period {
  switch (periodType) {
    case "PeriodYear":    return { type: "PeriodYear", year };
    case "PeriodHalf":    return { type: "PeriodHalf", year, half };
    case "PeriodQuarter": return { type: "PeriodQuarter", year, quarter };
  }
}

/** Format a Period for display in list rows, e.g. "Q3 2025" or "H1 2025" or "2025". */
export function formatPeriodLabel(period: Period | null | undefined): string {
  if (!period) return "—";
  switch (period.type) {
    case "PeriodYear":    return `${period.year}`;
    case "PeriodHalf":    return `H${period.half} ${period.year}`;
    case "PeriodQuarter": return `Q${period.quarter} ${period.year}`;
    default:              return "—";
  }
}

/** Extract the PeriodType discriminant from a Period object. */
export function periodTypeFromPeriod(period: Period): PeriodType {
  return period.type;
}

// ─── Read — paginated fetchers ────────────────────────────────────────────────

/** Fetch every goal in the account (auto-paginates). */
export async function fetchAllGoals(apiKey: string): Promise<Goal[]> {
  return fetchAllPages<Goal>(
    apiKey,
    "/lifecycle-manager/v1/goals",
    { page_size: "100" }
  );
}

/** Fetch every client in the account, sorted by name (auto-paginates). */
export async function fetchAllGoalClients(apiKey: string): Promise<GoalClient[]> {
  return fetchAllPages<GoalClient>(
    apiKey,
    "/core/v1/clients",
    { page_size: "200", sort: "name" }
  );
}

// ─── Write — individual update operations ────────────────────────────────────

/**
 * Create a new goal for a client. Returns the new goal's ID.
 */
export async function createGoal(
  apiKey: string,
  clientId: string,
  form: GoalTemplateForm
): Promise<string> {
  const period = buildPeriodObject(form.periodType, form.year, form.half, form.quarter);
  const json = await proxyCall(apiKey, "/lifecycle-manager/v1/goals", "POST", {
    client_key: { id: clientId },
    title: form.title,
    description: form.description || "",
    status: form.status,
    target_period: period,
  });
  return json.id as string;
}

/** Update an existing goal's title, description, status, and period. */
export async function updateGoal(
  apiKey: string,
  goalId: string,
  form: GoalTemplateForm
) {
  const period = buildPeriodObject(form.periodType, form.year, form.half, form.quarter);
  await proxyCall(apiKey, `/lifecycle-manager/v1/goals/${goalId}`, "PUT", {
    title: form.title,
    description: form.description || "",
    status: form.status,
    target_period: period,
  });
}

/** Update only the status of an existing goal. */
export async function updateGoalStatus(apiKey: string, goalId: string, status: string) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/goals/${goalId}/status`, "PUT", { status });
}

/** Update only the period schedule of an existing goal. */
export async function updateGoalSchedule(apiKey: string, goalId: string, period: Period | null) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/goals/${goalId}/schedule`, "PUT", {
    target_period: period,
  });
}

/** Permanently delete a goal by ID. */
export async function deleteGoal(apiKey: string, goalId: string) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/goals/${goalId}`, "DELETE");
}

// ─── Deploy — step sequencer ──────────────────────────────────────────────────

/**
 * Deploy a goal template to a single client.
 *
 * Executes 2 sequential API calls (create → update details). After each call,
 * `onStepUpdate` fires so the UI can display live progress. Throws on failure
 * so the caller can mark this client as failed and continue to the next.
 *
 * Steps:
 *   0 — Create goal (title, description, status, period)
 *   1 — Confirm details update
 *
 * @param onStepUpdate - Called after each step with its index, new status, and optional error message.
 */
export async function deployGoalToClient(
  apiKey: string,
  clientId: string,
  form: GoalTemplateForm,
  onStepUpdate: (stepIndex: number, status: StepStatus, error?: string) => void
) {
  const step = async (index: number, fn: () => Promise<void>) => {
    onStepUpdate(index, "running");
    try {
      await fn();
      onStepUpdate(index, "success");
    } catch (e) {
      onStepUpdate(index, "error", e instanceof Error ? e.message : "Unknown error");
      throw e;
    }
  };

  let goalId: string | undefined;

  await step(0, async () => {
    goalId = await createGoal(apiKey, clientId, form);
  });

  if (!goalId) throw new Error("Goal creation did not return an ID");

  await step(1, () => updateGoal(apiKey, goalId!, form));
}
