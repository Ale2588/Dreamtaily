/**
 * DreamTaily final-book render prompts.
 *
 * Pure module. No DOM, fetch, Supabase or model calls.
 *
 * Strategy:
 * approved background + protagonist reference + optional helper reference
 * + scene/moment prompt -> one cohesive final illustration.
 */

import { MVP_VISUAL_STYLE_ID, requireActiveVisualStyle } from "./visual-styles.js";

export const STYLE_PROMPT = requireActiveVisualStyle(MVP_VISUAL_STYLE_ID).prompt;

export const HELPER_IDENTITIES = Object.freeze({
  etto: Object.freeze({
    name: "Etto",
    species: "rabbit",
    identity_prompt:
      "a small young rabbit with warm taupe-grey fur, a cream belly, long ears always held low, a dark round button-like nose, and a small dusty-blue fabric patch on the LEFT knee",
    canonical_markers: Object.freeze([
      "long ears held low",
      "dark round button-like nose",
      "dusty-blue fabric patch on the LEFT knee"
    ])
  }),
  briciola: Object.freeze({
    name: "Briciola",
    species: "mouse",
    identity_prompt:
      "a very small young mouse with warm light-grey fur, a cream belly, large round ears turned forward, pink inner ears, and one small dark spot beside a whisker",
    canonical_markers: Object.freeze([
      "smallest helper",
      "large round ears turned forward",
      "small dark spot beside a whisker"
    ])
  }),
  fiamma: Object.freeze({
    name: "Fiamma",
    species: "fox",
    identity_prompt:
      "a small young female fox with rust-orange fur, white paws, a long tail always held low, one ear upright and the other folded forward",
    canonical_markers: Object.freeze([
      "white paws",
      "long tail held low",
      "one ear upright and the other folded forward"
    ])
  }),
  ulivo: Object.freeze({
    name: "Ulivo",
    species: "owl",
    identity_prompt:
      "a small young owl with warm mottled-brown layered feathers, a cream belly, very large round button-like eyes, and one lighter head feather pointing in the opposite direction from the others",
    canonical_markers: Object.freeze([
      "large round button-like eyes",
      "one rebellious head feather pointing the wrong way",
      "never flying when used beside the protagonist"
    ])
  })
});

export const SCENE_PROMPTS = Object.freeze({
  cover: Object.freeze({
    environment:
      "the quiet threshold between home and the forest, inviting and magical, with the forest opening ahead and enough calm visual space for a book cover",
    moment:
      "The protagonist is about to begin the adventure, curious and attentive. Keep the pose simple and iconic."
  }),

  s1: Object.freeze({
    environment:
      "the edge of a quiet village where a mown lawn becomes tall meadow grass and then dense forest; a small warm brass bell with a worn faded-brick ribbon hangs from a low branch at the treeline",
    moment:
      "The protagonist has reached the edge of the forest and notices the bell sounding even though there is no wind. Show curiosity mixed with a little caution."
  }),

  s2: Object.freeze({
    environment:
      "inside the forest, a clearly readable fork: dense tall ferns form a green room on the LEFT, while a small clear stream with rounded stones runs on the RIGHT",
    moment:
      "The protagonist pauses at the fork and studies both possible paths before choosing. The scene should feel like a real decision, not an action pose."
  }),

  s3_felci: Object.freeze({
    environment:
      "deep among very tall sage-green ferns that enclose the path like a green room; the fronds have just opened slightly in the middle band",
    moment:
      "The protagonist has just discovered the helper among the leaves. The helper is shy but willing to stay. Show the first instant of cautious trust between them."
  }),

  s3_ruscello: Object.freeze({
    environment:
      "a mossy bank beside a small clear stream, with tiny wet footprints leading toward a dry rounded stone, reeds and layered leaves, rounded stones in the water, and a low branch reaching over the stream",
    moment:
      "The protagonist follows the tiny footprints and meets the helper beside the stream. They have just recognized that they are looking for the same mysterious sound."
  }),

  s4_felci: Object.freeze({
    environment:
      "huge warm-brown tree roots lifted like fingers, forming a low mossy passage with warm light beyond it; a small piece of faded-brick ribbon catches the light on the moss",
    moment:
      "The protagonist and helper prepare to pass under the low roots together. The helper demonstrates how to go first while the protagonist watches and follows."
  }),

  s4_ruscello: Object.freeze({
    environment:
      "a calm stream crossing made of broad flat rounded stepping stones, mossy banks and tall reeds, with layered paper ripples and soft highlights on the water",
    moment:
      "The protagonist and helper cross the stream together, carefully following the stepping stones and the rhythm of the distant bell."
  }),

  s4: Object.freeze({
    environment:
      "a round quiet forest clearing with low tidy grass; two branches have grown crossed about two metres above the ground, holding a small warm brass bell with a worn faded-brick ribbon",
    moment:
      "The protagonist and helper stop moving and listen carefully. The emotional focus is stillness, attention and the realization of where the bell is."
  }),

  s5: Object.freeze({
    environment:
      "the clearing opening toward the way home; crossed branches are now EMPTY, a thick root rises like a low shoulder, and the path leads toward a bright meadow opening beyond the trees",
    moment:
      "The bell has been freed. The protagonist and helper begin the return journey together, relieved and proud, while deciding how the adventure should end."
  }),

  s6_promessa: Object.freeze({
    environment:
      "the border between forest and home, with meadow grass at the treeline, an open field beyond, and a simple garden gate and quiet house shapes far away",
    moment:
      "The protagonist kneels in the grass and leaves the bell with the helper, making a quiet promise to return. The helper remains at the edge of the meadow. Make the farewell tender, not sad."
  }),

  s6_festa: Object.freeze({
    environment:
      "the round forest clearing prepared for a small warm celebration, with tiny lanterns, simple paper bunting, floating paper petals and small bundles of wildflowers",
    moment:
      "The protagonist and helper share a small joyful celebration before the protagonist returns home. Keep it intimate and warm rather than crowded."
  })
});

const POSE_INSTRUCTIONS = Object.freeze({
  in_piedi: "standing naturally on the ground",
  cammina: "taking a small grounded walking step",
  seduto: "sitting naturally on the ground",
  si_china: "bending or crouching low while staying balanced",
  di_spalle: "seen mostly from behind"
});

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function getHelperIdentity(helperId) {
  return HELPER_IDENTITIES[helperId] || null;
}

export function getScenePrompt(sceneId) {
  return SCENE_PROMPTS[sceneId] || null;
}

export function buildPageRenderPrompt({
  sceneId,
  styleId = MVP_VISUAL_STYLE_ID,
  protagonistIdentity,
  protagonistPose = "in_piedi",
  helperId = null,
  helperIdentity = null,
  helperPose = "in_piedi",
  environmentOverride = null,
  momentOverride = null
} = {}) {
  const canonical = getScenePrompt(sceneId);
  const scene = {
    environment: clean(environmentOverride) || canonical?.environment || "a calm child-friendly storybook setting matching Image 1",
    moment: clean(momentOverride) || canonical?.moment || "The protagonist experiences the story moment described by the approved scene."
  };

  const protagonist = clean(protagonistIdentity);
  if (!protagonist) throw new Error("PROTAGONIST_IDENTITY_REQUIRED");

  const helper = helperIdentity
    ? { identity_prompt: clean(helperIdentity) }
    : getHelperIdentity(helperId);

  const moment = clean(momentOverride) || scene.moment;
  const stylePrompt = requireActiveVisualStyle(styleId).prompt;

  const blocks = [
    stylePrompt,
    "",
    "REFERENCE ORDER:",
    "Image 1 is the APPROVED BACKGROUND and is authoritative for environment, composition, major objects and overall mood.",
    "Image 2 is the PROTAGONIST identity reference.",
    helper ? "Image 3 is the HELPER identity reference." : "",
    "",
    `SCENE: ${scene.environment}.`,
    `STORY MOMENT: ${moment}`,
    "",
    `PROTAGONIST: preserve the identity from Image 2. Identity reinforcement: ${protagonist}. Pose: ${POSE_INSTRUCTIONS[protagonistPose] || protagonistPose}.`,
    helper
      ? `HELPER: preserve the identity from Image 3. Identity reinforcement: ${helper.identity_prompt}. Pose: ${POSE_INSTRUCTIONS[helperPose] || helperPose}.`
      : "",
    "",
    "COMPOSITION RULES:",
    "- Integrate every character into the same paper world with matching material, lighting direction, colour temperature and paper-layer shadows.",
    "- Keep the approved background recognizable: do not remove, replace or invent major environmental landmarks.",
    "- Keep character scale believable for the scene and relative to each other.",
    "- Feet/body base must rest naturally on a believable ground or surface.",
    "- Preserve a calm readable upper area suitable for HTML story text.",
    "- Generate a SINGLE finished illustration, not separate cutouts or a collage layout.",
    "- Do NOT render text, letters, words, captions, speech bubbles, borders or watermarks."
  ];

  return blocks.filter((line) => line !== "").join("\n");
}
