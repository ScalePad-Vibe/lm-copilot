import { useAuth } from "@/context/AuthContext";
import { maskApiKey } from "@/lib/scalepad-api";
import { CATEGORIES } from "@/lib/constants";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutGrid, Clock, Settings, KeyRound } from "lucide-react";

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  apps: { id: string; name: string; icon: string }[];
}

export function Sidebar({ selectedCategory, onCategoryChange, apps }: SidebarProps) {
  const { apiKey, hasApiKey, clearApiKey, recentApps } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const recentAppData = recentApps
    .map((id) => apps.find((a) => a.id === id))
    .filter(Boolean) as { id: string; name: string; icon: string }[];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-surface border-r border-border/20 flex flex-col z-30">
      {/* Logo */}
      <div className="p-5 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shrink-0">
            <span className="text-white text-base leading-none">⚡</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none">ScalePad</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">App Marketplace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <button
          onClick={() => navigate("/marketplace")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm tracking-tight transition-colors duration-150 ${
            location.pathname === "/marketplace"
              ? "bg-surface-container-highest text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
          }`}
        >
          <LayoutGrid className="w-[18px] h-[18px]" />
          Marketplace
        </button>

        {/* Recent Apps */}
        {recentAppData.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Recent
            </p>
            {recentAppData.map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(`/marketplace/${app.id}`)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm tracking-tight text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors duration-150"
              >
                <span>{app.icon}</span>
                <span className="truncate">{app.name}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/settings")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm tracking-tight transition-colors duration-150 ${
            location.pathname === "/settings"
              ? "bg-surface-container-highest text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
          }`}
        >
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </button>

        {/* Categories */}
        <div className="pt-4">
          <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Categories
          </p>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onCategoryChange(cat);
                if (location.pathname !== "/marketplace") navigate("/marketplace");
              }}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm tracking-tight transition-colors duration-150 ${
                selectedCategory === cat
                  ? "bg-surface-container-highest text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/20 space-y-1">
        {hasApiKey ? (
          <div className="px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <code className="text-xs text-muted-foreground font-mono truncate">{maskApiKey(apiKey)}</code>
            </div>
            <button
              onClick={clearApiKey}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0"
              title="Disconnect API key"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="px-2 py-1.5 flex items-center gap-2 text-muted-foreground">
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs">No API key connected</span>
          </div>
        )}
      </div>
    </aside>
  );
}
