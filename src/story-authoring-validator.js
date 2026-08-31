const PERSON_MARKER_PATTERN = /\[PERSONAGGIO:([A-Za-z0-9_-]+)\]/g;
const ENTRANCE_MARKER_PATTERN = /\[ENTRATA:([A-Za-z0-9_-]+)\]/g;

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

function usedSlots(step, scene, contentByRef) {
  const result = new Set((scene?.slots || []).map((slot) => slot.role));
  const refs = [step.content_ref, ...Object.values(step.variant_refs || {}).flatMap((map) => Object.values(map || {}))];
  for (const ref of refs) {
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
  const steps = Array.isArray(story?.steps) ? story.steps : [];
  const byKey = new Map(steps.map((step) => [step.key, step]));
  if (!story?.start || !byKey.has(story.start)) {
    return { valid: false, errors: [{ code: "START_INVALID", step: story?.start || null }] };
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
    if (!contentByRef || !Object.prototype.hasOwnProperty.call(contentByRef, step.content_ref)) {
      errors.push({ code: "CONTENT_MISSING", step: step.key, ref: step.content_ref });
    }
    if (!scenes?.scenes?.[step.key]) errors.push({ code: "SCENE_MISSING", step: step.key });
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
