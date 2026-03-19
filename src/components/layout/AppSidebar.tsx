import { useNavigate, useLocation } from "react-router-dom";
import scalePadLogo from "@/assets/scalepad-logo.svg";

const tools = [
  { path: "/initiatives", icon: "🚀", label: "Initiative Manager" },
  { path: "/goals",       icon: "🎯", label: "Goal Manager"       },
  { path: "/opportunities", icon: "💰", label: "Opportunities"    },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm tracking-tight transition-colors duration-150 ${
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
    </aside>
  );
}
