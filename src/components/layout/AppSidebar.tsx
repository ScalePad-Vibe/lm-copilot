import { useAuth } from "@/context/AuthContext";
import { maskApiKey } from "@/lib/scalepad-api";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings, LogOut, KeyRound } from "lucide-react";
import scalePadLogo from "@/assets/scalepad-logo.svg";

const tools = [
  { path: "/initiatives", icon: "🚀", label: "Initiative Manager" },
  { path: "/goals",       icon: "🎯", label: "Goal Manager"       },
  { path: "/opportunities", icon: "💰", label: "Opportunities"    },
];

export function AppSidebar() {
  const { apiKey, hasApiKey, clearApiKey } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border/15 flex flex-col z-30">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border/15 shrink-0">
        <img src={scalePadLogo} alt="ScalePad" className="h-[26px] w-auto object-contain shrink-0" />
        <div className="w-px h-4 bg-border/40 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">LMX Copilot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tools</p>
        {tools.map((tool) => (
          <button
            key={tool.path}
            onClick={() => navigate(tool.path)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm tracking-tight transition-colors duration-150 group ${
              isActive(tool.path)
                ? "bg-surface-container-highest text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
            }`}
          >
            <span className="text-base leading-none">{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}

        <div className="pt-4">
          <button
            onClick={() => navigate("/settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm tracking-tight transition-colors duration-150 ${
              isActive("/settings")
                ? "bg-surface-container-highest text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
            }`}
          >
            <Settings className="w-[18px] h-[18px]" />
            Settings
          </button>
        </div>
      </nav>

      {/* API key footer */}
      <div className="px-3 py-3 border-t border-border/15 shrink-0">
        {hasApiKey ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <code className="text-xs text-muted-foreground font-mono truncate">{maskApiKey(apiKey)}</code>
            </div>
            <button
              onClick={clearApiKey}
              title="Disconnect"
              className="text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-container transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Connect API key</span>
          </div>
        )}
      </div>
    </aside>
  );
}
