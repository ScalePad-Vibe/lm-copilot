import { MarketplaceApp } from "@/lib/constants";
import { useNavigate } from "react-router-dom";

interface AppCardProps {
  app: MarketplaceApp;
}

const statusColors: Record<string, string> = {
  active: "bg-success/15 text-success",
  beta: "bg-warning/15 text-warning",
  inactive: "bg-muted text-muted-foreground",
};

export function AppCard({ app }: AppCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/marketplace/${app.id}`)}
      className="group text-left w-full bg-card border border-border rounded-lg p-5 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{app.icon}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${statusColors[app.status]}`}>
          {app.status}
        </span>
      </div>
      <h3 className="font-heading font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-150">
        {app.name}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{app.description}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{app.category}</span>
        <span>v{app.version}</span>
      </div>
    </button>
  );
}
