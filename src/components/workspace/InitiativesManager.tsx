import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAllInitiatives,
  fetchAllClients,
  deployInitiativeToClient,
  deleteInitiative,
  type Initiative,
  type Client,
  type TemplateForm,
  type BudgetLineItemForm,
  type RecurringLineItemForm,
  type ClientDeployment,
  type StepStatus,
} from "@/lib/initiative-api";
import {
  Loader2,
  Search,
  X,
  Plus,
  Trash2,
  Play,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Badge, StepIcon, Pagination, WorkspaceLoader, WorkspaceError, Panel, PanelHeader, PanelLabel, PanelSearch, PanelBody, PanelEmpty, smallSelectCls, inputCls, selectCls } from "@/components/workspace/Shared";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

// --- Constants ---

const PAGE_SIZE = 8;
const STATUSES = ["New", "Proposed", "Approved", "InProgress", "OnHold", "Declined", "Completed"];
const PRIORITIES = ["None", "Low", "Medium", "High"];
const DEPLOY_STEPS = [
  "Create Initiative Shell",
  "Set Status",
  "Set Priority",
  "Set Schedule",
  "Set One-Time Budget",
  "Set Recurring Budget",
];

const STATUS_COLORS: Record<string, string> = {
  New:        "bg-primary/15 text-primary",
  Proposed:   "bg-purple-500/15 text-purple-400",
  Approved:   "bg-success/15 text-success",
  InProgress: "bg-cyan-500/15 text-cyan-400",
  OnHold:     "bg-warning/15 text-warning",
  Declined:   "bg-destructive/15 text-destructive",
  Completed:  "bg-muted text-muted-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  High:   "bg-destructive/15 text-destructive",
  Medium: "bg-warning/15 text-warning",
  Low:    "bg-primary/15 text-primary",
  None:   "bg-muted text-muted-foreground",
};

function emptyForm(): TemplateForm {
  return {
    name: "",
    executive_summary: "",
    status: "New",
    priority: "None",
    fiscal_quarter: { year: new Date().getFullYear(), quarter: 1 },
    unscheduled: false,
    budget_line_items: [],
    recurring_line_items: [],
  };
}

// --- Main Component ---

export function InitiativesManager() {
  const { apiKey } = useAuth();

  // Data
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("");

  // Library filters & pagination
  const [libSearch, setLibSearch] = useState("");
  const [libStatus, setLibStatus] = useState("All");
  const [libPriority, setLibPriority] = useState("All");
  const [libClient, setLibClient] = useState("All");
  const [libPage, setLibPage] = useState(1);

  // Bulk delete
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Builder
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm());
  const [activeTab, setActiveTab] = useState<"details" | "budget" | "recurring" | "clients">("details");

  // Client selection & pagination
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [clientPage, setClientPage] = useState(1);

  // Deploy confirmation
  const [showConfirmDeploy, setShowConfirmDeploy] = useState(false);

  // Deployment
  const [deployState, setDeployState] = useState<{
    isOpen: boolean;
    progress: ClientDeployment[];
    overallStatus: "running" | "complete";
    succeeded: number;
    failed: number;
  } | null>(null);

  // --- Load data ---
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setLoadingText("Loading initiatives...");
    try {
      const [initData, clientData] = await Promise.all([
        fetchAllInitiatives(apiKey).then((d) => { setLoadingText("Loading clients..."); return d; }),
        fetchAllClients(apiKey),
      ]);
      setInitiatives(initData);
      setClients(clientData);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- Filtered initiatives ---
  const filteredInitiatives = useMemo(() => initiatives.filter((i) => {
    if (libStatus !== "All" && i.status !== libStatus) return false;
    if (libPriority !== "All" && i.priority !== libPriority) return false;
    if (libClient !== "All" && (i.client?.label ?? "") !== libClient) return false;
    if (libSearch) {
      const q = libSearch.toLowerCase();
      if (!i.name.toLowerCase().includes(q) && !(i.client?.label ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [initiatives, libSearch, libStatus, libPriority, libClient]);

  useEffect(() => { setLibPage(1); }, [libSearch, libStatus, libPriority, libClient]);

  const libClientOptions = useMemo(
    () => [...new Set(initiatives.map((i) => i.client?.label).filter(Boolean))].sort() as string[],
    [initiatives]
  );

  const libTotalPages = Math.max(1, Math.ceil(filteredInitiatives.length / PAGE_SIZE));
  const pagedInitiatives = filteredInitiatives.slice((libPage - 1) * PAGE_SIZE, libPage * PAGE_SIZE);

  // --- Filtered clients ---
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
  }, [clients, clientSearch]);

  useEffect(() => { setClientPage(1); }, [clientSearch]);

  const clientTotalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const pagedClients = filteredClients.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE);

  // --- Bulk delete ---
  const allPageChecked = pagedInitiatives.length > 0 && pagedInitiatives.every((i) => checkedIds.has(i.id));

  const togglePageAll = () => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allPageChecked) pagedInitiatives.forEach((i) => next.delete(i.id));
      else pagedInitiatives.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedForDelete = initiatives.filter((i) => checkedIds.has(i.id));

  const handleBulkDelete = async () => {
    setDeleting(true);
    let deleted = 0;
    for (const init of selectedForDelete) {
      try {
        await deleteInitiative(apiKey, init.id);
        deleted++;
      } catch (e) {
        toast({ title: `Failed to delete "${init.name}"`, description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      }
    }
    if (deleted > 0) toast({ title: `${deleted} initiative(s) deleted` });
    setCheckedIds(new Set());
    setShowDeleteModal(false);
    setDeleting(false);
    loadData();
  };

  // --- Load template ---
  const loadTemplate = (init: Initiative) => {
    setSelectedInitiative(init);
    setForm({
      name: init.name,
      executive_summary: init.executive_summary || "",
      status: init.status,
      priority: init.priority,
      fiscal_quarter: init.fiscal_quarter
        ? { year: init.fiscal_quarter.year, quarter: init.fiscal_quarter.quarter }
        : { year: new Date().getFullYear(), quarter: 1 },
      unscheduled: !init.fiscal_quarter,
      budget_line_items: (init.budget?.line_items || []).map((li) => ({
        label: li.label,
        amount: (li.cost_subunits / 100).toFixed(2),
        cost_type: li.cost_type as "Fixed" | "PerAsset",
      })),
      recurring_line_items: (init.budget?.recurring_line_items || []).map((li) => ({
        label: li.label,
        amount: (li.cost_subunits / 100).toFixed(2),
        cost_type: li.cost_type as "Fixed" | "PerAsset",
        frequency: li.frequency as "Monthly" | "Yearly",
      })),
    });
    setSelectedClientIds([]);
    setActiveTab("details");
  };

  const clearForm = () => { setSelectedInitiative(null); setForm(emptyForm()); setSelectedClientIds([]); };

  // --- Form updaters ---
  const updateForm = (patch: Partial<TemplateForm>) => setForm((f) => ({ ...f, ...patch }));
  const updateBudgetItem = (idx: number, patch: Partial<BudgetLineItemForm>) =>
    setForm((f) => ({ ...f, budget_line_items: f.budget_line_items.map((item, i) => i === idx ? { ...item, ...patch } : item) }));
  const updateRecurringItem = (idx: number, patch: Partial<RecurringLineItemForm>) =>
    setForm((f) => ({ ...f, recurring_line_items: f.recurring_line_items.map((item, i) => i === idx ? { ...item, ...patch } : item) }));

  // --- Budget totals ---
  const budgetTotal  = useMemo(() => form.budget_line_items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), [form.budget_line_items]);
  const monthlyTotal = useMemo(() => form.recurring_line_items.filter((i) => i.frequency === "Monthly").reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), [form.recurring_line_items]);
  const yearlyTotal  = useMemo(() => form.recurring_line_items.filter((i) => i.frequency === "Yearly").reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), [form.recurring_line_items]);

  const canDeploy = form.name.trim() !== "" && selectedClientIds.length > 0;

  // --- Deploy ---
  const handleDeploy = async () => {
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));
    const progress: ClientDeployment[] = selectedClientIds.map((cid) => ({
      clientId: cid,
      clientName: clientMap.get(cid) || cid,
      steps: DEPLOY_STEPS.map((name) => ({ name, status: "pending" as StepStatus })),
    }));
    setDeployState({ isOpen: true, progress, overallStatus: "running", succeeded: 0, failed: 0 });
    let succeeded = 0, failed = 0;
    for (let ci = 0; ci < selectedClientIds.length; ci++) {
      const clientId = selectedClientIds[ci];
      try {
        await deployInitiativeToClient(apiKey, clientId, form, (stepIdx, status, error) => {
          setDeployState((prev) => {
            if (!prev) return prev;
            const next = { ...prev, progress: [...prev.progress] };
            next.progress[ci] = { ...next.progress[ci], steps: next.progress[ci].steps.map((s, si) => si === stepIdx ? { ...s, status, error } : s) };
            return next;
          });
        });
        succeeded++;
      } catch { failed++; }
      setDeployState((prev) => (prev ? { ...prev, succeeded, failed } : prev));
    }
    setDeployState((prev) => (prev ? { ...prev, overallStatus: "complete", succeeded, failed } : prev));
  };

  const closeDeployModal = (refresh: boolean) => {
    setDeployState(null);
    if (refresh) { clearForm(); loadData(); }
  };

  // --- Render ---
  if (loading) return <WorkspaceLoader message={loadingText} />;
  if (loadError) return <WorkspaceError message={loadError} onRetry={loadData} />;

  return (
    <>
      <div className="flex gap-4 h-full">

        {/* LEFT PANEL — Library */}
        <Panel className="w-[40%]">
          <PanelHeader>
            <PanelLabel
              label="Initiatives Library"
              count={initiatives.length}
              action={checkedIds.size > 0 && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-xs bg-destructive/15 text-destructive hover:bg-destructive/25 px-2.5 py-1 rounded-md font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete ({checkedIds.size})
                </button>
              )}
            />
            <PanelSearch value={libSearch} onChange={setLibSearch} placeholder="Search client or initiative…" />
            <div className="flex gap-2">
              <select value={libStatus} onChange={(e) => setLibStatus(e.target.value)} className={smallSelectCls}>
                <option value="All">All Status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={libPriority} onChange={(e) => setLibPriority(e.target.value)} className={smallSelectCls}>
                <option value="All">All Priority</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </PanelHeader>

          {/* Select-all row */}
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border/15 bg-surface-container/50">
            <Checkbox checked={allPageChecked} onCheckedChange={togglePageAll} className="h-3.5 w-3.5" />
            <span className="text-[10px] text-muted-foreground">Select all on page</span>
          </div>

          <PanelBody>
            {pagedInitiatives.length === 0 ? (
              <PanelEmpty message="No initiatives found." />
            ) : (
              pagedInitiatives.map((init) => (
                <div
                  key={init.id}
                  className={`group flex items-start gap-2 px-4 py-3 border-b border-border/10 hover:bg-surface-container transition-colors ${
                    selectedInitiative?.id === init.id ? "bg-primary/8 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={checkedIds.has(init.id)} onCheckedChange={() => toggleCheck(init.id)} className="h-3.5 w-3.5" />
                  </div>
                  <button onClick={() => loadTemplate(init)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground truncate pr-2">{init.name}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">{init.client?.label || "—"}</span>
                      <Badge className={`rounded-full text-[10px] font-bold uppercase tracking-tight ${STATUS_COLORS[init.status] || "bg-muted text-muted-foreground"}`}>
                        {init.status}
                      </Badge>
                      <Badge className={`rounded-full text-[10px] font-bold uppercase tracking-tight ${PRIORITY_COLORS[init.priority] || "bg-muted text-muted-foreground"}`}>
                        {init.priority}
                      </Badge>
                      {init.fiscal_quarter && (
                        <span className="text-[10px] text-muted-foreground">Q{init.fiscal_quarter.quarter} {init.fiscal_quarter.year}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{init.asset_count} assets</span>
                    </div>
                  </button>
                </div>
              ))
            )}
          </PanelBody>

          <Pagination page={libPage} totalPages={libTotalPages} onPageChange={setLibPage} />
        </Panel>

        {/* RIGHT PANEL — Builder */}
        <Panel className="w-[60%]">
          <div className="px-4 pt-4 pb-3 border-b border-border/15 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Initiative Builder</p>
              <p className="text-xs text-foreground mt-0.5 font-medium truncate">
                {selectedInitiative ? selectedInitiative.name : "New Initiative"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!form.name.trim() && (
                <span className="text-[10px] text-warning/80 bg-warning/10 px-2 py-0.5 rounded-full">Name required</span>
              )}
              {form.name.trim() && selectedClientIds.length === 0 && (
                <span className="text-[10px] text-muted-foreground bg-surface-container px-2 py-0.5 rounded-full">Select clients →</span>
              )}
              {canDeploy && (
                <span className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full">Ready to deploy</span>
              )}
              <button onClick={clearForm} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/15">
            {(["details", "budget", "recurring", "clients"] as const).map((key) => {
              const labels: Record<string, string> = { details: "Details", budget: "One-Time Budget", recurring: "Recurring", clients: `Clients (${selectedClientIds.length})` };
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                    activeTab === key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[key]}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === "details" && (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Initiative Name *</label>
                  <input type="text" value={form.name} onChange={(e) => updateForm({ name: e.target.value })} placeholder="Enter initiative name" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex justify-between">
                    <span>Executive Summary</span>
                    <span className="normal-case tracking-normal font-normal">{form.executive_summary.length}/500</span>
                  </label>
                  <textarea
                    value={form.executive_summary}
                    onChange={(e) => updateForm({ executive_summary: e.target.value.slice(0, 500) })}
                    rows={4}
                    placeholder="Enter executive summary"
                    className="w-full px-3 py-2 bg-surface-container border-none rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Status</label>
                    <select value={form.status} onChange={(e) => updateForm({ status: e.target.value })} className={selectCls}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Priority</label>
                    <select value={form.priority} onChange={(e) => updateForm({ priority: e.target.value })} className={selectCls}>
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Fiscal Quarter</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={form.fiscal_quarter?.year || new Date().getFullYear()}
                      onChange={(e) => { const year = parseInt(e.target.value); if (year >= 2020 && year <= 2040) updateForm({ fiscal_quarter: { ...form.fiscal_quarter!, year, quarter: form.fiscal_quarter?.quarter || 1 } }); }}
                      disabled={form.unscheduled}
                      min={2020} max={2040}
                      className="w-24 h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
                    />
                    <select
                      value={form.fiscal_quarter?.quarter || 1}
                      onChange={(e) => updateForm({ fiscal_quarter: { ...form.fiscal_quarter!, year: form.fiscal_quarter?.year || new Date().getFullYear(), quarter: parseInt(e.target.value) } })}
                      disabled={form.unscheduled}
                      className="w-20 h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
                    >
                      {[1,2,3,4].map((q) => <option key={q} value={q}>Q{q}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={form.unscheduled} onChange={(e) => updateForm({ unscheduled: e.target.checked })} className="accent-primary" />
                      Leave unscheduled
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === "budget" && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">One-Time Investments</p>
                  <button onClick={() => updateForm({ budget_line_items: [...form.budget_line_items, { label: "", amount: "", cost_type: "Fixed" }] })} className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> Add Line Item
                  </button>
                </div>
                {form.budget_line_items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No budget line items. Click "Add Line Item" to start.</p>
                )}
                {form.budget_line_items.map((item, idx) => (
                  <div key={idx} className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground mb-0.5 block">Label</label>
                      <input type="text" value={item.label} onChange={(e) => updateBudgetItem(idx, { label: e.target.value.slice(0, 400) })} placeholder="Item label" className="w-full h-8 px-2 bg-surface-container border-none rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="w-28">
                      <label className="text-[10px] text-muted-foreground mb-0.5 block">Amount ($)</label>
                      <input type="number" value={item.amount} onChange={(e) => updateBudgetItem(idx, { amount: e.target.value })} placeholder="0.00" min="0" step="0.01" className="w-full h-8 px-2 bg-surface-container border-none rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-muted-foreground mb-0.5 block">Type</label>
                      <select value={item.cost_type} onChange={(e) => updateBudgetItem(idx, { cost_type: e.target.value as "Fixed" | "PerAsset" })} className="w-full h-8 px-2 bg-surface-container border-none rounded text-xs text-foreground focus:outline-none">
                        <option value="Fixed">Fixed</option>
                        <option value="PerAsset">Per Asset</option>
                      </select>
                    </div>
                    <button onClick={() => updateForm({ budget_line_items: form.budget_line_items.filter((_, i) => i !== idx) })} className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/15 flex justify-between text-xs">
                  <span className="text-muted-foreground">Total One-Time</span>
                  <span className="font-mono font-medium text-foreground">${budgetTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Amounts in USD</p>
              </>
            )}

            {activeTab === "recurring" && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Recurring Investments</p>
                  <button onClick={() => updateForm({ recurring_line_items: [...form.recurring_line_items, { label: "", amount: "", cost_type: "Fixed", frequency: "Monthly" }] })} className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> Add Recurring Item
                  </button>
                </div>
                {form.recurring_line_items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No recurring items. Click "Add Recurring Item" to start.</p>
                )}
                {form.recurring_line_items.map((item, idx) => (
                  <div key={idx} className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground mb-0.5 block">Label</label>
                      <input type="text" value={item.label} onChange={(e) => updateRecurringItem(idx, { label: e.target.value.slice(0, 400) })} placeholder="Item label" className="w-full h-8 px-2 bg-surface-container border-none rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-muted-foreground mb-0.5 block">Amount ($)</label>
                      <input type="number" value={item.amount} onChange={(e) => updateRecurringItem(idx, { amount: e.target.value })} placeholder="0.00" min="0" step="0.01" className="w-full h-8 px-2 bg-surface-container border-none rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] text-muted-foreground mb-0.5 block">Type</label>
                      <select value={item.cost_type} onChange={(e) => updateRecurringItem(idx, { cost_type: e.target.value as "Fixed" | "PerAsset" })} className="w-full h-8 px-2 bg-surface-container border-none rounded text-xs text-foreground focus:outline-none">
                        <option value="Fixed">Fixed</option>
                        <option value="PerAsset">Per Asset</option>
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-muted-foreground mb-0.5 block">Frequency</label>
                      <select value={item.frequency} onChange={(e) => updateRecurringItem(idx, { frequency: e.target.value as "Monthly" | "Yearly" })} className="w-full h-8 px-2 bg-surface-container border-none rounded text-xs text-foreground focus:outline-none">
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                    <button onClick={() => updateForm({ recurring_line_items: form.recurring_line_items.filter((_, i) => i !== idx) })} className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/15 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Total</span>
                    <span className="font-mono font-medium text-foreground">${monthlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yearly Total</span>
                    <span className="font-mono font-medium text-foreground">${yearlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "clients" && (
              <>
                <p className="text-xs text-muted-foreground">Select which clients to create this initiative for</p>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input type="text" placeholder="Search clients…" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} className="w-full h-8 pl-8 pr-3 bg-surface-container border-none rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{selectedClientIds.length} clients selected</span>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedClientIds(clients.map((c) => c.id))} className="text-[10px] text-primary hover:underline">Select All</button>
                    <button onClick={() => setSelectedClientIds([])} className="text-[10px] text-muted-foreground hover:underline">Deselect All</button>
                  </div>
                </div>
                <div className="border border-border/15 rounded-lg divide-y divide-border/10">
                  {pagedClients.map((client) => (
                    <label key={client.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-surface-container transition-colors">
                      <input type="checkbox" checked={selectedClientIds.includes(client.id)} onChange={(e) => { if (e.target.checked) setSelectedClientIds((prev) => [...prev, client.id]); else setSelectedClientIds((prev) => prev.filter((id) => id !== client.id)); }} className="accent-primary" />
                      <span className="text-xs text-foreground flex-1">{client.name}</span>
                      <Badge className="bg-muted text-muted-foreground">{client.lifecycle}</Badge>
                      <span className="text-[10px] text-muted-foreground">{client.num_hardware_assets} assets</span>
                    </label>
                  ))}
                  {pagedClients.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No clients found.</p>}
                </div>
                <Pagination page={clientPage} totalPages={clientTotalPages} onPageChange={setClientPage} />
              </>
            )}
          </div>

          {/* Deploy Button */}
          <div className="p-4 border-t border-border/15">
            <button
              onClick={() => setShowConfirmDeploy(true)}
              disabled={!canDeploy}
              className="w-full h-10 bg-gradient-to-br from-primary to-primary-dim disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            >
              <Play className="w-4 h-4" />
              Deploy Initiative to {selectedClientIds.length} Client{selectedClientIds.length !== 1 ? "s" : ""}
            </button>
          </div>
        </Panel>
      </div>

      {/* DEPLOY CONFIRMATION DIALOG */}
      <AlertDialog open={showConfirmDeploy} onOpenChange={setShowConfirmDeploy}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deployment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">"{form.name}"</span> will be deployed to the following {selectedClientIds.length} client{selectedClientIds.length !== 1 ? "s" : ""}:
                </p>
                <ul className="list-disc list-inside space-y-0.5 max-h-40 overflow-y-auto">
                  {selectedClientIds.map((cid) => {
                    const name = clients.find((c) => c.id === cid)?.name || cid;
                    return <li key={cid} className="text-foreground text-xs">{name}</li>;
                  })}
                </ul>
                <p className="text-xs">This will create a new initiative for each selected client.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowConfirmDeploy(false); handleDeploy(); }}>
              Deploy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {deployState?.isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-surface border border-border/20 rounded-xl shadow-2xl max-h-[85vh] flex flex-col animate-scale-in">
            <div className="p-5 border-b border-border/15">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {deployState.overallStatus === "running" ? "Deploying Initiative…" : "Deployment Complete"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {deployState.overallStatus === "running"
                  ? `Creating initiative for ${selectedClientIds.length} client(s) — do not close this window`
                  : `${deployState.succeeded} succeeded · ${deployState.failed} had errors`}
              </p>
              {deployState.overallStatus === "running" && (
                <div className="mt-3">
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${((deployState.succeeded + deployState.failed) / deployState.progress.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{deployState.succeeded + deployState.failed} of {deployState.progress.length} clients complete</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {deployState.progress.map((client, ci) => {
                const allSuccess = client.steps.every((s) => s.status === "success");
                const hasError   = client.steps.some((s) => s.status === "error");
                return (
                  <div key={ci} className={`border rounded-lg p-3 ${allSuccess ? "border-success/20 bg-success/5" : hasError ? "border-destructive/20 bg-destructive/5" : "border-border/15"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">{client.clientName}</span>
                      {allSuccess && <Badge className="rounded-full text-[10px] font-bold uppercase tracking-tight bg-success/15 text-success">Complete</Badge>}
                      {hasError   && <Badge className="rounded-full text-[10px] font-bold uppercase tracking-tight bg-destructive/15 text-destructive">Partially Failed</Badge>}
                    </div>
                    <div className="space-y-1">
                      {client.steps.map((step, si) => (
                        <div key={si} className="flex items-center gap-2 text-[11px]">
                          <StepIcon status={step.status} />
                          <span className={step.status === "error" ? "text-destructive" : "text-muted-foreground"}>
                            Step {si + 1}: {step.name}
                          </span>
                          {step.error && <span className="text-destructive ml-auto truncate max-w-[200px]" title={step.error}>{step.error}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {deployState.overallStatus === "complete" && (
              <div className="p-4 border-t border-border/15 flex gap-2 justify-end">
                <button onClick={() => closeDeployModal(false)} className="px-4 py-2 bg-surface-container border-none text-sm rounded-lg text-foreground hover:bg-surface-container-high transition-colors">
                  Deploy Another
                </button>
                <button onClick={() => closeDeployModal(true)} className="px-4 py-2 bg-gradient-to-br from-primary to-primary-dim text-primary-foreground text-sm rounded-lg hover:opacity-90 flex items-center gap-1.5 transition-opacity">
                  <RefreshCw className="w-3.5 h-3.5" /> Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border/20 rounded-xl shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-border/15">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Delete {selectedForDelete.length} Initiative{selectedForDelete.length !== 1 ? "s" : ""}?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">This will permanently delete the following initiatives and cannot be undone:</p>
            </div>
            <div className="p-5 max-h-48 overflow-y-auto">
              <ul className="list-disc list-inside space-y-1">
                {selectedForDelete.map((init) => <li key={init.id} className="text-xs text-foreground">{init.name}</li>)}
              </ul>
            </div>
            <div className="p-4 border-t border-border/15 flex gap-2 justify-end">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting} className="px-4 py-2 bg-surface-container border-none text-sm rounded-lg text-foreground hover:bg-surface-container-high disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleBulkDelete} disabled={deleting} className="px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-destructive/90 flex items-center gap-1.5 disabled:opacity-50 transition-colors">
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
