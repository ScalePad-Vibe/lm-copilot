import React, { createContext, useContext } from "react";
import { MarketplaceApp } from "@/lib/constants";
import { SEED_APPS } from "@/lib/mock-data";

interface AppStoreState {
  apps: MarketplaceApp[];
}

const AppStoreContext = createContext<AppStoreState | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreContext.Provider value={{ apps: SEED_APPS }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
