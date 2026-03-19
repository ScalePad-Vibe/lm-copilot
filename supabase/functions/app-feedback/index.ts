/**
 * app-feedback — App ratings and comments
 *
 * Provides a single endpoint for all user-generated feedback on apps.
 * Uses the service role key to bypass RLS, enabling anonymous writes
 * identified only by a `user_hash` (SHA-256 of the user's API key).
 *
 * Supported actions (passed in the JSON body):
 *
 *   "rate"           — Upsert a 1-5 star rating for an app.
 *   "comment"        — Append a new comment to an app.
 *   "delete_comment" — Hard-delete a comment by ID (admin use).
 *
 * Request body:
 *   {
 *     action:      "rate" | "comment" | "delete_comment";
 *     app_id:      string;   // required for all actions
 *     user_hash:   string;   // required for rate + comment
 *     rating:      number;   // required for "rate" (1–5)
 *     content:     string;   // required for "comment"
 *     comment_id:  string;   // required for "delete_comment"
 *   }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-user-hash",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, app_id, user_hash, rating, content, comment_id } = await req.json();

    if (!app_id) return json({ error: "app_id is required" }, 400);

    // ── Rate an app ───────────────────────────────────────────────────────────
    if (action === "rate") {
      if (!user_hash || !rating || rating < 1 || rating > 5) {
        return json({ error: "user_hash and rating (1–5) are required" }, 400);
      }
      const { error } = await supabase
        .from("app_ratings")
        .upsert(
          { app_id, user_hash, rating, updated_at: new Date().toISOString() },
          { onConflict: "app_id,user_hash" }
        );
      if (error) throw error;
      return json({ success: true });
    }

    // ── Add a comment ─────────────────────────────────────────────────────────
    if (action === "comment") {
      if (!user_hash || !content?.trim()) {
        return json({ error: "user_hash and content are required" }, 400);
      }
      const { error } = await supabase
        .from("app_comments")
        .insert({ app_id, user_hash, content: content.trim() });
      if (error) throw error;
      return json({ success: true });
    }

    // ── Delete a comment ──────────────────────────────────────────────────────
    if (action === "delete_comment") {
      if (!comment_id) return json({ error: "comment_id is required" }, 400);
      const { error } = await supabase
        .from("app_comments")
        .delete()
        .eq("id", comment_id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: `Unknown action "${action}". Valid: rate, comment, delete_comment` }, 400);

  } catch (err) {
    console.error("[app-feedback] Unhandled error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
