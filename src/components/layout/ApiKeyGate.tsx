import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import scalePadLogo from "@/assets/scalepad-logo.svg";

interface ApiKeyGateProps {
  children: React.ReactNode;
}

export function ApiKeyGate({ children }: ApiKeyGateProps) {
  const { hasApiKey, setApiKey } = useAuth();
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);

  if (hasApiKey) return <>{children}</>;

  const handleConnect = async () => {
    if (!key.trim()) return;
    setSaving(true);
    await setApiKey(key.trim());
    setSaving(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 h-full">
      <div className="bg-surface rounded-xl border border-border/20 p-8 max-w-sm w-full text-center space-y-5 animate-scale-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
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
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="Enter API key…"
            autoFocus
            className="w-full h-9 px-3 bg-surface-container border-none rounded-md text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleConnect}
            disabled={!key.trim() || saving}
            className="w-full h-9 bg-gradient-to-br from-primary to-primary-dim text-primary-foreground text-sm font-semibold rounded-md disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect & Launch"}
          </button>
        </div>
      </div>
    </div>
  );
}
