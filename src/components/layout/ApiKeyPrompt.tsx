import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ScalePadLogo } from "@/components/ui/ScalePadLogo";

interface ApiKeyPromptProps {
  /** When provided, renders as a dismissible modal overlay. */
  onDismiss?: () => void;
}

/**
 * The single shared UI for entering a ScalePad API key.
 * Used by ApiKeyGate (full-page) and the Topbar modal trigger.
 */
export function ApiKeyPrompt({ onDismiss }: ApiKeyPromptProps) {
  const { setApiKey } = useAuth();
  const [key, setKey] = useState("");

  const handleConnect = () => {
    if (!key.trim()) return;
    try {
      setApiKey(key.trim());
      onDismiss?.();
    } catch {
      // sessionStorage may be unavailable (e.g. private browsing with storage blocked)
      // — silently continue; the key will still be held in React state for this session
    }
  };

  const card = (
    <div className="bg-surface rounded-xl border border-border/20 p-8 max-w-sm w-full text-center space-y-5 animate-scale-in">
      <ScalePadLogo className="h-8 w-auto text-foreground mx-auto" />
      <div>
        <h3 className="text-base font-semibold tracking-tight mb-1">Connect your ScalePad API key</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your key is stored in this browser session only and sent directly to the ScalePad API — never to any third party.
        </p>
      </div>
      <div className="space-y-2.5 text-left">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConnect();
            if (e.key === "Escape") onDismiss?.();
          }}
          placeholder="Enter API key…"
          autoFocus
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          className="w-full h-9 px-3 bg-surface-container border-none rounded-md text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleConnect}
          disabled={!key.trim()}
          className="w-full h-9 bg-gradient-to-br from-primary to-primary-dim text-primary-foreground text-sm font-semibold rounded-md disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
        >
          Connect &amp; Launch
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  if (onDismiss) {
    return (
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
      >
        {card}
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center animate-fade-in">
      {card}
    </div>
  );
}
