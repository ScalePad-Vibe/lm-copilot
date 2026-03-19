import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ScalePadLogo } from "@/components/ui/ScalePadLogo";
import { NAV_TOOLS } from "@/lib/constants";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Shell>
      <div className="h-full flex flex-col justify-center px-8 py-10 space-y-10 animate-fade-up">

        {/* Header */}
        <div className="flex items-center gap-4">
          <ScalePadLogo className="h-9 w-auto text-foreground shrink-0" />
          <div className="w-px h-8 bg-border/40 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">LM Copilot</span>
        </div>

        {/* Tool cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {NAV_TOOLS.map(({ path, icon: Icon, label, category, description }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              className="bg-surface rounded-2xl border border-border/20 p-6 flex flex-col gap-5 cursor-pointer hover:border-border/40 hover:bg-surface-raised transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-muted-foreground" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-surface-container px-2.5 py-1 rounded-full">
                  {category}
                </span>
              </div>

              <div className="flex-1 space-y-1.5">
                <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground group-hover:gap-2.5 transition-all duration-150">
                Launch <ArrowRightIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
