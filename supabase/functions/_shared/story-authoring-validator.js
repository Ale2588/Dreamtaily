const PERSON_MARKER_PATTERN = /\[PERSONAGGIO:([A-Za-z0-9_-]+)\]/g;
const ENTRANCE_MARKER_PATTERN = /\[ENTRATA:([A-Za-z0-9_-]+)\]/g;
const AGE_RANGES = new Set(["3–5 anni", "4–7 anni", "4–8 anni", "5–9 anni", "6–10 anni"]);
const TONES = new Set(["Dolce e luminoso", "Caldo e rassicurante", "Avventuroso e rassicurante", "Curiosità e amicizia", "Coraggio e ascolto", "Fiabesco e contemplativo"]);

function successors(step) {
  if (step.decision?.type === "branch") {
    return (step.decision.options || []).map((option) => option.next).filter(Boolean);
  }
  return step.next ? [step.next] : [];
}

function intersection(sets) {
  if (!sets.length) return new Set();
  return new Set([...sets[0]].filter((value) => sets.slice(1).every((set) => set.has(value))));
}

function markers(text, pattern) {
  return new Set([...String(text || "").matchAll(pattern)].map((match) => match[1]));
}

function referencedContent(step) {
  const refs = [step.content_ref];
  for (const variants of Object.values(step.variant_refs || {})) {
    refs.push(...Object.values(variants || {}));
  }
  if (step.decision?.type === "cast") {
    refs.push(step.decision.user_character_entrance_ref);
    refs.push(...(step.decision.catalog_roster || []).map((entry) => entry.entrance_ref));
  }
  return refs.filter(Boolean);
}

function usedSlots(step, scene, contentByRef) {
  const result = new Set((scene?.slots || []).map((slot) => slot.role));
  for (const ref of referencedContent(step)) {
    const text = contentByRef?.[ref] || "";
    for (const slot of markers(text, PERSON_MARKER_PATTERN)) result.add(slot);
    for (const slot of markers(text, ENTRANCE_MARKER_PATTERN)) result.add(slot);
    if (text.includes("[Nome]")) result.add("protagonist");
    if (text.includes("[Aiutante]") || text.includes("[ENTRATA_AIUTANTE]")) result.add("helper");
  }
  return result;
}

export function validateAuthoringContract({ story, scenes, contentByRef }) {
  const errors = [];
  const editorial = story?.editorial || {};
  if (!String(story?.title || "").trim()) errors.push({ code: "TITLE_REQUIRED" });
  if (!AGE_RANGES.has(String(editorial.age_range || ""))) errors.push({ code: "AGE_RANGE_INVALID" });
  if (!TONES.has(String(editorial.tone || ""))) errors.push({ code: "TONE_INVALID" });
  if (!String(editorial.summary || "").trim()) errors.push({ code: "SUMMARY_REQUIRED" });
  if (!String(editorial.description || "").trim()) errors.push({ code: "DESCRIPTION_REQUIRED" });
  if (!String(editorial.cover_ref || "").trim()) errors.push({ code: "COVER_REQUIRED" });
  const steps = Array.isArray(story?.steps) ? story.steps : [];
  const castSlots = Array.isArray(story?.cast_slots) ? story.cast_slots : [];
  const castKeys = castSlots.map((slot) => slot.key).filter(Boolean);
  const declaredSlots = new Set(["protagonist", ...castKeys]);
  const keys = steps.map((step) => step.key).filter(Boolean);
  const byKey = new Map(steps.map((step) => [step.key, step]));

  if (new Set(keys).size !== keys.length || keys.length !== steps.length) {
    errors.push({ code: "STEP_KEYS_INVALID" });
  }
  if (new Set(castKeys).size !== castKeys.length || castKeys.length !== castSlots.length) {
    errors.push({ code: "CAST_SLOT_KEYS_INVALID" });
  }
  if (!story?.start || !byKey.has(story.start)) {
    errors.push({ code: "START_INVALID", step: story?.start || null });
    return { valid: false, errors };
  }

  const reachable = new Set();
  const visiting = new Set();
  const visited = new Set();
  const order = [];
  function visit(key) {
    if (!byKey.has(key)) {
      errors.push({ code: "STEP_UNKNOWN", step: key });
      return;
    }
    reachable.add(key);
    if (visiting.has(key)) {
      errors.push({ code: "STORY_CYCLE", step: key });
      return;
    }
    if (visited.has(key)) return;
    visiting.add(key);
    for (const next of successors(byKey.get(key))) visit(next);
    visiting.delete(key);
    visited.add(key);
    order.unshift(key);
  }
  visit(story.start);

  for (const step of steps) {
    if (!reachable.has(step.key)) errors.push({ code: "STEP_UNREACHABLE", step: step.key });
    if (step.decision?.type === "branch" && (step.decision.options || []).length < 2) {
      errors.push({ code: "BRANCH_OPTIONS_REQUIRED", step: step.key });
    }
    if (step.decision?.type === "branch") {
      for (const option of step.decision.options || []) {
        if (!option.next) errors.push({ code: "BRANCH_DESTINATION_REQUIRED", step: step.key, option: option.key || null });
      }
    }
    for (const ref of referencedContent(step)) {
      if (!contentByRef || !Object.prototype.hasOwnProperty.call(contentByRef, ref)) {
        errors.push({ code: "CONTENT_MISSING", step: step.key, ref });
      }
    }
    const scene = scenes?.scenes?.[step.key];
    if (!scene) {
      errors.push({ code: "SCENE_MISSING", step: step.key });
    } else {
      if (!String(scene.background_ref || scene.background || "").trim()) errors.push({ code: "SCENE_BACKGROUND_REQUIRED", step: step.key });
      if (!String(scene.environment_prompt || "").trim()) errors.push({ code: "SCENE_ENVIRONMENT_PROMPT_REQUIRED", step: step.key });
      if (!String(scene.moment_prompt || "").trim()) errors.push({ code: "SCENE_MOMENT_PROMPT_REQUIRED", step: step.key });
      for (const slot of scene.slots || []) {
        if (!slot?.role || !declaredSlots.has(slot.role)) errors.push({ code: "SCENE_SLOT_UNKNOWN", step: step.key, slot: slot?.role || null });
      }
    }
  }

  const predecessors = new Map(order.map((key) => [key, []]));
  for (const key of order) {
    for (const next of successors(byKey.get(key))) {
      if (predecessors.has(next)) predecessors.get(next).push(key);
    }
  }

  const initial = new Set(
    (story.cast_slots || [])
      .filter((slot) => slot.introduced_at === "start")
      .map((slot) => slot.key)
  );
  initial.add("protagonist");
  const outgoing = new Map();

  for (const key of order) {
    const step = byKey.get(key);
    const incoming = key === story.start
      ? new Set(initial)
      : intersection((predecessors.get(key) || []).map((previous) => outgoing.get(previous) || new Set()));
    const available = new Set(incoming);
    if (step.decision?.type === "cast") {
      available.add(step.decision.slot || step.decision.key || "helper");
    }
    for (const slot of usedSlots(step, scenes?.scenes?.[key], contentByRef)) {
      if (!available.has(slot)) errors.push({ code: "CAST_SLOT_USED_BEFORE_ASSIGNMENT", step: key, slot });
    }
    outgoing.set(key, available);
  }

  return { valid: errors.length === 0, errors };
}
