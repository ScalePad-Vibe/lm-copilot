import { useState, useEffect } from "react";
import { MarketplaceApp, AppCategory, AppStatus, CATEGORIES } from "@/lib/constants";
import { X } from "lucide-react";

interface AppFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (app: Omit<MarketplaceApp, "id" | "created_at">) => void;
  initial?: MarketplaceApp | null;
}

const categoryOptions = CATEGORIES.filter((c) => c !== "All") as AppCategory[];
const statusOptions: AppStatus[] = ["active", "beta", "inactive"];

export function AppFormModal({ open, onClose, onSave, initial }: AppFormModalProps) {
  const [form, setForm] = useState({
    name: "",
    icon: "🔧",
    category: "Devices" as AppCategory,
    status: "active" as AppStatus,
    version: "1.0.0",
    author: "",
    description: "",
    how_it_works: "",
    api_endpoint: "/api/v1/",
    input_schema: {} as Record<string, unknown>,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        icon: initial.icon,
        category: initial.category,
        status: initial.status,
        version: initial.version,
        author: initial.author,
        description: initial.description,
        how_it_works: initial.how_it_works,
        api_endpoint: initial.api_endpoint,
        input_schema: initial.input_schema,
      });
    } else {
      setForm({
        name: "", icon: "🔧", category: "Devices", status: "active",
        version: "1.0.0", author: "", description: "", how_it_works: "",
        api_endpoint: "/api/v1/", input_schema: {},
      });
    }
  }, [initial, open]);

  if (!open) return null;

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-heading font-bold">{initial ? "Edit App" : "Add New App"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-[60px_1fr] gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
              <input value={form.icon} onChange={(e) => set("icon", e.target.value)}
                className="w-full h-9 px-2 text-center text-xl bg-surface-raised border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">App Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full h-9 px-3 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full h-9 px-2 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full h-9 px-2 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Version</label>
              <input value={form.version} onChange={(e) => set("version", e.target.value)}
                className="w-full h-9 px-3 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Author</label>
            <input value={form.author} onChange={(e) => set("author", e.target.value)}
              className="w-full h-9 px-3 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 flex justify-between">
              <span>Description</span>
              <span className={form.description.length > 160 ? "text-destructive" : ""}>{form.description.length}/160</span>
            </label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} maxLength={160}
              className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">How It Works</label>
            <textarea value={form.how_it_works} onChange={(e) => set("how_it_works", e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-surface-raised border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">API Endpoint</label>
            <input value={form.api_endpoint} onChange={(e) => set("api_endpoint", e.target.value)}
              className="w-full h-9 px-3 bg-surface-raised border border-border rounded-md text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 h-10 bg-surface-raised border border-border rounded-md text-sm text-foreground hover:bg-muted/50 transition-colors duration-150">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!form.name.trim()) return;
              onSave(form);
              onClose();
            }}
            className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md text-sm transition-colors duration-150">
            {initial ? "Save Changes" : "Create App"}
          </button>
        </div>
      </div>
    </div>
  );
}
