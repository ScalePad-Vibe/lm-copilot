import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { ArrowRightIcon, ClipboardDocumentIcon, CheckIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { ScalePadLogo } from "@/components/ui/ScalePadLogo";
import { NAV_TOOLS } from "@/lib/constants";
import { isBackendConfigured } from "@/lib/api-client";

const SETUP_PROMPT =
  `Deploy the scalepad-proxy edge function for this project. ` +
  `The source code is already saved at backup/scalepad-proxy/index.ts — ` +
  `copy it to supabase/functions/scalepad-proxy/index.ts and deploy it via Lovable Cloud.`;

function SetupBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SETUP_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <WrenchScrewdriverIcon className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Setup required</p>
          <p className="text-xs text-muted-foreground">The API proxy isn't deployed yet. Paste this prompt into Lovable to enable it.</p>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container border border-border/20 p-3.5 flex items-start gap-3">
        <p className="flex-1 text-xs text-muted-foreground leading-relaxed font-mono select-all">
          {SETUP_PROMPT}
        </p>
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-surface-raised"
        >
          {copied
            ? <><CheckIcon className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied</span></>
            : <><ClipboardDocumentIcon className="w-3.5 h-3.5" />Copy</>
          }
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const backendReady = isBackendConfigured();

  return (
    <Shell>
      <div className="h-full overflow-y-auto px-8 pt-6 pb-10 space-y-8 animate-fade-up">

        {/* Header */}
        <div className="flex items-center gap-4">
          <ScalePadLogo className="h-9 w-auto text-foreground shrink-0" />
          <div className="w-px h-8 bg-border/40 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">LM Copilot</span>
        </div>

        {/* Setup banner — only shown when Cloud is not connected */}
        {!backendReady && <SetupBanner />}

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
