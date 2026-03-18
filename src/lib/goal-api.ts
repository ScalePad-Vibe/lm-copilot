/**
 * Goal Manager API helpers.
 * All calls are proxied through the scalepad-proxy edge function.
 */

import { supabase } from "@/integrations/supabase/client";

// --- Types ---

export type PeriodType = "PeriodYear" | "PeriodHalf" | "PeriodQuarter";

export interface PeriodYear {
  type: "PeriodYear";
  year: number;
}

export interface PeriodHalf {
  type: "PeriodHalf";
  year: number;
  half: 1 | 2;
}

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

export interface GoalTemplateForm {
  title: string;
  description: string;
  status: string;
  periodType: PeriodType;
  year: number;
  half: 1 | 2;
  quarter: 1 | 2 | 3 | 4;
}

export type StepStatus = "pending" | "running" | "success" | "error";

export interface DeploymentStep {
  name: string;
  status: StepStatus;
  error?: string;
}

export interface GoalClientDeployment {
  clientId: string;
  clientName: string;
  steps: DeploymentStep[];
}

// --- Helpers ---

async function proxyCall(
  apiKey: string,
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>
) {
  const { data: json, error: fnError } = await supabase.functions.invoke(
    "scalepad-proxy",
    {
      body: { endpoint, method, body },
      headers: { "x-scalepad-api-key": apiKey },
    }
  );

  if (fnError) throw new Error(fnError.message || "Edge function error");

  if (json?.upstream_status && json.upstream_status >= 400) {
    const detail =
      json.errors?.[0]?.detail || json.error || `API returned ${json.upstream_status}`;
    if (json.upstream_status === 403) {
      throw new Error(
        "API key does not have permission for Lifecycle Manager. Please check your ScalePad permissions."
      );
    }
    throw new Error(detail);
  }

  if (json?.error) throw new Error(json.error);

  return json;
}

// --- Period helpers ---

export function buildPeriodObject(
  periodType: PeriodType,
  year: number,
  half: 1 | 2,
  quarter: 1 | 2 | 3 | 4
): Period {
  switch (periodType) {
    case "PeriodYear":
      return { type: "PeriodYear", year };
    case "PeriodHalf":
      return { type: "PeriodHalf", year, half };
    case "PeriodQuarter":
      return { type: "PeriodQuarter", year, quarter };
  }
}

export function formatPeriodLabel(period: Period | null | undefined): string {
  if (!period) return "—";
  switch (period.type) {
    case "PeriodYear":
      return `${period.year}`;
    case "PeriodHalf":
      return `H${period.half} ${period.year}`;
    case "PeriodQuarter":
      return `Q${period.quarter} ${period.year}`;
    default:
      return "—";
  }
}

export function periodTypeFromPeriod(period: Period): PeriodType {
  return period.type;
}

// --- Paginated fetchers ---

export async function fetchAllGoals(apiKey: string): Promise<Goal[]> {
  const all: Goal[] = [];
  let cursor: string | null = null;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (cursor) params.set("cursor", cursor);

    const json = await proxyCall(
      apiKey,
      `/lifecycle-manager/v1/goals?${params.toString()}`
    );

    const items = json.data || [];
    all.push(...items);
    cursor = json.next_cursor || null;
  } while (cursor);

  return all;
}

export async function fetchAllGoalClients(apiKey: string): Promise<GoalClient[]> {
  const all: GoalClient[] = [];
  let cursor: string | null = null;

  do {
    const params = new URLSearchParams({ page_size: "200", sort: "name" });
    if (cursor) params.set("cursor", cursor);

    const json = await proxyCall(
      apiKey,
      `/core/v1/clients?${params.toString()}`
    );

    const items = json.data || [];
    all.push(...items);
    cursor = json.next_cursor || null;
  } while (cursor);

  return all;
}

// --- Write helpers ---

export async function createGoal(
  apiKey: string,
  clientId: string,
  formData: GoalTemplateForm
): Promise<string> {
  const period = buildPeriodObject(formData.periodType, formData.year, formData.half, formData.quarter);
  const json = await proxyCall(
    apiKey,
    "/lifecycle-manager/v1/goals",
    "POST",
    {
      client_key: { id: clientId },
      title: formData.title,
      description: formData.description || "",
      status: formData.status,
      target_period: period,
    }
  );
  return json.id;
}

export async function updateGoal(
  apiKey: string,
  goalId: string,
  formData: GoalTemplateForm
) {
  const period = buildPeriodObject(formData.periodType, formData.year, formData.half, formData.quarter);
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/goals/${goalId}`,
    "PUT",
    {
      title: formData.title,
      description: formData.description || "",
      status: formData.status,
      target_period: period,
    }
  );
}

export async function updateGoalStatus(
  apiKey: string,
  goalId: string,
  status: string
) {
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/goals/${goalId}/status`,
    "PUT",
    { status }
  );
}

export async function updateGoalSchedule(
  apiKey: string,
  goalId: string,
  period: Period | null
) {
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/goals/${goalId}/schedule`,
    "PUT",
    { target_period: period }
  );
}

export async function deleteGoal(apiKey: string, goalId: string) {
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/goals/${goalId}`,
    "DELETE"
  );
}

// --- Deployment orchestrator ---

export async function deployGoalToClient(
  apiKey: string,
  clientId: string,
  formData: GoalTemplateForm,
  onStepUpdate: (stepIndex: number, status: StepStatus, error?: string) => void
) {
  // Step 1: Create goal shell
  onStepUpdate(0, "running");
  let goalId: string;
  try {
    goalId = await createGoal(apiKey, clientId, formData);
    onStepUpdate(0, "success");
  } catch (e) {
    onStepUpdate(0, "error", e instanceof Error ? e.message : "Failed");
    throw e;
  }

  // Step 2: Update goal details
  onStepUpdate(1, "running");
  try {
    await updateGoal(apiKey, goalId, formData);
    onStepUpdate(1, "success");
  } catch (e) {
    onStepUpdate(1, "error", e instanceof Error ? e.message : "Failed");
    throw e;
  }
}
