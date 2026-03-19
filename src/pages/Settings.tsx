import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/context/AppStoreContext";
import { maskApiKey } from "@/lib/scalepad-api";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { apiKey, hasApiKey, setApiKey, clearApiKey } = useAuth();
  const { apps } = useAppStore();
  const [category, setCategory] = useState("All");
  const [newKey, setNewKey] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveKey = async () => {
    if (!newKey.trim()) return;
    setSaving(true);
    await setApiKey(newKey.trim());
    setNewKey("");
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar selectedCategory={category} onCategoryChange={setCategory} apps={apps} />

      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border/15 bg-background/80 backdrop-blur-xl flex items-center px-6 shrink-0 sticky top-0 z-20">
          <h2 className="text-sm font-semibold tracking-tight">Settings</h2>
        </header>

        <main className="flex-1 p-6 overflow-y-auto max-w-xl">
          <div className="bg-surface rounded-xl border border-border/20 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold tracking-tight">ScalePad API Key</h3>
            </div>

            {hasApiKey ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 p-3 bg-surface-container rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                  <code className="text-sm text-foreground font-mono flex-1">{maskApiKey(apiKey)}</code>
                  <span className="text-[10px] uppercase tracking-widest text-success font-bold">Connected</span>
                </div>
                <button
                  onClick={clearApiKey}
                  className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Disconnect key
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Enter your ScalePad API key to enable app workspaces. Your key is stored in session storage only and never sent to any server other than the ScalePad API.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                    placeholder="sk-…"
                    className="flex-1 h-9 px-3 bg-surface-container border-none rounded-md text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleSaveKey}
                    disabled={!newKey.trim() || saving}
                    className="h-9 px-4 bg-gradient-to-br from-primary to-primary-dim text-primary-foreground text-sm font-semibold rounded-md disabled:opacity-40 transition-opacity"
                  >
                    {saving ? "Saving…" : "Connect"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
