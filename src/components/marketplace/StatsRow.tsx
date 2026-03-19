import { MarketplaceApp } from "@/lib/constants";

interface StatsRowProps {
  apps: MarketplaceApp[];
}

export function StatsRow({ apps }: StatsRowProps) {
  const active = apps.filter((a) => a.status === "active").length;
  const categories = new Set(apps.map((a) => a.category)).size;

  const stats = [
    { label: "Total Apps", value: apps.length, color: "text-primary" },
    { label: "Active", value: active, color: "text-success" },
    { label: "Categories", value: categories, color: "text-foreground" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface rounded-xl border border-border/20 p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
          <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
