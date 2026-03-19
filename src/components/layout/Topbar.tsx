import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Check, X } from "lucide-react";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { hasApiKey, setApiKey, clearApiKey } = useAuth();
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setInputVal("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = async () => {
    if (!inputVal.trim()) return;
    await setApiKey(inputVal.trim());
    setInputVal("");
    setOpen(false);
  };

  return (
    <header className="h-16 border-b border-border/15 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>

      <div ref={wrapperRef} className="flex items-center gap-2">
        {/* Status chip */}
        {hasApiKey ? (
          <button
            onClick={clearApiKey}
            className="group flex items-center gap-1.5 h-7 px-3 bg-surface rounded-lg border border-border/20 hover:border-destructive/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground group-hover:text-destructive transition-colors">Connected</span>
          </button>
        ) : (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 h-7 px-3 bg-surface rounded-lg border border-border/20 hover:border-primary/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span className="text-xs text-muted-foreground">Not Connected</span>
          </button>
        )}

        {/* Inline key input */}
        {open && !hasApiKey && (
          <div className="flex items-center gap-1.5 animate-fade-in">
            <input
              ref={inputRef}
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") { setOpen(false); setInputVal(""); }
              }}
              placeholder="Paste API key…"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
              className="h-7 w-56 px-2.5 bg-surface border border-border/30 rounded-lg text-xs text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSubmit}
              disabled={!inputVal.trim()}
              className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setOpen(false); setInputVal(""); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg bg-surface border border-border/20 hover:bg-surface-container text-muted-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
