import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { ArrowRightIcon, ClipboardDocumentIcon, CheckIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { ScalePadLogo } from "@/components/ui/ScalePadLogo";
import { NAV_TOOLS } from "@/lib/constants";
import { isBackendConfigured, isProxyDeployed } from "@/lib/api-client";

// ─── Exact prompt remixers paste into Lovable ────────────────────────────────
const SETUP_PROMPT =
  `Enable Lovable Cloud on this project. Then deploy the API proxy edge function ` +
  `by copying backup/scalepad-proxy/index.ts to supabase/functions/scalepad-proxy/index.ts ` +
  `and deploying it. Finally, delete the SetupOverlay component and its usage from ` +
  `src/pages/Home.tsx so this setup screen no longer appears.`;

// ─── Setup overlay ────────────────────────────────────────────────────────────
function SetupOverlay() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SETUP_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-6 rounded-2xl border border-border/30 bg-surface shadow-2xl p-7 flex flex-col gap-5">

        {/* Icon + heading */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
            <WrenchScrewdriverIcon className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">One-time setup required</p>
            <p className="text-xs text-muted-foreground mt-0.5">Paste the prompt below into Lovable to enable the API proxy.</p>
          </div>
        </div>

        {/* Prompt box */}
        <div className="rounded-xl bg-surface-container border border-border/20 p-4 flex gap-3 items-start">
          <p className="flex-1 text-xs text-muted-foreground leading-relaxed font-mono select-all break-words">
            {SETUP_PROMPT}
          </p>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-colors
              text-muted-foreground hover:text-foreground hover:bg-surface-raised"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-success" />
                <span className="text-success">Copied</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          This screen will disappear automatically once setup is complete.
        </p>
      </div>
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  // null = still checking, true = ready, false = needs setup
  const [setupNeeded, setSetupNeeded] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isBackendConfigured()) {
      setSetupNeeded(true);
      return;
    }
    isProxyDeployed().then((deployed) => setSetupNeeded(!deployed));
  }, []);

  const showOverlay = setupNeeded === true;

  return (
    <Shell>
      <div className="relative h-full">

        {/* Setup overlay — hidden once Lovable Cloud is connected */}
        {!backendReady && <SetupOverlay />}

        <div className={`h-full overflow-y-auto px-8 pt-6 pb-10 space-y-8 animate-fade-up ${!backendReady ? "pointer-events-none select-none" : ""}`}>

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
      </div>
    </Shell>
  );
}
