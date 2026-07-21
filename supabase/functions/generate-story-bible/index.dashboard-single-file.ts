import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const schema = {"type":"object","additionalProperties":false,"required":["character_bible","story_bible","story_outline","visual_bible"],"properties":{"story_bible":{"type":"object","additionalProperties":false,"required":["version","language","target_age","protagonist","companion","world","themes","tone","moral","narrative_constraints","continuity_rules"],"properties":{"version":{"type":"string","const":"1.0"},"language":{"type":"string","enum":["it"]},"target_age":{"type":"object","additionalProperties":false,"required":["min","max"],"properties":{"min":{"type":"integer","minimum":2,"maximum":12},"max":{"type":"integer","minimum":2,"maximum":12}}},"protagonist":{"type":"object","additionalProperties":false,"required":["name","description_raw","age","appearance","personality","strengths","growth_need","story_goal"],"properties":{"name":{"type":"string","minLength":1,"maxLength":80},"description_raw":{"type":"string","maxLength":1000},"age":{"type":["integer","null"],"minimum":2,"maximum":12},"appearance":{"type":"object","additionalProperties":false,"required":["hair","eyes","skin_tone","clothing","distinctive_traits","unknown_fields"],"properties":{"hair":{"type":["string","null"]},"eyes":{"type":["string","null"]},"skin_tone":{"type":["string","null"]},"clothing":{"type":["string","null"]},"distinctive_traits":{"type":"array","items":{"type":"string"},"maxItems":12},"unknown_fields":{"type":"array","uniqueItems":true,"items":{"type":"string","enum":["age","hair","eyes","skin_tone","clothing"]}}}},"personality":{"type":"array","minItems":2,"maxItems":6,"items":{"type":"string","minLength":1}},"strengths":{"type":"array","minItems":1,"maxItems":5,"items":{"type":"string","minLength":1}},"growth_need":{"type":"string","minLength":1},"story_goal":{"type":"string","minLength":1}}},"companion":{"type":"object","additionalProperties":false,"required":["id","display_name","species","personality","story_role","relationship_with_protagonist"],"properties":{"id":{"type":"string","enum":["rabbit","bear","fox","owl","frog","eagle","hedgehog","mouse"]},"display_name":{"type":"string","minLength":1},"species":{"type":"string","minLength":1},"personality":{"type":"array","minItems":2,"maxItems":5,"items":{"type":"string","minLength":1}},"story_role":{"type":"string","minLength":1},"relationship_with_protagonist":{"type":"string","minLength":1}}},"world":{"type":"object","additionalProperties":false,"required":["primary_setting","secondary_settings","world_rules","recurring_elements","sensory_identity"],"properties":{"primary_setting":{"type":"string","minLength":1},"secondary_settings":{"type":"array","items":{"type":"string"},"maxItems":12},"world_rules":{"type":"array","minItems":3,"maxItems":10,"items":{"type":"string","minLength":1}},"recurring_elements":{"type":"array","minItems":2,"maxItems":10,"items":{"type":"string","minLength":1}},"sensory_identity":{"type":"object","additionalProperties":false,"required":["colors","sounds","textures","scents"],"properties":{"colors":{"type":"array","minItems":2,"maxItems":8,"items":{"type":"string","minLength":1}},"sounds":{"type":"array","minItems":1,"maxItems":6,"items":{"type":"string","minLength":1}},"textures":{"type":"array","minItems":1,"maxItems":6,"items":{"type":"string","minLength":1}},"scents":{"type":"array","items":{"type":"string"},"maxItems":12}}}}},"themes":{"type":"array","minItems":2,"maxItems":6,"items":{"type":"string","minLength":1}},"tone":{"type":"array","minItems":2,"maxItems":6,"items":{"type":"string","minLength":1}},"moral":{"type":"string","minLength":1},"narrative_constraints":{"type":"object","additionalProperties":false,"required":["danger_level","ending","no_graphic_violence","no_horror","no_abandonment","age_appropriate_language","must_honor_user_choices"],"properties":{"danger_level":{"type":"string","enum":["very_low","low"]},"ending":{"type":"string","enum":["positive","warm_positive"]},"no_graphic_violence":{"type":"boolean","const":true},"no_horror":{"type":"boolean","const":true},"no_abandonment":{"type":"boolean","const":true},"age_appropriate_language":{"type":"boolean","const":true},"must_honor_user_choices":{"type":"boolean","const":true}}},"continuity_rules":{"type":"array","minItems":5,"maxItems":16,"items":{"type":"string","minLength":1}}}},"story_outline":{"type":"object","additionalProperties":false,"required":["version","title","logline","premise","central_conflict","choice_interpretation","emotional_arc","chapters","ending"],"properties":{"version":{"type":"string","const":"1.0"},"title":{"type":"string","minLength":1},"logline":{"type":"string","minLength":1},"premise":{"type":"string","minLength":1},"central_conflict":{"type":"string","minLength":1},"choice_interpretation":{"type":"array","minItems":1,"maxItems":12,"items":{"type":"object","additionalProperties":false,"required":["choice_key","choice_value","narrative_consequence"],"properties":{"choice_key":{"type":"string","minLength":1},"choice_value":{"type":"string","minLength":1},"narrative_consequence":{"type":"string","minLength":1}}}},"emotional_arc":{"type":"object","additionalProperties":false,"required":["start","turning_point","climax","end"],"properties":{"start":{"type":"string","minLength":1},"turning_point":{"type":"string","minLength":1},"climax":{"type":"string","minLength":1},"end":{"type":"string","minLength":1}}},"chapters":{"type":"array","minItems":5,"maxItems":7,"items":{"type":"object","additionalProperties":false,"required":["number","title","narrative_function","location","characters_present","opening_state","main_event","choice_references","emotional_shift","continuity_in","continuity_out","ending_hook","illustration_scene"],"properties":{"number":{"type":"integer","minimum":1,"maximum":8},"title":{"type":"string","minLength":1},"narrative_function":{"type":"string","enum":["opening","inciting_incident","exploration","complication","climax","resolution","epilogue"]},"location":{"type":"string","minLength":1},"characters_present":{"type":"array","minItems":1,"maxItems":8,"items":{"type":"string","minLength":1}},"opening_state":{"type":"string","minLength":1},"main_event":{"type":"string","minLength":1},"choice_references":{"type":"array","items":{"type":"string"},"maxItems":12},"emotional_shift":{"type":"string","minLength":1},"continuity_in":{"type":"array","items":{"type":"string"},"maxItems":12},"continuity_out":{"type":"array","items":{"type":"string"},"maxItems":12},"ending_hook":{"type":["string","null"]},"illustration_scene":{"type":"object","additionalProperties":false,"required":["moment","action","emotion","camera","must_show","must_not_show"],"properties":{"moment":{"type":"string","minLength":1},"action":{"type":"string","minLength":1},"emotion":{"type":"string","minLength":1},"camera":{"type":"string","minLength":1},"must_show":{"type":"array","minItems":2,"maxItems":10,"items":{"type":"string","minLength":1}},"must_not_show":{"type":"array","items":{"type":"string"},"maxItems":12}}}}}},"ending":{"type":"object","additionalProperties":false,"required":["resolution","lesson","final_image"],"properties":{"resolution":{"type":"string","minLength":1},"lesson":{"type":"string","minLength":1},"final_image":{"type":"string","minLength":1}}}}},"visual_bible":{"type":"object","additionalProperties":false,"required":["version","style","protagonist","companion","locations","recurring_visual_motifs","global_continuity_rules","negative_constraints"],"properties":{"version":{"type":"string","const":"1.0"},"style":{"type":"object","additionalProperties":false,"required":["id","medium","palette","lighting","linework","texture","composition_rules"],"properties":{"id":{"type":"string","enum":["paper","water","crayon"]},"medium":{"type":"string","minLength":1},"palette":{"type":"array","minItems":4,"maxItems":10,"items":{"type":"string","minLength":1}},"lighting":{"type":"string","minLength":1},"linework":{"type":"string","minLength":1},"texture":{"type":"string","minLength":1},"composition_rules":{"type":"array","minItems":3,"maxItems":10,"items":{"type":"string","minLength":1}}}},"protagonist":{"type":"object","additionalProperties":false,"required":["canonical_description","age_appearance","face","hair","eyes","skin_tone","clothing","body_proportions","expression_range","unknown_fields","must_never_change"],"properties":{"canonical_description":{"type":"string","minLength":1},"age_appearance":{"type":["string","null"]},"face":{"type":["string","null"]},"hair":{"type":["string","null"]},"eyes":{"type":["string","null"]},"skin_tone":{"type":["string","null"]},"clothing":{"type":["string","null"]},"body_proportions":{"type":"string","minLength":1},"expression_range":{"type":"array","minItems":3,"maxItems":10,"items":{"type":"string","minLength":1}},"unknown_fields":{"type":"array","uniqueItems":true,"items":{"type":"string","enum":["age_appearance","face","hair","eyes","skin_tone","clothing"]}},"must_never_change":{"type":"array","minItems":3,"maxItems":12,"items":{"type":"string","minLength":1}}}},"companion":{"type":"object","additionalProperties":false,"required":["canonical_description","species","color","size_relative_to_protagonist","accessories","expression_range","must_never_change"],"properties":{"canonical_description":{"type":"string","minLength":1},"species":{"type":"string","minLength":1},"color":{"type":"string","minLength":1},"size_relative_to_protagonist":{"type":"string","minLength":1},"accessories":{"type":"array","items":{"type":"string"},"maxItems":12},"expression_range":{"type":"array","minItems":3,"maxItems":10,"items":{"type":"string","minLength":1}},"must_never_change":{"type":"array","minItems":3,"maxItems":12,"items":{"type":"string","minLength":1}}}},"locations":{"type":"array","minItems":1,"maxItems":10,"items":{"type":"object","additionalProperties":false,"required":["id","canonical_description","palette","landmarks","lighting","must_never_change"],"properties":{"id":{"type":"string","minLength":1},"canonical_description":{"type":"string","minLength":1},"palette":{"type":"array","minItems":3,"maxItems":8,"items":{"type":"string","minLength":1}},"landmarks":{"type":"array","minItems":1,"maxItems":10,"items":{"type":"string","minLength":1}},"lighting":{"type":"string","minLength":1},"must_never_change":{"type":"array","minItems":1,"maxItems":10,"items":{"type":"string","minLength":1}}}}},"recurring_visual_motifs":{"type":"array","minItems":2,"maxItems":12,"items":{"type":"string","minLength":1}},"global_continuity_rules":{"type":"array","minItems":6,"maxItems":20,"items":{"type":"string","minLength":1}},"negative_constraints":{"type":"array","minItems":8,"maxItems":24,"items":{"type":"string","minLength":1}}}},"character_bible":{"type":"object","additionalProperties":false,"required":["version","type","identity","narrative_profile","visual_profile","immutable_traits","allowed_variations","forbidden_inventions"],"properties":{"version":{"type":"string","const":"1.0"},"type":{"type":"string","enum":["real_person","fictional_character"]},"identity":{"type":"object","additionalProperties":false,"required":["display_name","age","narrative_age_group","pronouns"],"properties":{"display_name":{"type":"string"},"age":{"type":["integer","null"]},"narrative_age_group":{"type":"string"},"pronouns":{"type":["string","null"]}}},"narrative_profile":{"type":"object","additionalProperties":false,"required":["personality","interests","strengths","growth_opportunities"],"properties":{"personality":{"type":"array","items":{"type":"string"}},"interests":{"type":"array","items":{"type":"string"}},"strengths":{"type":"array","items":{"type":"string"}},"growth_opportunities":{"type":"array","items":{"type":"string"}}}},"visual_profile":{"type":"object","additionalProperties":false,"required":["species","hair_color","hair_style","eye_color","skin_tone","body_color","body_shape","default_outfit","distinctive_features"],"properties":{"species":{"type":["string","null"]},"hair_color":{"type":["string","null"]},"hair_style":{"type":["string","null"]},"eye_color":{"type":["string","null"]},"skin_tone":{"type":["string","null"]},"body_color":{"type":["string","null"]},"body_shape":{"type":["string","null"]},"default_outfit":{"type":"object","additionalProperties":false,"required":["top","bottom","shoes","accessory"],"properties":{"top":{"type":["string","null"]},"bottom":{"type":["string","null"]},"shoes":{"type":["string","null"]},"accessory":{"type":["string","null"]}}},"distinctive_features":{"type":"array","items":{"type":"string"}}}},"immutable_traits":{"type":"array","items":{"type":"string"}},"allowed_variations":{"type":"array","items":{"type":"string"}},"forbidden_inventions":{"type":"array","items":{"type":"string"}}}}}} as const;

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
