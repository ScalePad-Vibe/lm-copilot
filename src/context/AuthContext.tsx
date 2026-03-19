import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface AuthState {
  apiKey: string;
  hasApiKey: boolean;
  userHash: string;
  recentApps: string[];
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => void;
  addRecentApp: (id: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>(
    () => sessionStorage.getItem("sp_api_key") || ""
  );
  const [userHash, setUserHash] = useState<string>(
    () => sessionStorage.getItem("sp_user_hash") || ""
  );
  const [recentApps, setRecentApps] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("sp_recent") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem("sp_recent", JSON.stringify(recentApps));
  }, [recentApps]);

  const setApiKey = useCallback(async (key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    sessionStorage.setItem("sp_api_key", trimmed);
    if (trimmed) {
      const hash = await hashApiKey(trimmed);
      setUserHash(hash);
      sessionStorage.setItem("sp_user_hash", hash);
    } else {
      setUserHash("");
      sessionStorage.removeItem("sp_user_hash");
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    setUserHash("");
    sessionStorage.removeItem("sp_api_key");
    sessionStorage.removeItem("sp_user_hash");
  }, []);

  const addRecentApp = useCallback((id: string) => {
    setRecentApps((prev) => [id, ...prev.filter((i) => i !== id)].slice(0, 3));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        apiKey,
        hasApiKey: apiKey.trim().length > 0,
        userHash,
        recentApps,
        setApiKey,
        clearApiKey,
        addRecentApp,
      }}
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
