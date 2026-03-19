/**
 * AuthContext — API key session management
 *
 * Stores the user's ScalePad API key in sessionStorage so it persists across
 * page navigations within a single tab but is cleared when the tab closes.
 *
 * The key is never sent to any external storage — it only lives in the
 * browser session and is forwarded to the ScalePad API via the proxy edge function.
 */

import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthState {
  /** The raw API key, or empty string if not yet set. */
  apiKey: string;
  /** True when a non-empty API key is present in the session. */
  hasApiKey: boolean;
  /** Persist a new API key to the session. */
  setApiKey: (key: string) => void;
  /** Remove the API key from the session. */
  clearApiKey: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>(
    () => sessionStorage.getItem("sp_api_key") ?? ""
  );

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    sessionStorage.setItem("sp_api_key", trimmed);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    sessionStorage.removeItem("sp_api_key");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        apiKey,
        hasApiKey: apiKey.trim().length > 0,
        setApiKey,
        clearApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Access the auth context. Must be used inside <AuthProvider>. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
