export const VISUAL_STYLE_CATALOG = Object.freeze({
  paper: Object.freeze({
    id: "paper",
    label: "Paper Cut",
    status: "active",
    prompt: [
      "Create one finished children's storybook illustration in handcrafted CUT-PAPER COLLAGE style.",
      "Match the approved background: hand-cut layered construction paper, visible paper grain and fibers, matte opaque surfaces, soft short shadows between stacked paper layers, no drawn outlines, simplified warm reassuring shapes.",
      "The finished image must read as one coherent illustration, never as characters pasted onto a background."
    ].join(" ")
  }),
  water: Object.freeze({
    id: "water",
    label: "Acquerello",
    status: "planned",
    prompt: null
  }),
  crayon: Object.freeze({
    id: "crayon",
    label: "Pastelli",
    status: "planned",
    prompt: null
  })
});

export const MVP_VISUAL_STYLE_ID = "paper";

export function normalizeVisualStyleId(value) {
  const id = String(value || "").trim().toLowerCase();
  if (id === "papercut" || id === "paper-cut" || id === "paper_cut") return "paper";
  return Object.prototype.hasOwnProperty.call(VISUAL_STYLE_CATALOG, id)
    ? id
    : MVP_VISUAL_STYLE_ID;
}

export function getVisualStyle(value = MVP_VISUAL_STYLE_ID) {
  return VISUAL_STYLE_CATALOG[normalizeVisualStyleId(value)];
}

export function requireActiveVisualStyle(value = MVP_VISUAL_STYLE_ID) {
  const style = getVisualStyle(value);
  if (style.status !== "active" || !style.prompt) {
    throw new Error(`VISUAL_STYLE_NOT_ACTIVE:${style.id}`);
  }
  return style;
}
