import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ApiKeyPrompt } from "./ApiKeyPrompt";
import { NAV_TOOLS } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Topbar() {
  const { hasApiKey, clearApiKey } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const location = useLocation();

  const currentTool = NAV_TOOLS.find((t) => t.path === location.pathname);
  const title = currentTool?.label ?? "Tools";

  return (
    <>
      <header className="h-16 border-b border-border/15 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>

        {hasApiKey ? (
          <button
            onClick={() => setShowDisconnect(true)}
            className="group flex items-center gap-1.5 h-7 px-3 bg-surface rounded-lg border border-border/20 hover:border-destructive/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success group-hover:bg-destructive transition-colors" />
            <span className="text-xs text-muted-foreground group-hover:text-destructive transition-colors">
              <span className="group-hover:hidden">Connected</span>
              <span className="hidden group-hover:inline">Disconnect</span>
            </span>
          </button>
        ) : (
          <button
            onClick={() => setShowPrompt(true)}
            className="flex items-center gap-1.5 h-7 px-3 bg-surface rounded-lg border border-border/20 hover:border-primary/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span className="text-xs text-muted-foreground">Not Connected</span>
          </button>
        )}
      </header>

      {showPrompt && <ApiKeyPrompt onDismiss={() => setShowPrompt(false)} />}

      <AlertDialog open={showDisconnect} onOpenChange={setShowDisconnect}>
        <AlertDialogContent className="bg-surface border-border/20 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold tracking-tight">Disconnect API key?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Your ScalePad API key will be removed from this session. You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-8 text-xs bg-surface-container border-border/20 hover:bg-surface-container-high">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={clearApiKey}
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
