import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAllGoals,
  fetchAllGoalClients,
  deployGoalToClient,
  deleteGoal,
  updateGoal,
  formatPeriodLabel,
  periodTypeFromPeriod,
  type Goal,
  type GoalClient,
  type GoalTemplateForm,
  type GoalClientDeployment,
  type StepStatus,
  type PeriodType,
} from "@/lib/goal-api";
import {
  Loader2,
  Search,
  X,
  Trash2,
  Play,
  RefreshCw,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Badge, StepIcon, Pagination, WorkspaceLoader, WorkspaceError } from "@/components/workspace/Shared";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

// --- Constants ---

const PAGE_SIZE = 8;
const STATUSES = ["OnTrack", "AtRisk", "OffTrack", "OnHold", "Complete"];
const PERIOD_TYPES: { value: PeriodType; label: string }[] = [
  { value: "PeriodYear",    label: "Year"    },
  { value: "PeriodHalf",    label: "Half-Year" },
  { value: "PeriodQuarter", label: "Quarter" },
];
const DEPLOY_STEPS = ["Create Goal Shell", "Update Goal Details"];

const STATUS_COLORS: Record<string, string> = {
  OnTrack:  "bg-success/15 text-success",
  AtRisk:   "bg-warning/15 text-warning",
  OffTrack: "bg-destructive/15 text-destructive",
  OnHold:   "bg-muted text-muted-foreground",
  Complete: "bg-primary/15 text-primary",
};

// --- Shared style tokens ---
const inputCls = "w-full h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";
const selectCls = "w-full h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
const smallSelectCls = "flex-1 h-7 px-2 bg-surface-container border-none rounded text-[11px] text-foreground focus:outline-none";

function emptyForm(): GoalTemplateForm {
  return {
    title: "",
    description: "",
    status: "OnTrack",
    periodType: "PeriodQuarter",
    year: new Date().getFullYear(),
    half: 1,
    quarter: 1,
  };
}

// --- Main Component ---

export function GoalManagerWorkspace() {
  const { apiKey } = useAuth();

  // Data
  const [goals, setGoals]       = useState<Goal[]>([]);
  const [clients, setClients]   = useState<GoalClient[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("");

  // Library filters & pagination
  const [libSearch, setLibSearch]         = useState("");
  const [libStatus, setLibStatus]         = useState("All");
  const [libPeriodType, setLibPeriodType] = useState("All");
  const [libPage, setLibPage]             = useState(1);

  // Bulk delete
  const [checkedIds, setCheckedIds]           = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]               = useState(false);

  // Builder
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [form, setForm]                 = useState<GoalTemplateForm>(emptyForm());
  const [activeTab, setActiveTab]       = useState<"details" | "clients">("details");
  const [updating, setUpdating]         = useState(false);

  // Client selection & pagination
  const [clientSearch, setClientSearch]           = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [clientPage, setClientPage]               = useState(1);

  // Deployment
  const [deployState, setDeployState] = useState<{
    isOpen: boolean;
    progress: GoalClientDeployment[];
    overallStatus: "running" | "complete";
    succeeded: number;
    failed: number;
  } | null>(null);

  // --- Load data ---
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setLoadingText("Loading goals...");
    try {
      const [goalData, clientData] = await Promise.all([
        fetchAllGoals(apiKey).then((d) => { setLoadingText("Loading clients..."); return d; }),
        fetchAllGoalClients(apiKey),
      ]);
      setGoals(goalData);
      setClients(clientData);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- Filtered goals ---
  const filteredGoals = useMemo(() => goals.filter((g) => {
    if (libStatus !== "All" && g.status !== libStatus) return false;
    if (libPeriodType !== "All" && g.period?.type !== libPeriodType) return false;
    if (libSearch && !g.title.toLowerCase().includes(libSearch.toLowerCase())) return false;
    return true;
  }), [goals, libSearch, libStatus, libPeriodType]);

  useEffect(() => { setLibPage(1); }, [libSearch, libStatus, libPeriodType]);

  const libTotalPages = Math.max(1, Math.ceil(filteredGoals.length / PAGE_SIZE));
  const pagedGoals    = filteredGoals.slice((libPage - 1) * PAGE_SIZE, libPage * PAGE_SIZE);

  // --- Filtered clients ---
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
  }, [clients, clientSearch]);

  useEffect(() => { setClientPage(1); }, [clientSearch]);

  const clientTotalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const pagedClients     = filteredClients.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE);

  // --- Bulk delete ---
  const allPageChecked = pagedGoals.length > 0 && pagedGoals.every((g) => checkedIds.has(g.id));

  const togglePageAll = () => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allPageChecked) pagedGoals.forEach((g) => next.delete(g.id));
      else pagedGoals.forEach((g) => next.add(g.id));
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

  const selectedForDelete = goals.filter((g) => checkedIds.has(g.id));

  const handleBulkDelete = async () => {
    setDeleting(true);
    let deleted = 0;
    for (const goal of selectedForDelete) {
      try {
        await deleteGoal(apiKey, goal.id);
        deleted++;
      } catch (e) {
        toast({ title: `Failed to delete "${goal.title}"`, description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      }
    }
    if (deleted > 0) toast({ title: `${deleted} goal(s) deleted` });
    setCheckedIds(new Set());
    setShowDeleteModal(false);
    setDeleting(false);
    loadData();
  };

  // --- Load template ---
  const loadTemplate = (goal: Goal) => {
    setSelectedGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description || "",
      status: goal.status,
      periodType: goal.period ? periodTypeFromPeriod(goal.period) : "PeriodQuarter",
      year:    goal.period?.year || new Date().getFullYear(),
      half:    goal.period?.type === "PeriodHalf"    ? goal.period.half    : 1,
      quarter: goal.period?.type === "PeriodQuarter" ? goal.period.quarter : 1,
    });
    setSelectedClientIds([]);
    setActiveTab("details");
  };

  const clearForm = () => { setSelectedGoal(null); setForm(emptyForm()); setSelectedClientIds([]); };

  const updateForm = (patch: Partial<GoalTemplateForm>) => setForm((f) => ({ ...f, ...patch }));

  // --- Update existing goal inline ---
  const handleUpdateGoal = async () => {
    if (!selectedGoal) return;
    setUpdating(true);
    try {
      await updateGoal(apiKey, selectedGoal.id, form);
      toast({ title: "Goal updated successfully" });
      loadData();
    } catch (e) {
      toast({ title: "Failed to update goal", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const canDeploy = form.title.trim() !== "" && selectedClientIds.length > 0;

  // --- Deploy ---
  const handleDeploy = async () => {
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));
    const progress: GoalClientDeployment[] = selectedClientIds.map((cid) => ({
      clientId: cid,
      clientName: clientMap.get(cid) || cid,
      steps: DEPLOY_STEPS.map((name) => ({ name, status: "pending" as StepStatus })),
    }));
    setDeployState({ isOpen: true, progress, overallStatus: "running", succeeded: 0, failed: 0 });
    let succeeded = 0, failed = 0;
    for (let ci = 0; ci < selectedClientIds.length; ci++) {
      const clientId = selectedClientIds[ci];
      try {
        await deployGoalToClient(apiKey, clientId, form, (stepIdx, status, error) => {
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
  if (loading)   return <WorkspaceLoader message={loadingText} />;
  if (loadError) return <WorkspaceError message={loadError} onRetry={loadData} />;

  return (
    <>
      <div className="flex gap-4 h-full">

        {/* LEFT PANEL — Library */}
        <div className="w-[40%] flex flex-col bg-surface border border-border/15 rounded-xl overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Goal Library</p>
                <Badge className="bg-primary/15 text-primary">{goals.length}</Badge>
              </div>
              {checkedIds.size > 0 && (
                <button onClick={() => setShowDeleteModal(true)} className="text-xs bg-destructive/15 text-destructive hover:bg-destructive/25 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete ({checkedIds.size})
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search goals…"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-surface-container border-none rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <select value={libStatus} onChange={(e) => setLibStatus(e.target.value)} className={smallSelectCls}>
                <option value="All">All Status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={libPeriodType} onChange={(e) => setLibPeriodType(e.target.value)} className={smallSelectCls}>
                <option value="All">All Periods</option>
                <option value="PeriodYear">Year</option>
                <option value="PeriodHalf">Half</option>
                <option value="PeriodQuarter">Quarter</option>
              </select>
            </div>
          </div>

          {/* Select-all row */}
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border/15 bg-surface-container/50">
            <Checkbox checked={allPageChecked} onCheckedChange={togglePageAll} className="h-3.5 w-3.5" />
            <span className="text-[10px] text-muted-foreground">Select all on page</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {pagedGoals.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No goals found.</p>
            ) : (
              pagedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`group flex items-start gap-2 px-4 py-3 border-b border-border/10 hover:bg-surface-container transition-colors ${
                    selectedGoal?.id === goal.id ? "bg-primary/8 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={checkedIds.has(goal.id)} onCheckedChange={() => toggleCheck(goal.id)} className="h-3.5 w-3.5" />
                  </div>
                  <button onClick={() => loadTemplate(goal)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground truncate pr-2">{goal.title}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">{goal.client?.label || "—"}</span>
                      <Badge className={`rounded-full text-[10px] font-bold uppercase tracking-tight ${STATUS_COLORS[goal.status] || "bg-muted text-muted-foreground"}`}>
                        {goal.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{formatPeriodLabel(goal.period)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {goal.record_updated_at ? new Date(goal.record_updated_at).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>

          <Pagination page={libPage} totalPages={libTotalPages} onPageChange={setLibPage} />
        </div>

        {/* RIGHT PANEL — Builder */}
        <div className="w-[60%] flex flex-col bg-surface border border-border/15 rounded-xl overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border/15 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Goal Builder</p>
              <p className="text-xs text-foreground mt-0.5 font-medium truncate">
                {selectedGoal ? selectedGoal.title : "New Goal"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!form.title.trim() && (
                <span className="text-[10px] text-warning/80 bg-warning/10 px-2 py-0.5 rounded-full">Name required</span>
              )}
              {form.title.trim() && selectedClientIds.length === 0 && (
                <span className="text-[10px] text-muted-foreground bg-surface-container px-2 py-0.5 rounded-full">Select clients →</span>
              )}
              {canDeploy && (
                <span className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full">Ready to deploy</span>
              )}
              {selectedGoal && (
                <button
                  onClick={handleUpdateGoal}
                  disabled={updating || !form.title.trim()}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pencil className="w-3 h-3" />}
                  Update
                </button>
              )}
              <button onClick={clearForm} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/15">
            {(["details", "clients"] as const).map((key) => {
              const labels: Record<string, string> = { details: "Details", clients: `Clients (${selectedClientIds.length})` };
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
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Title *</label>
                  <input type="text" value={form.title} onChange={(e) => updateForm({ title: e.target.value })} placeholder="Enter goal title" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 flex justify-between">
                    <span>Description</span>
                    <span className="normal-case tracking-normal font-normal">{form.description.length}/500</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm({ description: e.target.value.slice(0, 500) })}
                    rows={4}
                    placeholder="Enter description"
                    className="w-full px-3 py-2 bg-surface-container border-none rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Status</label>
                  <select value={form.status} onChange={(e) => updateForm({ status: e.target.value })} className={selectCls}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Period Type</label>
                  <select value={form.periodType} onChange={(e) => updateForm({ periodType: e.target.value as PeriodType })} className={selectCls}>
                    {PERIOD_TYPES.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Year</label>
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) => { const year = parseInt(e.target.value); if (year >= 2020 && year <= 2040) updateForm({ year }); }}
                      min={2020} max={2040}
                      className="w-24 h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {form.periodType === "PeriodHalf" && (
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Half</label>
                      <select value={form.half} onChange={(e) => updateForm({ half: parseInt(e.target.value) as 1 | 2 })} className="w-20 h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value={1}>H1</option>
                        <option value={2}>H2</option>
                      </select>
                    </div>
                  )}
                  {form.periodType === "PeriodQuarter" && (
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Quarter</label>
                      <select value={form.quarter} onChange={(e) => updateForm({ quarter: parseInt(e.target.value) as 1 | 2 | 3 | 4 })} className="w-20 h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                        {[1,2,3,4].map((q) => <option key={q} value={q}>Q{q}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "clients" && (
              <>
                <p className="text-xs text-muted-foreground">Select which clients to create this goal for</p>
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
              onClick={handleDeploy}
              disabled={!canDeploy}
              className="w-full h-10 bg-gradient-to-br from-primary to-primary-dim disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            >
              <Play className="w-4 h-4" />
              Deploy Goal to {selectedClientIds.length} Client{selectedClientIds.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>

      {/* DEPLOYMENT MODAL */}
      {deployState?.isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-surface border border-border/20 rounded-xl shadow-2xl max-h-[85vh] flex flex-col animate-scale-in">
            <div className="p-5 border-b border-border/15">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {deployState.overallStatus === "running" ? "Deploying Goal…" : "Deployment Complete"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {deployState.overallStatus === "running"
                  ? `Creating goal for ${selectedClientIds.length} client(s) — do not close this window`
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
                Delete {selectedForDelete.length} Goal{selectedForDelete.length !== 1 ? "s" : ""}?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">This will permanently delete the following goals and cannot be undone:</p>
            </div>
            <div className="p-5 max-h-48 overflow-y-auto">
              <ul className="list-disc list-inside space-y-1">
                {selectedForDelete.map((goal) => <li key={goal.id} className="text-xs text-foreground">{goal.title}</li>)}
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
