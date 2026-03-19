import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiKeyPrompt } from "./ApiKeyPrompt";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { hasApiKey, clearApiKey } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-border/15 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>

        {hasApiKey ? (
          <button
            onClick={clearApiKey}
            className="group flex items-center gap-1.5 h-7 px-3 bg-surface rounded-lg border border-border/20 hover:border-destructive/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground group-hover:text-destructive transition-colors">Connected</span>
          </button>
        ) : (
          <button
            onClick={() => setShowPrompt(true)}
            className="flex items-center gap-1.5 h-7 px-3 bg-surface rounded-lg border border-border/20 hover:border-primary/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span className="text-xs text-muted-foreground">Not Connected</span>
          </button>
        )}
      </header>

      {showPrompt && <ApiKeyPrompt onDismiss={() => setShowPrompt(false)} />}
    </>
  );
}
