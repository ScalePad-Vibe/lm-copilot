import { Search, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
  title: string;
  appCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddApp?: () => void;
}

export function Topbar({ title, appCount, searchQuery, onSearchChange, onAddApp }: TopbarProps) {
  const { role } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-heading font-bold">{title}</h2>
        {appCount !== undefined && (
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {appCount} apps
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
            className="w-64 h-9 pl-9 pr-3 bg-surface-raised border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-150"
          />
        </div>
        {role === "admin" && onAddApp && (
          <button
            onClick={onAddApp}
            className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            Add App
          </button>
        )}
      </div>
    </header>
  );
}
