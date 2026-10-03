// supabase/functions/pollinations-image/index.ts
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, imageUrl, model = "flux", width = 768, height = 768 } = await req.json();

    if (!prompt) {
      return json({ error: "prompt is required" }, 400);
    }

    const apiKey = Deno.env.get("POLLINATIONS_API_KEY");
    if (!apiKey) {
      return json({ error: "POLLINATIONS_API_KEY not set on server" }, 500);
    }

    const params = new URLSearchParams({
      model,
      width: String(width),
      height: String(height),
      key: apiKey,
    });

    if (imageUrl) params.set("image", imageUrl);

    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;

    return json({ url: pollinationsUrl });
  } catch (err) {
    console.error("Pollinations function error:", err);
    return json({ error: String(err) }, 500);
  }
});

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}