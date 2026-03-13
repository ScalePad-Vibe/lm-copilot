const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-scalepad-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method, body } = await req.json();

    const scalepadApiKey = req.headers.get("x-scalepad-api-key");
    if (!scalepadApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing x-scalepad-api-key header" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!endpoint || !endpoint.startsWith("/") || endpoint.includes("..")) {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint path" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(`https://api.scalepad.com${endpoint}`, {
      method: method || "GET",
      headers: {
        Authorization: `Bearer ${scalepadApiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    // Always return 200 to avoid supabase.functions.invoke treating non-2xx as errors
    // Include upstream status so the frontend can handle errors from the body
    return new Response(JSON.stringify({ upstream_status: response.status, ...data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
