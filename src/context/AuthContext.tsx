/**
 * AuthContext — API key session management
 *
 * Stores the user's ScalePad API key in sessionStorage so it persists across
 * page navigations within a single tab but is cleared when the tab closes.
 *
 * The key is never sent to any Lovable/Supabase storage — it only lives in the
 * browser session and is forwarded to the ScalePad API via the proxy edge function.
 *
 * A SHA-256 hash of the key is derived and used as an anonymous `user_hash` for
 * any Supabase operations (e.g. ratings, comments) that need a stable user identity
 * without requiring a real auth account.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

// ─── SHA-256 hash helper ──────────────────────────────────────────────────────

/** Derive a hex SHA-256 hash of a string using the Web Crypto API. */
async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthState {
  /** The raw API key, or empty string if not yet set. */
  apiKey: string;
  /** True when a non-empty API key is present in the session. */
  hasApiKey: boolean;
  /**
   * SHA-256 hash of the API key — used as an anonymous, stable user identity
   * for Supabase operations without requiring account creation.
   */
  userHash: string;
  /** Persist a new API key to the session and derive its hash. */
  setApiKey: (key: string) => Promise<void>;
  /** Remove the API key and hash from the session. */
  clearApiKey: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>(
    () => sessionStorage.getItem("sp_api_key") ?? ""
  );
  const [userHash, setUserHash] = useState<string>(
    () => sessionStorage.getItem("sp_user_hash") ?? ""
  );

  const setApiKey = useCallback(async (key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    sessionStorage.setItem("sp_api_key", trimmed);

    if (trimmed) {
      const hash = await sha256(trimmed);
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

  return (
    <AuthContext.Provider
      value={{
        apiKey,
        hasApiKey: apiKey.trim().length > 0,
        userHash,
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
