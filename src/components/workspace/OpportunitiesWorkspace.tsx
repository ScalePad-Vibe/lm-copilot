import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { MarketplaceApp } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Play, AlertTriangle, Filter } from "lucide-react";
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

interface OpportunitiesWorkspaceProps {
  app: MarketplaceApp;
}

export function OpportunitiesWorkspace({ app }: OpportunitiesWorkspaceProps) {
  const { apiKey } = useAuth();
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setOpportunities([]);
    setHasRun(true);

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

      if (fnError) {
        throw new Error(fnError.message || "Edge function error");
      }

      if (json?.upstream_status && json.upstream_status !== 200) {
        const detail = json.errors?.[0]?.detail || json.error || `API returned ${json.upstream_status}`;
        throw new Error(detail);
      }

      if (json?.error) {
        throw new Error(json.error);
      }

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

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-heading font-bold text-sm text-foreground">Workspace</h3>
        <p className="text-xs text-muted-foreground">
          This app calls the live ScalePad API using your API key. Click Run to fetch opportunities.
        </p>

        <button
          onClick={handleRun}
          disabled={loading}
          className="w-full h-10 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-medium rounded-md flex items-center justify-center gap-2 transition-colors duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching Opportunities…
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run App
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 animate-fade-in">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Calling ScalePad API…</p>
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

      {!loading && !error && hasRun && opportunities.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-5 text-center animate-fade-in">
          <p className="text-sm text-muted-foreground">No opportunities found.</p>
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border">
            <h4 className="font-heading font-bold text-sm text-foreground">
              {opportunities.length} Opportunities
            </h4>
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
              {opportunities.map((opp, i) => (
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
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
