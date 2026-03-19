import React from "react";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { StepStatus } from "@/lib/initiative-api";

// ─── Shared style token strings ──────────────────────────────────────────────
export const smallSelectCls =
  "flex-1 h-7 px-2 bg-surface-container border-none rounded text-[11px] text-foreground focus:outline-none";
export const inputCls =
  "w-full h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";
export const selectCls =
  "w-full h-9 px-3 bg-surface-container border-none rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

// ─── Panel shell ─────────────────────────────────────────────────────────────
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col bg-surface border border-border/15 rounded-xl overflow-hidden ${className ?? ""}`}>
      {children}
    </div>
  );
}

// ─── Panel header wrapper ─────────────────────────────────────────────────────
export function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-3 border-b border-border/15 space-y-3">
      {children}
    </div>
  );
}

// ─── Label row with optional count badge + right-side action ─────────────────
export function PanelLabel({
  label,
  count,
  action,
}: {
  label: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{label}</p>
        {count !== undefined && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/15 text-primary">
            {count}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Search input with magnifier icon ────────────────────────────────────────
export function PanelSearch({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 pl-8 pr-3 bg-surface-container border-none rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

// ─── Scrollable list body ─────────────────────────────────────────────────────
export function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto">{children}</div>;
}

// ─── Empty placeholder ────────────────────────────────────────────────────────
export function PanelEmpty({ message }: { message: string }) {
  return <p className="text-xs text-muted-foreground text-center py-8">{message}</p>;
}

// ─── Pill badge ───────────────────────────────────────────────────────────────
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className ?? ""}`}>
      {children}
    </span>
  );
}

// ─── Deployment step status icon ─────────────────────────────────────────────
export function StepIcon({ status }: { status: StepStatus }) {
  if (status === "success") return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (status === "error")   return <XCircle      className="w-4 h-4 text-destructive" />;
  if (status === "running") return <Loader2      className="w-4 h-4 text-primary animate-spin" />;
  return <Clock className="w-4 h-4 text-muted-foreground" />;
}

// ─── Pagination footer ────────────────────────────────────────────────────────
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
    <div className="flex items-center justify-between px-3 py-2 border-t border-border/15">
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

// ─── Full-panel loading spinner ───────────────────────────────────────────────
export function WorkspaceLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

// ─── Full-panel error state ───────────────────────────────────────────────────
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
