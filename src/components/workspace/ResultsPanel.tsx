import { ApiResponse } from "@/lib/scalepad-api";
import { CheckCircle, XCircle, RefreshCw, Download, Loader2 } from "lucide-react";

interface ResultsPanelProps {
  result: ApiResponse | null;
  loading: boolean;
}

export function ResultsPanel({ result, loading }: ResultsPanelProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Calling ScalePad API…</p>
      </div>
    );
  }

  if (!result) return null;

  if (result.success) {
    return (
      <div className="bg-success/5 border border-success/20 rounded-lg p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <h4 className="font-heading font-bold text-success">Success</h4>
        </div>
        <p className="text-sm text-foreground mb-1">
          <span className="font-bold text-success">{result.affected}</span> records affected
        </p>
        <p className="text-xs text-muted-foreground mb-3">Completed at {new Date(result.timestamp).toLocaleString()}</p>
        <button className="h-8 px-3 bg-surface-raised border border-border rounded-md text-xs text-foreground hover:bg-muted/50 flex items-center gap-1.5 transition-colors duration-150">
          <Download className="w-3.5 h-3.5" />
          Export as CSV
        </button>
      </div>
    );
  }

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <XCircle className="w-5 h-5 text-destructive" />
        <h4 className="font-heading font-bold text-destructive">Error</h4>
      </div>
      <p className="text-sm text-foreground mb-3">{result.error}</p>
      <button className="h-8 px-3 bg-surface-raised border border-border rounded-md text-xs text-foreground hover:bg-muted/50 flex items-center gap-1.5 transition-colors duration-150">
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </button>
    </div>
  );
}
