import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "Content-Type": "application/json" },
});
const uuid = (v: unknown) => typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const clean = (v: unknown, n: number) => typeof v === "string" ? v.trim().slice(0, n) : "";

function outputText(response: any): string {
  if (typeof response?.output_text === "string") return response.output_text;
  for (const item of response?.output ?? [])
    for (const part of item?.content ?? [])
      if (part?.type === "output_text" && typeof part.text === "string") return part.text;
  throw new Error("Missing structured output");
}

function prompt(order: any): string {
  return `Create a coordinated DreamTaily story package in Italian.

INPUT
Name: ${order.name}
Description: ${order.description || "(not provided)"}
Style ID: ${order.style}
Companion ID: ${order.companion}
Ordered choices: ${JSON.stringify(order.choices)}

RULES
- Produce story_bible, story_outline and visual_bible that agree exactly.
- Choices are causal narrative constraints, never paragraphs to paste.
- Plan the whole story before prose; use 5–7 causally connected chapters.
- Do not invent missing physical traits. Keep them null and list them in unknown_fields.
- You may invent safe personality, world and emotional details.
- Keep the selected protagonist and companion central.
- Every illustration_scene is one precise drawable instant.
- No horror, humiliation, abandonment, graphic danger or preachy moralizing.
- All natural-language values are Italian; fixed IDs remain unchanged.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => null);
    if (!uuid(body?.order_id)) return json({ error: "Valid order_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select("id,name,description,style,companion,choices")
      .eq("id", body.order_id)
      .single();

    if (error || !order) return json({ error: "Order not found" }, 404);

    const { data: cached } = await supabase
      .from("story_packages")
      .select("*")
      .eq("order_id", order.id)
      .eq("status", "ready")
      .maybeSingle();

    if (cached) return json({ cached: true, package: cached });

    const safeOrder = {
      id: order.id,
      name: clean(order.name, 80),
      description: clean(order.description, 1000),
      style: order.style,
      companion: order.companion,
      choices: order.choices ?? {},
    };

    const schema = await fetch(new URL("./story-package.schema.json", import.meta.url))
      .then((r) => r.json());

    const model = Deno.env.get("OPENAI_STORY_MODEL") || "gpt-5-mini";
    const openai = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          { role: "system", content: [{ type: "input_text", text:
            "Return only strict structured output. Preserve uncertainty rather than inventing physical traits." }] },
          { role: "user", content: [{ type: "input_text", text: prompt(safeOrder) }] },
        ],
        text: { format: {
          type: "json_schema",
          name: "dreamtaily_story_package",
          strict: true,
          schema,
        }},
      }),
    });

    const raw = await openai.json();
    if (!openai.ok) {
      console.error(raw);
      return json({ error: "Generation failed" }, 502);
    }

    const generated = JSON.parse(outputText(raw));
    const { data: saved, error: saveError } = await supabase
      .from("story_packages")
      .insert({
        order_id: order.id,
        input_snapshot: safeOrder,
        story_bible: generated.story_bible,
        story_outline: generated.story_outline,
        visual_bible: generated.visual_bible,
        model,
        prompt_version: "story-package-v1",
        generation_metadata: { openai_response_id: raw.id ?? null },
      })
      .select("*")
      .single();

    if (saveError) {
      console.error(saveError);
      return json({ error: "Save failed" }, 500);
    }
    return json({ cached: false, package: saved }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: "Internal server error" }, 500);
  }
});
