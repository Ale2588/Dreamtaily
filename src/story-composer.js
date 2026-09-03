/**
 * DreamTaily deterministic story composer.
 *
 * Pure contract:
 * composeStory({ story, choices, catalog, scenes, contentByRef }) -> book
 *
 * No fetch, no DOM, no Supabase and no AI.
 */

const MARKER_PATTERN = /\[[A-Za-zÀ-ÿ0-9_:]+\]/g;

export class StoryCompositionError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "StoryCompositionError";
    this.code = code;
    this.details = details;
  }
}

function invariant(condition, code, message, details = {}) {
  if (!condition) {
    throw new StoryCompositionError(code, message, details);
  }
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalizeCastAssignment(value, fallback = {}) {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    return { source: "catalog_character", character_id: value };
  }

  const characterId = value.character_id || value.id || value.value || fallback.character_id || null;
  const assetRef =
    value.asset_ref || value.image_url || value.image || fallback.asset_ref || null;
  const source =
    value.source ||
    fallback.source ||
    (assetRef ? "user_character" : characterId ? "catalog_character" : null);

  return {
    source,
    character_id: characterId,
    name: value.name || fallback.name || null,
    asset_ref: assetRef,
  };
}

function normalizeChoices(raw = {}) {
  const branches = raw.branches || raw.branch || {};
  const setup = raw.setup || {};
  const rawCast = raw.cast || {};
  const protagonist = raw.protagonist || {};

  const normalizedCast = Object.fromEntries(
    Object.entries(rawCast)
      .map(([slot, value]) => [slot, normalizeCastAssignment(value)])
      .filter(([, value]) => value)
  );
  const protagonistAssignment = normalizeCastAssignment(rawCast.protagonist || protagonist, {
    source: "user_character",
    name: raw.protagonistName || raw.name || "Il protagonista",
    asset_ref: raw.protagonistAssetRef || raw.protagonistImage || null,
  }) || {
    source: "user_character",
    character_id: null,
    name: raw.protagonistName || raw.name || "Il protagonista",
    asset_ref: raw.protagonistAssetRef || raw.protagonistImage || null,
  };

  if (!normalizedCast.protagonist) normalizedCast.protagonist = protagonistAssignment;
  if (!normalizedCast.helper && raw.helper) {
    normalizedCast.helper = normalizeCastAssignment(raw.helper);
  }

  return {
    story: raw.story || raw.story_slug || null,
    style: raw.style || "paper",
    protagonist: normalizedCast.protagonist,
    cast: normalizedCast,
    setup: Object.fromEntries(
      Object.entries(setup).filter(([key]) => key !== "atmosfera")
    ),
    branches: { ...branches },
  };
}

function mergedDecisionMap(choices) {
  return {
    ...choices.setup,
    ...choices.branches,
  };
}

export function resolveStoryPath(story, rawChoices) {
  invariant(story && Array.isArray(story.steps), "STORY_INVALID", "Story steps are required.");
  const choices = normalizeChoices(rawChoices);
  const decisions = mergedDecisionMap(choices);
  const byKey = new Map(story.steps.map((step) => [step.key, step]));

  let key = story.start;
  const visited = new Set();
  const result = [];

  while (key) {
    invariant(byKey.has(key), "STEP_UNKNOWN", `Unknown story step: ${key}`, { key });
    invariant(!visited.has(key), "STORY_CYCLE", `Story cycle detected at: ${key}`, { key });

    visited.add(key);
    const step = byKey.get(key);
    result.push(step);

    if (step.decision?.type === "branch") {
      const decisionKey = step.decision.key;
      const selected = decisions[decisionKey];
      const option = (step.decision.options || []).find((item) => item.key === selected);

      invariant(
        option,
        "BRANCH_CHOICE_REQUIRED",
        `Missing or invalid branch choice: ${decisionKey}`,
        { decisionKey, selected }
      );
      key = option.next ?? null;
    } else {
      key = step.next ?? null;
    }
  }

  return result;
}

function contentFor(contentByRef, ref) {
  invariant(ref, "CONTENT_REF_REQUIRED", "A content reference is required.");
  invariant(
    Object.prototype.hasOwnProperty.call(contentByRef, ref),
    "CONTENT_MISSING",
    `Missing content for reference: ${ref}`,
    { ref }
  );
  return String(contentByRef[ref]).trim();
}

function catalogEntryFor(step, characterId) {
  if (step.decision?.type !== "cast") return null;
  return (step.decision.catalog_roster || []).find((entry) => entry.key === characterId) || null;
}

function slotName(assignment, catalog = {}) {
  return (
    assignment?.name ||
    catalog[assignment?.character_id]?.name ||
    assignment?.character_id ||
    null
  );
}

function castErrorCode(slot, suffix) {
  return slot === "helper" ? `HELPER_${suffix}` : `CAST_SLOT_${suffix}`;
}

export function resolveStepText({ step, choices: rawChoices, contentByRef, catalog = {} }) {
  const choices = normalizeChoices(rawChoices);
  const decisions = mergedDecisionMap(choices);
  const helperAssignment = choices.cast.helper;

  let value = contentFor(contentByRef, step.content_ref);

  for (const [setupKey, refs] of Object.entries(step.variant_refs || {})) {
    const selected = decisions[setupKey];
    const replacement =
      selected && Object.prototype.hasOwnProperty.call(refs, selected)
        ? contentFor(contentByRef, refs[selected])
        : "";
    value = value.replaceAll(`[VARIANTE:${setupKey}]`, replacement);
  }

  if (step.decision?.type === "cast") {
    const slot = step.decision.slot || step.decision.key || "helper";
    const assignment = choices.cast[slot];
    invariant(
      assignment,
      castErrorCode(slot, "REQUIRED"),
      `A cast assignment for ${slot} is required at step: ${step.key}`,
      { step: step.key, slot }
    );
    const allowedSources = step.decision.allowed_sources || [];
    if (allowedSources.length) {
      invariant(
        allowedSources.includes(assignment.source),
        castErrorCode(slot, "SOURCE_NOT_ALLOWED"),
        `Source ${assignment.source} is not available for ${slot} at step: ${step.key}`,
        { step: step.key, slot, source: assignment.source }
      );
    }

    let entranceRef = null;
    if (assignment.source === "catalog_character") {
      const entry = catalogEntryFor(step, assignment.character_id);
      invariant(
        entry,
        castErrorCode(slot, "NOT_ALLOWED"),
        `Character ${assignment.character_id} is not available for ${slot} at step: ${step.key}`,
        { step: step.key, slot, characterId: assignment.character_id }
      );
      entranceRef = entry.entrance_ref || null;
    } else {
      entranceRef = step.decision.user_character_entrance_ref || null;
    }

    const entrance = entranceRef ? contentFor(contentByRef, entranceRef) : "";
    value = value.replaceAll(`[ENTRATA:${slot}]`, entrance);
    if (slot === "helper") value = value.replaceAll("[ENTRATA_AIUTANTE]", entrance);
  } else {
    value = value.replaceAll("[ENTRATA_AIUTANTE]", "");
  }

  for (const [slot, assignment] of Object.entries(choices.cast)) {
    const name = slotName(assignment, catalog);
    if (name) value = value.replaceAll(`[PERSONAGGIO:${slot}]`, name);
  }

  const helperName = slotName(helperAssignment, catalog) || "l’aiutante";
  value = value
    .replaceAll("[Nome]", slotName(choices.protagonist, catalog) || "Il protagonista")
    .replaceAll("[Aiutante]", helperName)
    .trim();

  const markers = [...new Set(value.match(MARKER_PATTERN) || [])].sort();
  invariant(
    markers.length === 0,
    "UNRESOLVED_MARKERS",
    `Unresolved markers in step ${step.key}: ${markers.join(", ")}`,
    { step: step.key, markers }
  );

  return value;
}

function resolveCatalogAsset(character, style, pose) {
  if (!character) return null;

  const styleArt = character.art?.[style] || character.art?.papercut || character.art;
  if (typeof styleArt === "string") return styleArt;

  return (
    styleArt?.[pose] ||
    styleArt?.in_piedi ||
    character.image ||
    character.image_ref ||
    character.image_url ||
    null
  );
}

function resolveBackground(scene, decisions) {
  let background = scene.background_ref || null;

  for (const [variantKey, refs] of Object.entries(scene.variant_backgrounds || {})) {
    const selected = decisions[variantKey];
    if (selected && refs[selected]) {
      background = refs[selected];
    }
  }

  return background;
}

export function resolveScene({
  stepKey,
  choices: rawChoices,
  scenes,
  catalog = {},
}) {
  const choices = normalizeChoices(rawChoices);
  const decisions = mergedDecisionMap(choices);
  const definition = scenes?.scenes?.[stepKey];

  invariant(definition, "SCENE_MISSING", `Missing scene definition for step: ${stepKey}`, {
    stepKey,
  });

  const layers = [];

  for (const slot of definition.slots || []) {
    let src = null;
    let characterId = null;
    const assignment = choices.cast[slot.role];
    invariant(
      assignment,
      castErrorCode(slot.role, "REQUIRED"),
      `A cast assignment for scene role ${slot.role} is required.`,
      { stepKey, slot: slot.role }
    );

    characterId = assignment.character_id || slot.role;
    src = assignment.asset_ref;
    if (!src && assignment.source === "catalog_character") {
      src = resolveCatalogAsset(catalog[assignment.character_id], choices.style, slot.pose);
    }
    invariant(
      src,
      slot.role === "protagonist" ? "PROTAGONIST_ASSET_REQUIRED" : castErrorCode(slot.role, "ASSET_MISSING"),
      `No asset found for ${slot.role}, style ${choices.style}, pose ${slot.pose}.`,
      { stepKey, slot: slot.role, characterId, style: choices.style, pose: slot.pose }
    );

    layers.push({
      src,
      role: slot.role,
      character_id: characterId,
      pose: slot.pose,
      x: slot.x,
      y: slot.y,
      scale: slot.scale,
      z: slot.z,
    });
  }

  layers.sort((left, right) => left.z - right.z);

  return {
    bg: resolveBackground(definition, decisions),
    wash: definition.wash || null,
    prompt_environment: definition.prompt_environment || definition.environment_prompt || null,
    prompt_moment: definition.prompt_moment || definition.moment_prompt || null,
    layers,
  };
}

export function composeStory({
  story,
  choices: rawChoices,
  catalog = {},
  scenes,
  contentByRef,
}) {
  const choices = normalizeChoices(rawChoices);

  invariant(story?.slug, "STORY_SLUG_REQUIRED", "story.slug is required.");
  if (choices.story) {
    invariant(
      choices.story === story.slug,
      "STORY_SLUG_MISMATCH",
      `Choices target ${choices.story}, but story is ${story.slug}.`
    );
  }

  const path = resolveStoryPath(story, choices);
  const pages = path.map((step, index) => ({
    id: `p${index + 1}`,
    step_key: step.key,
    chapter: step.chapter ?? index + 1,
    title: step.title || "",
    text: resolveStepText({ step, choices, contentByRef, catalog }),
    scene: resolveScene({ stepKey: step.key, choices, scenes, catalog }),
  }));

  return {
    meta: {
      story_slug: story.slug,
      title: story.title,
      protagonist: slotName(choices.protagonist, catalog),
      helper: choices.cast.helper?.character_id || null,
      style: choices.style,
      choices: clone({
        setup: choices.setup,
        branches: choices.branches,
        cast: choices.cast,
      }),
    },
    cover: scenes?.cover
      ? {
          title: story.title,
          subtitle: `Un’avventura di ${slotName(choices.protagonist, catalog) || "Il protagonista"}`,
          scene: {
            bg: resolveBackground(scenes.cover, mergedDecisionMap(choices)),
            wash: scenes.cover.wash || null,
            prompt_environment: scenes.cover.prompt_environment || scenes.cover.environment_prompt || null,
            prompt_moment: scenes.cover.prompt_moment || scenes.cover.moment_prompt || null,
            layers: (scenes.cover.slots || [])
              .filter((slot) => slot.role === "protagonist")
              .map((slot) => ({
                src: choices.protagonist.asset_ref,
                role: "protagonist",
                character_id: "protagonist",
                pose: slot.pose,
                x: slot.x,
                y: slot.y,
                scale: slot.scale,
                z: slot.z,
              })),
          },
        }
      : null,
    pages,
  };
}

export function bookToMarkdown(book) {
  return `${book.pages.map((page) => page.text.trim()).join("\n\n---\n\n")}\n`;
}
