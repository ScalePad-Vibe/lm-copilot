import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { maskApiKey } from "@/lib/scalepad-api";

interface TopbarProps {
  title: string;
  appCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Topbar({ title, appCount, searchQuery, onSearchChange }: TopbarProps) {
  const { apiKey, hasApiKey } = useAuth();

  return (
    <header className="h-16 border-b border-border/15 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {appCount !== undefined && (
          <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full text-muted-foreground font-mono">
            {appCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search apps…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 h-8 pl-9 pr-3 bg-surface border-none rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-150"
          />
        </div>

        {hasApiKey ? (
          <div className="flex items-center gap-1.5 h-8 px-3 bg-surface rounded-md border border-border/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <code className="text-xs text-muted-foreground font-mono">{maskApiKey(apiKey)}</code>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 h-8 px-3 bg-surface rounded-md border border-border/20">
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">Not connected</span>
          </div>
        )}
      </div>
    </header>
  );
}
