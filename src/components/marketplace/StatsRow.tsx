import { useAuth } from "@/context/AuthContext";
import { MarketplaceApp } from "@/lib/constants";

interface StatsRowProps {
  apps: MarketplaceApp[];
}

export function StatsRow({ apps }: StatsRowProps) {
  const { role } = useAuth();
  if (role !== "admin") return null;

  const active = apps.filter((a) => a.status === "active").length;
  const beta = apps.filter((a) => a.status === "beta").length;
  const categories = new Set(apps.map((a) => a.category)).size;

  const stats = [
    { label: "Total Apps", value: apps.length, color: "text-primary" },
    { label: "Active", value: active, color: "text-success" },
    { label: "Beta", value: beta, color: "text-warning" },
    { label: "Categories", value: categories, color: "text-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
          <p className={`text-2xl font-heading font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
