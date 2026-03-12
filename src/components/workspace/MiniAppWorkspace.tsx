import { useState } from "react";
import { callScalePadApi, type ApiResponse } from "@/lib/scalepad-api";
import { useAuth } from "@/context/AuthContext";
import { MarketplaceApp, ACTION_MODES } from "@/lib/constants";
import { ResultsPanel } from "./ResultsPanel";
import { Loader2, Play } from "lucide-react";

interface MiniAppWorkspaceProps {
  app: MarketplaceApp;
}

export function MiniAppWorkspace({ app }: MiniAppWorkspaceProps) {
  const { apiKey } = useAuth();
  const [actionMode, setActionMode] = useState("apply");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);

  const fields = (app.input_schema as { fields?: Array<{ name: string; label: string; type: string; placeholder?: string; options?: string[] }> })?.fields || [];

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    const res = await callScalePadApi(app.api_endpoint, apiKey, {
      action: actionMode,
      ...inputs,
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-heading font-bold text-sm text-foreground">Workspace</h3>

        {/* Action mode */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Action Mode</label>
          <select
            value={actionMode}
            onChange={(e) => setActionMode(e.target.value)}
            className="w-full h-9 px-3 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {ACTION_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Dynamic fields */}
        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
            {field.type === "select" && field.options ? (
              <select
                value={inputs[field.name] || ""}
                onChange={(e) => setInputs((p) => ({ ...p, [field.name]: e.target.value }))}
                className="w-full h-9 px-3 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select…</option>
                {field.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={inputs[field.name] || ""}
                onChange={(e) => setInputs((p) => ({ ...p, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            ) : (
              <input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                value={inputs[field.name] || ""}
                onChange={(e) => setInputs((p) => ({ ...p, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full h-9 px-3 bg-surface-raised border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </div>
        ))}

        <button
          onClick={handleRun}
          disabled={loading}
          className="w-full h-10 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-medium rounded-md flex items-center justify-center gap-2 transition-colors duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run App
            </>
          )}
        </button>
      </div>

      <ResultsPanel result={result} loading={loading} />
    </div>
  );
}
