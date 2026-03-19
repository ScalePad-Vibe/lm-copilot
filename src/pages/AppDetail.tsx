import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/context/AppStoreContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { MiniAppWorkspace } from "@/components/workspace/MiniAppWorkspace";
import { OpportunitiesWorkspace } from "@/components/workspace/OpportunitiesWorkspace";
import { InitiativeManagerWorkspace } from "@/components/workspace/InitiativeManagerWorkspace";
import { GoalManagerWorkspace } from "@/components/workspace/GoalManagerWorkspace";
import { AppRatingsComments } from "@/components/marketplace/AppRatingsComments";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-success/15 text-success",
  beta: "bg-warning/15 text-warning",
  inactive: "bg-muted text-muted-foreground",
};

function ApiKeyGate({ onConnect }: { onConnect: (key: string) => Promise<void> }) {
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConnect = async () => {
    if (!key.trim()) return;
    setSaving(true);
    await onConnect(key.trim());
    setSaving(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="bg-surface rounded-xl border border-border/20 p-8 max-w-sm w-full text-center space-y-5 animate-scale-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight mb-1">Connect your API key</h3>
          <p className="text-xs text-muted-foreground">Enter your ScalePad API key to launch this app. Stored in session only.</p>
        </div>
        <div className="space-y-2.5 text-left">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="sk-…"
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

export default function AppDetail() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { apps } = useAppStore();
  const { hasApiKey, setApiKey, addRecentApp } = useAuth();

  const app = apps.find((a) => a.id === appId);

  useEffect(() => {
    if (app) addRecentApp(app.id);
  }, [app?.id]);

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">App not found</p>
          <button onClick={() => navigate("/marketplace")} className="mt-3 text-primary text-sm hover:underline">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const appType = (app.input_schema as any)?.appType;
  const isRealApi = (app.input_schema as any)?.realApi;

  const WorkspaceComponent = () => {
    if (!hasApiKey) return <ApiKeyGate onConnect={setApiKey} />;
    if (appType === "initiative-manager") return <InitiativeManagerWorkspace />;
    if (appType === "goal-manager") return <GoalManagerWorkspace />;
    if (isRealApi) return <OpportunitiesWorkspace app={app} />;
    return <MiniAppWorkspace app={app} />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back + header */}
      <div className="border-b border-border/15 px-6 py-4 flex items-center gap-4 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <button
          onClick={() => navigate("/marketplace")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Marketplace
        </button>
        <span className="text-border/40">/</span>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{app.icon}</span>
          <span className="text-sm font-semibold tracking-tight">{app.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${statusColors[app.status]}`}>
            {app.status}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">v{app.version}</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — meta + ratings (30%) */}
        <aside className="w-80 shrink-0 border-r border-border/15 overflow-y-auto p-5 space-y-5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{app.description}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">How it works</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{app.how_it_works}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Endpoint</p>
            <code className="text-xs text-muted-foreground font-mono break-all">{app.api_endpoint}</code>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Author</p>
            <p className="text-sm text-muted-foreground">{app.author} · {app.category}</p>
          </div>

          <div className="border-t border-border/15 pt-5">
            <AppRatingsComments appId={app.id} />
          </div>
        </aside>

        {/* Right — workspace (70%) */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <WorkspaceComponent />
        </main>
      </div>
    </div>
  );
}
