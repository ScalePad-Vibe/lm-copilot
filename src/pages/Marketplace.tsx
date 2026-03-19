import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AppCard } from "@/components/marketplace/AppCard";
import { CategoryChips } from "@/components/marketplace/CategoryChips";
import { StatsRow } from "@/components/marketplace/StatsRow";
import { useAppStore } from "@/context/AppStoreContext";

export default function Marketplace() {
  const { apps } = useAppStore();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (category !== "All" && a.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [apps, category, search]);

  return (
    <div className="min-h-screen flex">
      <Sidebar selectedCategory={category} onCategoryChange={setCategory} apps={apps} />

      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <Topbar
          title="Marketplace"
          appCount={filtered.length}
          searchQuery={search}
          onSearchChange={setSearch}
        />

        <main className="flex-1 p-6 space-y-5 overflow-y-auto">
          <StatsRow apps={apps} />
          <CategoryChips selected={category} onChange={setCategory} />

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No apps found</p>
              <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
