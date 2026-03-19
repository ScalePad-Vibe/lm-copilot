/**
 * scalepad-proxy — ScalePad API reverse proxy
 *
 * Routes authenticated requests from the browser to api.scalepad.com.
 * This edge function exists for two reasons:
 *
 *   1. Security  — The user's ScalePad API key is forwarded server-side,
 *                  avoiding exposure in browser network logs beyond this hop.
 *   2. CORS      — api.scalepad.com does not allow direct browser requests;
 *                  this function adds the required CORS headers.
 *
 * Request format (JSON body):
 *   {
 *     endpoint: string;  // Path relative to api.scalepad.com, e.g. "/lifecycle-manager/v1/initiatives"
 *     method:   string;  // HTTP method — must be one of ALLOWED_METHODS
 *     body?:    object;  // Optional JSON body for POST/PUT
 *   }
 *
 * Required header:
 *   x-scalepad-api-key: <user's ScalePad API key>
 *
 * Response format (always HTTP 200):
 *   { upstream_status: number, ...upstreamResponseBody }
 *
 * The response always returns HTTP 200 so that the functions client
 * treats every call as successful and lets callers inspect `upstream_status`
 * to handle 4xx/5xx errors themselves.
 */

const SCALEPAD_API_BASE = "https://api.scalepad.com";

// ── Security constraints ───────────────────────────────────────────────────────
const ALLOWED_METHODS  = ["GET", "POST", "PUT", "DELETE"] as const;
const MAX_ENDPOINT_LEN = 512;

type AllowedMethod = typeof ALLOWED_METHODS[number];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-scalepad-api-key",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { endpoint, method = "GET", body } = await req.json();

    // ── Validate API key ──────────────────────────────────────────────────────
    const apiKey = (req.headers.get("x-scalepad-api-key") ?? "").trim();
    if (!apiKey) {
      return json({ error: "Missing x-scalepad-api-key header" });
    }

    // ── Validate method (explicit allowlist) ──────────────────────────────────
    if (!ALLOWED_METHODS.includes(method as AllowedMethod)) {
      return json({
        error: `Method "${method}" not allowed. Valid: ${ALLOWED_METHODS.join(", ")}`,
      });
    }

    // ── Validate endpoint path ────────────────────────────────────────────────
    if (
      !endpoint ||
      typeof endpoint !== "string" ||
      !endpoint.startsWith("/") ||
      endpoint.includes("..") ||
      endpoint.length > MAX_ENDPOINT_LEN
    ) {
      return json({ error: "Invalid endpoint path" });
    }

    // ── Forward to ScalePad API ───────────────────────────────────────────────
    const upstream = await fetch(`${SCALEPAD_API_BASE}${endpoint}`, {
      method: method as AllowedMethod,
      headers: {
        "x-api-key": apiKey,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // ── Parse response ────────────────────────────────────────────────────────
    // 204 No Content is normal for DELETE and some PUT calls — treat as success.
    let data: Record<string, unknown> = {};
    const contentType = upstream.headers.get("content-type") ?? "";
    if (upstream.status !== 204 && contentType.includes("application/json")) {
      try { data = await upstream.json(); } catch { /* empty body is fine */ }
    }

    // Always return HTTP 200; callers inspect `upstream_status` for errors.
    return json({ upstream_status: upstream.status, ...data });

  } catch (err) {
    console.error("[scalepad-proxy] Unhandled error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected proxy error" });
  }
});
