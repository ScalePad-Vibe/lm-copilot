import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, Filter } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
      if (filterName && !o.title.toLowerCase().includes(filterName.toLowerCase())) return false;
      return true;
    });
  }, [opportunities, filterClient, filterStage, filterName]);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    setOpportunities([]);

    try {
      const { data: json, error: fnError } = await supabase.functions.invoke("scalepad-proxy", {
        body: {
          endpoint: "/core/v1/opportunities?page_size=200",
          method: "GET",
        },
        headers: {
          "x-scalepad-api-key": apiKey,
        },
      });

      if (fnError) throw new Error(fnError.message || "Edge function error");

      if (json?.upstream_status && json.upstream_status !== 200) {
        const detail = json.errors?.[0]?.detail || json.error || `API returned ${json.upstream_status}`;
        throw new Error(detail);
      }

      if (json?.error) throw new Error(json.error);

      const items: Opportunity[] = (json.data || json.items || json || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => ({
          name: item.client?.name ?? item.name ?? "—",
          title: item.title ?? "—",
          source_stage: item.source_stage ?? "—",
        })
      );

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

  return (
    <div className="space-y-5">
      {loading && (
        <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 animate-fade-in">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Fetching opportunities…</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h4 className="font-heading font-bold text-destructive">Error</h4>
          </div>
          <p className="text-sm text-foreground">{error}</p>
        </div>
      )}

      {!loading && !error && opportunities.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-5 text-center animate-fade-in">
          <p className="text-sm text-muted-foreground">No opportunities found.</p>
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border space-y-3">
            <h4 className="font-heading font-bold text-sm text-foreground">
              {filtered.length} of {opportunities.length} Opportunities
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Clients</SelectItem>
                  {uniqueClients.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Stages</SelectItem>
                  {uniqueStages.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Search by name…"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-[200px] h-8 text-xs"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Opportunity Name</TableHead>
                <TableHead>Sale Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((opp, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{opp.name}</TableCell>
                  <TableCell>{opp.title}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {opp.source_stage}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No opportunities match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
