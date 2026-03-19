import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { maskApiKey } from "@/lib/scalepad-api";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, KeyRound, Check } from "lucide-react";
import scalePadLogo from "@/assets/scalepad-logo.svg";

const tools = [
  { path: "/initiatives", icon: "🚀", label: "Initiative Manager" },
  { path: "/goals",       icon: "🎯", label: "Goal Manager"       },
  { path: "/opportunities", icon: "💰", label: "Opportunities"    },
];

export function AppSidebar() {
  const { apiKey, hasApiKey, setApiKey, clearApiKey } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleToggle = () => {
    if (hasApiKey) {
      clearApiKey();
    } else {
      setExpanded((v) => !v);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSubmit = async () => {
    if (!inputVal.trim()) return;
    await setApiKey(inputVal.trim());
    setInputVal("");
    setExpanded(false);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border/15 flex flex-col z-30">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border/15 shrink-0">
        <img src={scalePadLogo} alt="ScalePad" className="h-[26px] w-auto object-contain shrink-0" />
        <div className="w-px h-4 bg-border/40 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">LM Copilot</span>
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
      </nav>

      {/* API key footer */}
      <div className="px-3 py-3 border-t border-border/15 shrink-0 space-y-2">
        {hasApiKey ? (
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <code className="text-xs text-muted-foreground font-mono truncate">{maskApiKey(apiKey)}</code>
            </div>
            <button
              onClick={handleToggle}
              title="Disconnect API key"
              className="text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleToggle}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>Connect API key</span>
            </button>

            {expanded && (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <input
                  ref={inputRef}
                  type="password"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Paste key…"
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  data-form-type="other"
                  className="flex-1 h-8 px-2.5 bg-surface-raised border border-border/30 rounded-md text-xs text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!inputVal.trim()}
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground transition-colors shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
