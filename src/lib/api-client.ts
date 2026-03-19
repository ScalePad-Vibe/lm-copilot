/**
 * ScalePad API Client
 *
 * All ScalePad API calls are routed through the `scalepad-proxy` edge function.
 * This keeps the API key server-side and avoids CORS issues with the ScalePad API.
 *
 * Flow:
 *   UI component → proxyCall() → supabase edge fn (scalepad-proxy) → api.scalepad.com
 *
 * The proxy always returns HTTP 200. Upstream errors are surfaced in the response
 * body via `upstream_status` so callers can handle them explicitly.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Core proxy call ──────────────────────────────────────────────────────────

/**
 * Send an authenticated request to the ScalePad API via the proxy edge function.
 *
 * @param apiKey   - The user's ScalePad API key (forwarded in x-scalepad-api-key header).
 * @param endpoint - Path relative to api.scalepad.com, e.g. "/lifecycle-manager/v1/initiatives".
 * @param method   - HTTP method (default: "GET").
 * @param body     - Optional JSON request body.
 * @returns Parsed JSON response from the ScalePad API.
 * @throws Error with a human-readable message on API or network failure.
 */
export async function proxyCall(
  apiKey: string,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data: json, error: fnError } = await supabase.functions.invoke(
    "scalepad-proxy",
    {
      body: { endpoint, method, body },
      headers: { "x-scalepad-api-key": apiKey },
    }
  );

  if (fnError) {
    throw new Error(fnError.message || "Edge function invocation failed");
  }

  if (json?.upstream_status && json.upstream_status >= 400) {
    if (json.upstream_status === 403) {
      throw new Error(
        "Your API key does not have permission for Lifecycle Manager. " +
        "Check your ScalePad account permissions."
      );
    }
    const detail =
      json.errors?.[0]?.detail ||
      json.error ||
      `ScalePad API returned ${json.upstream_status}`;
    throw new Error(detail);
  }

  if (json?.error) {
    throw new Error(json.error);
  }

  return json;
}

// ─── Cursor-based pagination helper ──────────────────────────────────────────

/**
 * Fetch all pages of a paginated ScalePad endpoint.
 * Keeps fetching until `next_cursor` is absent or null.
 *
 * @param apiKey   - The user's ScalePad API key.
 * @param endpoint - Base path, e.g. "/lifecycle-manager/v1/initiatives".
 * @param params   - Query params merged on every page request (page_size, sort, etc.).
 * @returns Flat array of all items across all pages.
 */
export async function fetchAllPages<T>(
  apiKey: string,
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | null = null;

  do {
    const qs = new URLSearchParams({ ...params });
    if (cursor) qs.set("cursor", cursor);

    const json = await proxyCall(apiKey, `${endpoint}?${qs.toString()}`);

    const items = (json.data as T[]) || [];
    all.push(...items);
    cursor = (json.next_cursor as string) || null;
  } while (cursor);

  return all;
}
