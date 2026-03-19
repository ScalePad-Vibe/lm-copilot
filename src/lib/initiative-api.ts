/**
 * Initiative Manager — API helpers
 *
 * Covers the full lifecycle of a ScalePad initiative:
 *   - Fetching all initiatives and clients (paginated)
 *   - Creating, updating, and deleting initiatives
 *   - Deploying an initiative template to one or more clients (step sequencer)
 *
 * All network calls go through `proxyCall` in api-client.ts, which forwards
 * requests to the scalepad-proxy edge function → api.scalepad.com.
 *
 * ScalePad API reference: https://developers.scalepad.com
 */

import { proxyCall, fetchAllPages } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  cost_subunits: number;  // amount in cents (subunits of the client's currency)
  cost_type: "Fixed" | "PerAsset";
}

export interface RecurringLineItem {
  label: string;
  cost_subunits: number;
  cost_type: "Fixed" | "PerAsset";
  frequency: "Monthly" | "Yearly";
}

/** Form state used in the Initiative Builder UI */
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

/** UI representation of a budget line item (amounts as dollar strings for input binding) */
export interface BudgetLineItemForm {
  label: string;
  amount: string;  // dollars as string, e.g. "149.99"
  cost_type: "Fixed" | "PerAsset";
}

/** UI representation of a recurring line item */
export interface RecurringLineItemForm {
  label: string;
  amount: string;
  cost_type: "Fixed" | "PerAsset";
  frequency: "Monthly" | "Yearly";
}

/** Status of a single step in the deployment sequence */
export type StepStatus = "pending" | "running" | "success" | "error";

export interface DeploymentStep {
  name: string;
  status: StepStatus;
  error?: string;
}

/** Per-client deployment state used to render the deploy progress UI */
export interface ClientDeployment {
  clientId: string;
  clientName: string;
  steps: DeploymentStep[];
}

// ─── Read — paginated fetchers ────────────────────────────────────────────────

/** Fetch every initiative in the account (auto-paginates). */
export async function fetchAllInitiatives(apiKey: string): Promise<Initiative[]> {
  return fetchAllPages<Initiative>(
    apiKey,
    "/lifecycle-manager/v1/initiatives",
    { page_size: "100" }
  );
}

/** Fetch every client in the account, sorted by name (auto-paginates). */
export async function fetchAllClients(apiKey: string): Promise<Client[]> {
  return fetchAllPages<Client>(
    apiKey,
    "/core/v1/clients",
    { page_size: "200", sort: "name" }
  );
}

// ─── Write — individual update operations ────────────────────────────────────

/**
 * Create a new empty initiative shell for a client.
 * Returns the new initiative's ID.
 */
async function createInitiative(
  apiKey: string,
  clientId: string,
  name: string,
  executiveSummary: string
): Promise<string> {
  const json = await proxyCall(apiKey, "/lifecycle-manager/v1/initiatives", "POST", {
    client_key: { id: clientId },
    name,
    executive_summary: executiveSummary,
  });
  return json.id as string;
}

async function updateInitiativeStatus(apiKey: string, id: string, status: string) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/initiatives/${id}/status`, "PUT", { status });
}

async function updateInitiativePriority(apiKey: string, id: string, priority: string) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/initiatives/${id}/priority`, "PUT", { priority });
}

async function updateInitiativeSchedule(
  apiKey: string,
  id: string,
  fiscalQuarter: { year: number; quarter: number } | null
) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/initiatives/${id}/schedule`, "PUT", {
    fiscal_quarter: fiscalQuarter,
  });
}

async function updateInitiativeBudget(
  apiKey: string,
  id: string,
  lineItems: BudgetLineItem[]
) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/initiatives/${id}/budget`, "PUT", {
    budget_line_items: lineItems,
  });
}

async function updateInitiativeRecurring(
  apiKey: string,
  id: string,
  lineItems: RecurringLineItem[]
) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/initiatives/${id}/recurring`, "PUT", {
    recurring_line_items: lineItems,
  });
}

/** Permanently delete an initiative by ID. */
export async function deleteInitiative(apiKey: string, initiativeId: string) {
  await proxyCall(apiKey, `/lifecycle-manager/v1/initiatives/${initiativeId}`, "DELETE");
}

// ─── Deploy — step sequencer ──────────────────────────────────────────────────

/**
 * Deploy an initiative template to a single client.
 *
 * Executes 6 sequential API calls. After each call, `onStepUpdate` is fired so
 * the UI can display live progress. Throws on first failure — the caller is
 * responsible for marking the deployment as failed and continuing to the next client.
 *
 * Steps:
 *   0 — Create initiative shell
 *   1 — Set status
 *   2 — Set priority
 *   3 — Set schedule (fiscal quarter)
 *   4 — Set one-time budget line items
 *   5 — Set recurring line items
 *
 * @param onStepUpdate - Called after each step with its index, new status, and optional error message.
 */
export async function deployInitiativeToClient(
  apiKey: string,
  clientId: string,
  form: TemplateForm,
  onStepUpdate: (stepIndex: number, status: StepStatus, error?: string) => void
) {
  /** Convert dollar string input ("149.99") → integer cents (14999) */
  const toCents = (val: string) => Math.round(parseFloat(val || "0") * 100);

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

  let initiativeId!: string;

  await step(0, async () => {
    initiativeId = await createInitiative(apiKey, clientId, form.name, form.executive_summary);
  });

  await step(1, () => updateInitiativeStatus(apiKey, initiativeId, form.status));
  await step(2, () => updateInitiativePriority(apiKey, initiativeId, form.priority));
  await step(3, () =>
    updateInitiativeSchedule(apiKey, initiativeId, form.unscheduled ? null : form.fiscal_quarter)
  );

  await step(4, () =>
    updateInitiativeBudget(
      apiKey,
      initiativeId,
      form.budget_line_items.map((item) => ({
        label: item.label,
        cost_subunits: toCents(item.amount),
        cost_type: item.cost_type,
      }))
    )
  );

  await step(5, () =>
    updateInitiativeRecurring(
      apiKey,
      initiativeId,
      form.recurring_line_items.map((item) => ({
        label: item.label,
        cost_subunits: toCents(item.amount),
        cost_type: item.cost_type,
        frequency: item.frequency,
      }))
    )
  );
}
