import { useState } from "react";
import { ClipboardDocumentIcon, CheckIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const SETUP_PROMPT =
  `Enable Lovable Cloud on this project. Then deploy the API proxy edge function ` +
  `by copying backup/scalepad-proxy/index.ts to supabase/functions/scalepad-proxy/index.ts ` +
  `and deploying it. Finally, delete src/components/layout/SetupOverlay.tsx and remove its ` +
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
      <div className="w-full max-w-lg mx-6 rounded-2xl border border-border/30 bg-surface shadow-2xl p-7 flex flex-col gap-5">

        {/* Icon + heading */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
            <WrenchScrewdriverIcon className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">One-time setup required</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              The ScalePad API doesn't allow direct browser requests (CORS), so this app routes calls through a server-side proxy. Paste the prompt below into Lovable to deploy it.
            </p>
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
