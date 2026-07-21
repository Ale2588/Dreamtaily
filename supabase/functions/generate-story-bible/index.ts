import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import schema from "./story-package.schema.json" with { type: "json" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const uuid = (value: unknown) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const clean = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

function outputText(response: any): string {
  if (typeof response?.output_text === "string") return response.output_text;

  for (const item of response?.output ?? []) {
    for (const part of item?.content ?? []) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        return part.text;
      }
    }
  }

  throw new Error("Missing structured output");
}

function fallbackProtagonist(order: any) {
  return {
    type: "real_person",
    display_name: clean(order.name, 80),
    age: null,
    narrative_age_group: "3-5",
    pronouns: null,
    short_description: clean(order.description, 500),
    personality: [],
    interests: [],
    appearance: {
      species: null,
      hair_color: null,
      hair_style: null,
      eye_color: null,
      skin_tone: null,
      body_color: null,
      body_shape: null,
      default_outfit: {
        top: null,
        bottom: null,
        shoes: null,
        accessory: null,
      },
      distinctive_features: [],
    },
  };
}

function normalizeProtagonist(order: any) {
  const source =
    order?.protagonist &&
    typeof order.protagonist === "object" &&
    !Array.isArray(order.protagonist)
      ? order.protagonist
      : fallbackProtagonist(order);

  const type =
    source.type === "fictional_character"
      ? "fictional_character"
      : "real_person";

  return {
    type,
    display_name: clean(source.display_name || order.name, 80),
    age: Number.isInteger(source.age) ? source.age : null,
    narrative_age_group: clean(source.narrative_age_group, 20) || "3-5",
    pronouns: clean(source.pronouns, 40) || null,
    short_description: clean(
      source.short_description || order.description,
      500,
    ),
    personality: Array.isArray(source.personality)
      ? source.personality.map((item: unknown) => clean(item, 80)).filter(Boolean).slice(0, 5)
      : [],
    interests: Array.isArray(source.interests)
      ? source.interests.map((item: unknown) => clean(item, 100)).filter(Boolean).slice(0, 8)
      : [],
    appearance: {
      species: clean(source.appearance?.species, 100) || null,
      hair_color: clean(source.appearance?.hair_color, 80) || null,
      hair_style: clean(source.appearance?.hair_style, 100) || null,
      eye_color: clean(source.appearance?.eye_color, 80) || null,
      skin_tone: clean(source.appearance?.skin_tone, 80) || null,
      body_color: clean(source.appearance?.body_color, 80) || null,
      body_shape: clean(source.appearance?.body_shape, 120) || null,
      default_outfit: {
        top: clean(source.appearance?.default_outfit?.top, 160) || null,
        bottom: clean(source.appearance?.default_outfit?.bottom, 120) || null,
        shoes: clean(source.appearance?.default_outfit?.shoes, 120) || null,
        accessory: clean(source.appearance?.default_outfit?.accessory, 120) || null,
      },
      distinctive_features: Array.isArray(source.appearance?.distinctive_features)
        ? source.appearance.distinctive_features
            .map((item: unknown) => clean(item, 120))
            .filter(Boolean)
            .slice(0, 10)
        : [],
    },
  };
}

function prompt(order: any): string {
  return `Create a coordinated DreamTaily story package in Italian.

INPUT
Structured protagonist:
${JSON.stringify(order.protagonist, null, 2)}

Legacy name: ${order.name}
Legacy description: ${order.description || "(not provided)"}
Style ID: ${order.style}
Companion ID: ${order.companion}
Ordered choices: ${JSON.stringify(order.choices)}

RULES
- First produce character_bible from the structured protagonist.
- Then produce story_bible, story_outline and visual_bible that agree exactly with character_bible.
- Preserve every supplied identity and physical trait.
- Never transform a real_person into a fictional species.
- A fictional_character may be human, animal, robot, object or fantasy creature according to appearance.species.
- Do not invent missing physical traits. Keep them null and list them in forbidden_inventions or unknown_fields where supported.
- You may infer safe narrative strengths and growth opportunities, but never overwrite supplied personality.
- Choices are causal narrative constraints, never paragraphs to paste.
- Plan the whole story before prose; use 5–7 causally connected chapters.
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
    if (!uuid(body?.order_id)) {
      return json({ error: "Valid order_id required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select("id,name,description,protagonist,style,companion,choices")
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
      protagonist: normalizeProtagonist(order),
      style: clean(order.style, 40),
      companion: clean(order.companion, 40),
      choices: order.choices ?? {},
    };

    const model = Deno.env.get("OPENAI_STORY_MODEL") || "gpt-5-mini";
    const openai = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [{
              type: "input_text",
              text:
                "Return only strict structured output. Preserve supplied protagonist identity and uncertainty.",
            }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: prompt(safeOrder) }],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "dreamtaily_story_package",
            strict: true,
            schema,
          },
        },
      }),
    });

    const raw = await openai.json();

    if (!openai.ok) {
      console.error(raw);
      return json({ error: "Generation failed", details: raw?.error?.message ?? null }, 502);
    }

    const generated = JSON.parse(outputText(raw));

    const { data: saved, error: saveError } = await supabase
      .from("story_packages")
      .insert({
        order_id: order.id,
        input_snapshot: safeOrder,
        character_bible: generated.character_bible,
        story_bible: generated.story_bible,
        story_outline: generated.story_outline,
        visual_bible: generated.visual_bible,
        model,
        prompt_version: "story-package-v2-character-bible",
        generation_metadata: { openai_response_id: raw.id ?? null },
      })
      .select("*")
      .single();

    if (saveError) {
      console.error(saveError);
      return json({ error: "Save failed", details: saveError.message }, 500);
    }

    return json({ cached: false, package: saved }, 201);
  } catch (error) {
    console.error(error);
    return json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
