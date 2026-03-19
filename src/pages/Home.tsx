import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, KeyRound } from "lucide-react";

const tools = [
  {
    path: "/initiatives",
    icon: "🚀",
    label: "Initiative Manager",
    category: "Planning",
    description:
      "View, configure, and deploy initiatives across multiple clients simultaneously with real-time progress tracking.",
  },
  {
    path: "/goals",
    icon: "🎯",
    label: "Goal Manager",
    category: "Planning",
    description:
      "Build goal templates and deploy them across your client base — status, period, and description in one step.",
  },
  {
    path: "/opportunities",
    icon: "💰",
    label: "List Opportunities",
    category: "Reporting",
    description:
      "Pull live sales opportunities from the ScalePad API and filter by client, stage, or opportunity name.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { hasApiKey } = useAuth();

  return (
    <Shell title="Tools">
      <div className="h-full overflow-y-auto px-8 py-8 space-y-8 animate-fade-up">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ScalePad Lifecycle Tools</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your API key and launch any tool to get started.
          </p>
        </div>

        {/* API key nudge */}
        {!hasApiKey && (
          <div
            onClick={() => navigate("/settings")}
            className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold tracking-tight">Connect your API key</p>
              <p className="text-xs text-muted-foreground">Go to Settings to add your ScalePad API key and unlock all tools.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        )}

        {/* Tool cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="bg-surface rounded-xl border border-border/20 p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/30 hover:bg-surface-container transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{tool.icon}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-surface-container px-2 py-0.5 rounded-full">
                  {tool.category}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold tracking-tight mb-1">{tool.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{tool.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Launch <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
