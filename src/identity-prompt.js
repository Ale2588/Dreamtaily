/**
 * DreamTaily identity prompt compiler.
 *
 * Pure contract:
 * buildIdentityPrompt(appearance, displayName) -> string
 *
 * Notes:
 * - displayName is accepted for API compatibility but intentionally ignored:
 *   proper names must never enter the visual prompt.
 * - User-provided appearance values are preserved verbatim. This function does
 *   not translate arbitrary free text; deterministic translation would require
 *   a controlled vocabulary upstream.
 */

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function append(parts, value) {
  const normalized = clean(value);
  if (normalized) parts.push(normalized);
}

function outfitParts(outfit = {}) {
  if (!outfit || typeof outfit !== "object") return [];
  return ["top", "bottom", "shoes", "accessory"]
    .map((key) => clean(outfit[key]))
    .filter(Boolean);
}

export function buildIdentityPrompt(appearance = {}, displayName = "") {
  void displayName;

  const parts = [];
  const species = clean(appearance?.species);

  append(parts, species || "a young child");

  const skinTone = clean(appearance?.skin_tone);
  if (skinTone) append(parts, `${skinTone} skin`);

  const eyeColor = clean(appearance?.eye_color);
  if (eyeColor) append(parts, `${eyeColor} eyes`);

  const hairColor = clean(appearance?.hair_color);
  const hairStyle = clean(appearance?.hair_style);
  if (hairColor || hairStyle) {
    append(parts, `${[hairStyle, hairColor].filter(Boolean).join(" ")} hair`);
  }

  const bodyColor = clean(appearance?.body_color);
  if (bodyColor && !skinTone) append(parts, bodyColor);

  const bodyShape = clean(appearance?.body_shape);
  if (bodyShape) append(parts, bodyShape);

  for (const item of outfitParts(appearance?.default_outfit)) {
    append(parts, item);
  }

  for (const feature of Array.isArray(appearance?.distinctive_features)
    ? appearance.distinctive_features
    : []) {
    append(parts, feature);
  }

  return parts.join(", ");
}
