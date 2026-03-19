import { useAuth } from "@/context/AuthContext";
import { maskApiKey } from "@/lib/scalepad-api";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { apiKey, hasApiKey } = useAuth();

  return (
    <header className="h-16 border-b border-border/15 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>

      {hasApiKey ? (
        <div className="flex items-center gap-1.5 h-7 px-3 bg-surface rounded-lg border border-border/20">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <code className="text-xs text-muted-foreground font-mono">{maskApiKey(apiKey)}</code>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 h-7 px-3 bg-surface rounded-lg border border-border/20">
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="text-xs text-muted-foreground">No key connected</span>
        </div>
      )}
    </header>
  );
}
