import { Loader2, AlertTriangle, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { StepStatus } from "@/lib/initiative-api";

/** Pill badge used in workspace tables and lists. */
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`}>
      {children}
    </span>
  );
}

/** Deployment step status icon. */
export function StepIcon({ status }: { status: StepStatus }) {
  if (status === "success") return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (status === "error")   return <XCircle      className="w-4 h-4 text-destructive" />;
  if (status === "running") return <Loader2      className="w-4 h-4 text-primary animate-spin" />;
  return <Clock className="w-4 h-4 text-muted-foreground" />;
}

/** Prev / Next pagination footer. Renders nothing when totalPages ≤ 1. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
      >
        <ChevronLeft className="w-3 h-3" /> Prev
      </button>
      <span className="text-[10px] text-muted-foreground">Page {page} of {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
      >
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

/** Full-panel loading spinner with optional message. */
export function WorkspaceLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

/** Full-panel error state with retry button. */
export function WorkspaceError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertTriangle className="w-10 h-10 text-destructive" />
      <p className="text-sm text-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
      >
        Retry
      </button>
    </div>
  );
}
