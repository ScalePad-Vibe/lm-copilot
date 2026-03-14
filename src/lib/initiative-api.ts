/**
 * Initiative Manager API helpers.
 * All calls are proxied through the scalepad-proxy edge function.
 */

import { supabase } from "@/integrations/supabase/client";

// --- Types ---

export interface Initiative {
  id: string;
  name: string;
  executive_summary: string | null;
  status: string;
  priority: string;
  fiscal_quarter: { year: number; quarter: number } | null;
  asset_count: number;
  assigned_user_id: string;
  client: { id: string; label: string };
  budget: {
    currency: { code_alpha: string; subunit_ratio: number };
    line_items: BudgetLineItem[];
    recurring_line_items: RecurringLineItem[];
  };
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  lifecycle: string;
  num_hardware_assets: number;
  num_contacts: number;
}

export interface BudgetLineItem {
  label: string;
  cost_subunits: number;
  cost_type: "Fixed" | "PerAsset";
}

export interface RecurringLineItem {
  label: string;
  cost_subunits: number;
  cost_type: "Fixed" | "PerAsset";
  frequency: "Monthly" | "Yearly";
}

export interface TemplateForm {
  name: string;
  executive_summary: string;
  status: string;
  priority: string;
  fiscal_quarter: { year: number; quarter: number } | null;
  unscheduled: boolean;
  budget_line_items: BudgetLineItemForm[];
  recurring_line_items: RecurringLineItemForm[];
}

export interface BudgetLineItemForm {
  label: string;
  amount: string; // dollars as string for input
  cost_type: "Fixed" | "PerAsset";
}

export interface RecurringLineItemForm {
  label: string;
  amount: string;
  cost_type: "Fixed" | "PerAsset";
  frequency: "Monthly" | "Yearly";
}

export type StepStatus = "pending" | "running" | "success" | "error";

export interface DeploymentStep {
  name: string;
  status: StepStatus;
  error?: string;
}

export interface ClientDeployment {
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

// --- Paginated fetchers ---

export async function fetchAllInitiatives(apiKey: string): Promise<Initiative[]> {
  const all: Initiative[] = [];
  let cursor: string | null = null;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (cursor) params.set("cursor", cursor);

    const json = await proxyCall(
      apiKey,
      `/lifecycle-manager/v1/initiatives?${params.toString()}`
    );

    const items = json.data || [];
    all.push(...items);
    cursor = json.next_cursor || null;
  } while (cursor);

  return all;
}

export async function fetchAllClients(apiKey: string): Promise<Client[]> {
  const all: Client[] = [];
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

async function createInitiative(
  apiKey: string,
  clientId: string,
  name: string,
  summary: string
): Promise<string> {
  const json = await proxyCall(
    apiKey,
    "/lifecycle-manager/v1/initiatives",
    "POST",
    {
      client_key: { id: clientId },
      name,
      executive_summary: summary,
    }
  );
  return json.id;
}

async function updateInitiativeStatus(
  apiKey: string,
  initiativeId: string,
  status: string
) {
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/initiatives/${initiativeId}/status`,
    "PUT",
    { status }
  );
}

async function updateInitiativePriority(
  apiKey: string,
  initiativeId: string,
  priority: string
) {
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/initiatives/${initiativeId}/priority`,
    "PUT",
    { priority }
  );
}

async function updateInitiativeSchedule(
  apiKey: string,
  initiativeId: string,
  fiscalQuarter: { year: number; quarter: number } | null
) {
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/initiatives/${initiativeId}/schedule`,
    "PUT",
    { fiscal_quarter: fiscalQuarter }
  );
}

async function updateInitiativeBudget(
  apiKey: string,
  initiativeId: string,
  budgetLineItems: BudgetLineItem[]
) {
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/initiatives/${initiativeId}/budget`,
    "PUT",
    { budget_line_items: budgetLineItems }
  );
}

async function updateInitiativeRecurring(
  apiKey: string,
  initiativeId: string,
  recurringLineItems: RecurringLineItem[]
) {
  await proxyCall(
    apiKey,
    `/lifecycle-manager/v1/initiatives/${initiativeId}/recurring`,
    "PUT",
    { recurring_line_items: recurringLineItems }
  );
}

// --- Deployment orchestrator ---

export async function deployInitiativeToClient(
  apiKey: string,
  clientId: string,
  form: TemplateForm,
  onStepUpdate: (stepIndex: number, status: StepStatus, error?: string) => void
) {
  const dollarsToCents = (val: string) => Math.round(parseFloat(val || "0") * 100);

  // Step 1: Create shell
  onStepUpdate(0, "running");
  let initiativeId: string;
  try {
    initiativeId = await createInitiative(apiKey, clientId, form.name, form.executive_summary);
    onStepUpdate(0, "success");
  } catch (e) {
    onStepUpdate(0, "error", e instanceof Error ? e.message : "Failed");
    throw e;
  }

  // Step 2: Set Status
  onStepUpdate(1, "running");
  try {
    await updateInitiativeStatus(apiKey, initiativeId, form.status);
    onStepUpdate(1, "success");
  } catch (e) {
    onStepUpdate(1, "error", e instanceof Error ? e.message : "Failed");
    throw e;
  }

  // Step 3: Set Priority
  onStepUpdate(2, "running");
  try {
    await updateInitiativePriority(apiKey, initiativeId, form.priority);
    onStepUpdate(2, "success");
  } catch (e) {
    onStepUpdate(2, "error", e instanceof Error ? e.message : "Failed");
    throw e;
  }

  // Step 4: Set Schedule
  onStepUpdate(3, "running");
  try {
    await updateInitiativeSchedule(
      apiKey,
      initiativeId,
      form.unscheduled ? null : form.fiscal_quarter
    );
    onStepUpdate(3, "success");
  } catch (e) {
    onStepUpdate(3, "error", e instanceof Error ? e.message : "Failed");
    throw e;
  }

  // Step 5: Set Budget
  onStepUpdate(4, "running");
  try {
    const budgetItems: BudgetLineItem[] = form.budget_line_items.map((item) => ({
      label: item.label,
      cost_subunits: dollarsToCents(item.amount),
      cost_type: item.cost_type,
    }));
    await updateInitiativeBudget(apiKey, initiativeId, budgetItems);
    onStepUpdate(4, "success");
  } catch (e) {
    onStepUpdate(4, "error", e instanceof Error ? e.message : "Failed");
    throw e;
  }

  // Step 6: Set Recurring
  onStepUpdate(5, "running");
  try {
    const recurringItems: RecurringLineItem[] = form.recurring_line_items.map((item) => ({
      label: item.label,
      cost_subunits: dollarsToCents(item.amount),
      cost_type: item.cost_type,
      frequency: item.frequency,
    }));
    await updateInitiativeRecurring(apiKey, initiativeId, recurringItems);
    onStepUpdate(5, "success");
  } catch (e) {
    onStepUpdate(5, "error", e instanceof Error ? e.message : "Failed");
    throw e;
  }
}
