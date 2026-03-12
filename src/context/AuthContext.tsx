import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { POC_ADMIN_PASSWORD } from "@/lib/constants";

type Role = "user" | "admin";

interface AuthState {
  apiKey: string;
  role: Role;
  isAuthenticated: boolean;
  loginAsUser: (apiKey: string) => boolean;
  loginAsAdmin: (password: string) => boolean;
  logout: () => void;
  /** Track recently launched app IDs (max 3) */
  recentApps: string[];
  addRecentApp: (id: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("sp_api_key") || "");
  const [role, setRole] = useState<Role>(() => (sessionStorage.getItem("sp_role") as Role) || "user");
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("sp_auth") === "1");
  const [recentApps, setRecentApps] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("sp_recent") || "[]");
    } catch {
      return [];
    }
  });

  // Persist recent apps
  useEffect(() => {
    sessionStorage.setItem("sp_recent", JSON.stringify(recentApps));
  }, [recentApps]);

  const loginAsUser = useCallback((key: string) => {
    if (!key.trim()) return false;
    setApiKey(key);
    setRole("user");
    setIsAuthenticated(true);
    sessionStorage.setItem("sp_api_key", key);
    sessionStorage.setItem("sp_role", "user");
    sessionStorage.setItem("sp_auth", "1");
    return true;
  }, []);

  const loginAsAdmin = useCallback((password: string) => {
    // POC: hardcoded password — replace with Supabase Auth
    if (password !== POC_ADMIN_PASSWORD) return false;
    setApiKey("admin-key-poc");
    setRole("admin");
    setIsAuthenticated(true);
    sessionStorage.setItem("sp_api_key", "admin-key-poc");
    sessionStorage.setItem("sp_role", "admin");
    sessionStorage.setItem("sp_auth", "1");
    return true;
  }, []);

  const logout = useCallback(() => {
    setApiKey("");
    setRole("user");
    setIsAuthenticated(false);
    sessionStorage.removeItem("sp_api_key");
    sessionStorage.removeItem("sp_role");
    sessionStorage.removeItem("sp_auth");
  }, []);

  const addRecentApp = useCallback((id: string) => {
    setRecentApps((prev) => {
      const next = [id, ...prev.filter((i) => i !== id)].slice(0, 3);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ apiKey, role, isAuthenticated, loginAsUser, loginAsAdmin, logout, recentApps, addRecentApp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
