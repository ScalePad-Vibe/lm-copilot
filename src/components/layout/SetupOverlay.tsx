import { useState } from "react";
import { ClipboardDocumentIcon, CheckIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { ScalePadLogo } from "@/components/ui/ScalePadLogo";

const SETUP_PROMPT =
  `Enable Lovable Cloud on this project. Then deploy the edge function ` +
  `supabase/functions/scalepad-proxy/index.ts using the Supabase deploy tool. ` +
  `Once deployed, delete src/components/layout/SetupOverlay.tsx and remove its ` +
  `import and usage from src/pages/Home.tsx so this setup screen no longer appears.`;

export function SetupOverlay() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SETUP_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-6 rounded-2xl border border-border/30 bg-surface shadow-2xl p-7 flex flex-col gap-6">

        {/* Header — mirrors the home page header */}
        <div className="flex items-center gap-4">
          <ScalePadLogo className="h-8 w-auto text-foreground shrink-0" />
          <div className="w-px h-7 bg-border/40 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">LM Copilot</span>
        </div>

        {/* App description */}
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">One-time setup required</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A copilot for ScalePad Lifecycle Manager — bulk-deploy initiatives and goals across your entire client base in seconds. Requires a server-side proxy to reach the ScalePad API.
          </p>
        </div>

        {/* Setup action */}
        <div className="rounded-xl bg-surface-container border border-border/20 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-warning shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-warning">Setup prompt</span>
          </div>

          {/* Truncated prompt — copy reveals full text */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-mono">
            {SETUP_PROMPT}
          </p>

          <button
            onClick={handleCopy}
            className="self-start flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors
              bg-surface-raised border border-border/20 text-muted-foreground hover:text-foreground hover:border-border/40"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-success" />
                <span className="text-success">Copied to clipboard</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                Copy prompt
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/50 leading-relaxed -mt-2">
          Paste into Lovable chat. This screen disappears automatically once setup is complete.
        </p>
      </div>
    </div>
  );
}
