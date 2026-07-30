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

function normalizeChoices(raw = {}) {
  const branches = raw.branches || raw.branch || {};
  const setup = raw.setup || {};
  const cast = raw.cast || {};
  const protagonist = raw.protagonist || {};

  return {
    story: raw.story || raw.story_slug || null,
    style: raw.style || "papercut",
    protagonist: {
      name: protagonist.name || raw.protagonistName || raw.name || "Il protagonista",
      asset_ref:
        protagonist.asset_ref ||
        protagonist.image_url ||
        raw.protagonistAssetRef ||
        raw.protagonistImage ||
        null,
    },
    cast: {
      helper:
        typeof cast.helper === "string"
          ? cast.helper
          : cast.helper?.value || raw.helper || null,
    },
    setup: { ...setup },
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

function helperEntryFor(step, helperId) {
  if (step.decision?.type !== "cast") return null;
  return (step.decision.catalog_roster || []).find((entry) => entry.key === helperId) || null;
}

export function resolveStepText({ step, choices: rawChoices, contentByRef, catalog = {} }) {
  const choices = normalizeChoices(rawChoices);
  const decisions = mergedDecisionMap(choices);
  const helperId = choices.cast.helper;

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
    invariant(
      helperId,
      "HELPER_REQUIRED",
      `A helper is required at step: ${step.key}`,
      { step: step.key }
    );
    const entry = helperEntryFor(step, helperId);
    invariant(
      entry,
      "HELPER_NOT_ALLOWED",
      `Helper ${helperId} is not available at step: ${step.key}`,
      { step: step.key, helperId }
    );
    value = value.replaceAll(
      "[ENTRATA_AIUTANTE]",
      entry.entrance_ref ? contentFor(contentByRef, entry.entrance_ref) : ""
    );
  } else {
    value = value.replaceAll("[ENTRATA_AIUTANTE]", "");
  }

  const helperName = catalog[helperId]?.name || helperId || "l’aiutante";
  value = value
    .replaceAll("[Nome]", choices.protagonist.name)
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

  const helperId = choices.cast.helper;
  const layers = [];

  for (const slot of definition.slots || []) {
    let src = null;
    let characterId = null;

    if (slot.role === "protagonist") {
      src = choices.protagonist.asset_ref;
      characterId = "protagonist";
      invariant(
        src,
        "PROTAGONIST_ASSET_REQUIRED",
        "The protagonist asset_ref is required for visual composition."
      );
    } else if (slot.role === "helper") {
      if (!helperId) continue;
      characterId = helperId;
      src = resolveCatalogAsset(catalog[helperId], choices.style, slot.pose);
      invariant(
        src,
        "HELPER_ASSET_MISSING",
        `No asset found for helper ${helperId}, style ${choices.style}, pose ${slot.pose}.`,
        { helperId, style: choices.style, pose: slot.pose }
      );
    } else {
      continue;
    }

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
      protagonist: choices.protagonist.name,
      helper: choices.cast.helper,
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
          subtitle: `Un’avventura di ${choices.protagonist.name}`,
          scene: {
            bg: resolveBackground(scenes.cover, mergedDecisionMap(choices)),
            wash: scenes.cover.wash || null,
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
