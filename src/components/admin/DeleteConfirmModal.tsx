import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  appName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ open, appName, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-sm p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-heading font-bold">Delete App</h2>
            <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          </div>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-foreground mb-5">
          Are you sure you want to delete <span className="font-bold">{appName}</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-9 bg-surface-raised border border-border rounded-md text-sm hover:bg-muted/50 transition-colors duration-150">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-9 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-md text-sm transition-colors duration-150">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
