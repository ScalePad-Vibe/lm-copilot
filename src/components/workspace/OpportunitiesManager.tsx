import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { proxyCall } from "@/lib/api-client";
import { AlertTriangle, Filter } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { WorkspaceLoader, WorkspaceError, Panel, PanelHeader, PanelLabel, PanelSearch, PanelBody, Badge, smallSelectCls } from "@/components/workspace/Shared";

interface Opportunity {
  name: string;
  title: string;
  source_stage: string;
}

export function OpportunitiesManager() {
  const { apiKey } = useAuth();
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("__all__");
  const [filterStage, setFilterStage] = useState("__all__");
  const [filterName, setFilterName] = useState("");

  const uniqueClients = useMemo(
    () => [...new Set(opportunities.map((o) => o.name))].sort(),
    [opportunities]
  );
  const uniqueStages = useMemo(
    () => [...new Set(opportunities.map((o) => o.source_stage))].sort(),
    [opportunities]
  );

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (filterClient !== "__all__" && o.name !== filterClient) return false;
      if (filterStage !== "__all__" && o.source_stage !== filterStage) return false;
      if (filterName) {
        const q = filterName.toLowerCase();
        if (!o.title.toLowerCase().includes(q) && !o.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [opportunities, filterClient, filterStage, filterName]);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    setOpportunities([]);
    try {
      const { data: json, error: fnError } = await supabase.functions.invoke("scalepad-proxy", {
        body: { endpoint: "/core/v1/opportunities?page_size=200", method: "GET" },
        headers: { "x-scalepad-api-key": apiKey },
      });
      if (fnError) throw new Error(fnError.message || "Edge function error");
      if (json?.upstream_status && json.upstream_status !== 200) {
        throw new Error(json.errors?.[0]?.detail || json.error || `API returned ${json.upstream_status}`);
      }
      if (json?.error) throw new Error(json.error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: Opportunity[] = (json.data || json.items || json || []).map((item: any) => ({
        name: item.client?.name ?? item.name ?? "—",
        title: item.title ?? "—",
        source_stage: item.source_stage ?? "—",
      }));
      setOpportunities(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <WorkspaceLoader message="Fetching opportunities…" />;
  if (error) return <WorkspaceError message={error} onRetry={fetchOpportunities} />;

  return (
    <Panel className="h-full">
      <PanelHeader>
        <div className="flex items-center justify-between gap-3">
          <PanelLabel
            label="Opportunities"
            count={filtered.length !== opportunities.length ? filtered.length : opportunities.length}
          />
          {filtered.length !== opportunities.length && (
            <span className="text-[10px] text-muted-foreground">{opportunities.length} total</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className={smallSelectCls}>
            <option value="__all__">All Clients</option>
            {uniqueClients.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className={smallSelectCls}>
            <option value="__all__">All Stages</option>
            {uniqueStages.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex-1 min-w-[160px]">
            <PanelSearch value={filterName} onChange={setFilterName} placeholder="Search client or opportunity…" />
          </div>
        </div>
      </PanelHeader>

      <PanelBody>
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 opacity-30" />
            <p className="text-sm">No opportunities found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/15 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-9">Client</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-9">Opportunity</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold h-9">Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((opp, i) => (
                <TableRow key={i} className="border-border/10 hover:bg-surface-container transition-colors">
                  <TableCell className="text-xs font-medium text-foreground py-2.5">{opp.name}</TableCell>
                  <TableCell className="text-xs text-foreground py-2.5">{opp.title}</TableCell>
                  <TableCell className="py-2.5">
                    <Badge className="bg-primary/10 text-primary">{opp.source_stage}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-8">
                    No opportunities match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </PanelBody>
    </Panel>
  );
}
