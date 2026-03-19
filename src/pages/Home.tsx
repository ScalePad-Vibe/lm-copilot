import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/context/AuthContext";
import { ArrowRightIcon, KeyIcon, RocketLaunchIcon, FlagIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { ScalePadLogo } from "@/components/ui/ScalePadLogo";

const tools = [
  {
    path: "/initiatives",
    icon: RocketLaunchIcon,
    label: "Initiative Manager",
    category: "Planning",
    accent: "from-indigo-500/20 to-violet-500/10",
    iconColor: "text-indigo-400",
    description:
      "View, configure, and deploy initiatives across multiple clients simultaneously with real-time progress tracking.",
  },
  {
    path: "/goals",
    icon: FlagIcon,
    label: "Goal Manager",
    category: "Planning",
    accent: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
    description:
      "Build goal templates and deploy them across your client base — status, period, and description in one step.",
  },
  {
    path: "/opportunities",
    icon: CurrencyDollarIcon,
    label: "List Opportunities",
    category: "Reporting",
    accent: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    description:
      "Pull live sales opportunities from the ScalePad API and filter by client, stage, or opportunity name.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { hasApiKey } = useAuth();

  return (
    <Shell title="Tools">
      <div className="h-full overflow-y-auto px-8 py-10 space-y-10 animate-fade-up">

        {/* Header */}
        <div className="flex items-center gap-4">
          <ScalePadLogo className="h-9 w-auto text-foreground shrink-0" />
          <div className="w-px h-8 bg-border/40 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LM Copilot</span>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5 leading-snug">
              Connect to ScalePad to automate customer success.
            </p>
          </div>
        </div>

        {/* API key nudge */}
        {!hasApiKey && (
          <div className="flex items-center gap-4 p-5 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shrink-0">
              <KeyIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold tracking-tight">Connect your API key</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use the "Not Connected" button in the top right to add your ScalePad API key.</p>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        )}

        {/* Tool cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tools.map(({ path, icon: Icon, label, category, accent, iconColor, description }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              className="relative bg-surface rounded-2xl border border-border/20 p-6 flex flex-col gap-5 cursor-pointer hover:border-primary/30 hover:bg-surface-container transition-all duration-200 group overflow-hidden"
            >
              {/* Subtle gradient glow top-left */}
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none`} />

              <div className="relative flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className={`w-7 h-7 ${iconColor}`} />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-surface-container px-2.5 py-1 rounded-full">
                  {category}
                </span>
              </div>

              <div className="relative flex-1 space-y-1.5">
                <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>

              <div className="relative flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all duration-150">
                Launch <ArrowRightIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
