import { MVP_VISUAL_STYLE_ID } from "./visual-styles.js";

const MARKER_PATTERN = /\[[A-Za-zÀ-ÿ0-9_:]+\]/g;

export function assertResolvedBook(book) {
  if (!book || typeof book !== "object") throw new Error("BOOK_SNAPSHOT_REQUIRED");
  if (!book.meta || !Array.isArray(book.pages)) throw new Error("BOOK_SNAPSHOT_INVALID");

  const texts = [
    book.cover?.title || "",
    book.cover?.subtitle || "",
    ...book.pages.map((p) => `${p.title || ""}\n${p.text || ""}`)
  ];
  const markers = [...new Set(texts.flatMap((v) => String(v).match(MARKER_PATTERN) || []))];
  if (markers.length) throw new Error(`BOOK_HAS_UNRESOLVED_MARKERS:${markers.sort().join(",")}`);

  for (const page of book.pages) {
    if (!page.id || !page.step_key || !page.scene?.bg) {
      throw new Error(`BOOK_PAGE_INVALID:${page?.id || "unknown"}`);
    }
  }
  if (book.cover && !book.cover.scene?.bg) throw new Error("BOOK_COVER_INVALID");
  return true;
}

function characters(scene, layout = null) {
  return (scene?.layers || []).map((item) => ({
    slot_key: item.role,
    character_id: item.character_id || item.role,
    asset_ref: item.src || null,
    pose: item.pose || "in_piedi",
    featured: layout?.figura_slot === item.role,
  }));
}

export function planBookRender(book) {
  assertResolvedBook(book);
  // During the MVP every book is rendered with the single active style.
  // Legacy snapshots may still contain the old prototype values.
  const style_id = MVP_VISUAL_STYLE_ID;
  const pages = [];

  if (book.cover) {
    const cast = characters(book.cover.scene);
    pages.push({
      page_id: "cover",
      kind: "cover",
      scene_id: "cover",
      chapter: null,
      title: book.cover.title || book.meta.title || "",
      text: book.cover.subtitle || "",
      background_ref: book.cover.scene.bg,
      prompt_environment: book.cover.scene.prompt_environment || null,
      prompt_moment: book.cover.scene.prompt_moment || null,
      authoring_note: book.cover.scene.authoring_note || null,
      layout: book.cover.layout ? structuredClone(book.cover.layout) : null,
      brand_variant: book.cover.brand_variant || "dark",
      style_id,
      characters: cast,
      protagonist_pose: cast.find((item) => item.slot_key === "protagonist")?.pose || "in_piedi",
      helper_id: null,
      helper_pose: null,
      render: {status:"queued",generated_image_url:null,generated_image_path:null,attempts:0,prompt_hash:null,compiled_prompt:null,error:null}
    });
  }

  for (const page of book.pages) {
    const cast = characters(page.scene, page.layout);
    const protagonist = cast.find((item) => item.slot_key === "protagonist");
    const helper = cast.find((item) => item.slot_key === "helper");
    pages.push({
      page_id: page.id,
      kind: "page",
      scene_id: page.step_key,
      chapter: page.chapter ?? null,
      title: page.title || "",
      text: page.text || "",
      background_ref: page.scene.bg,
      prompt_environment: page.scene.prompt_environment || null,
      prompt_moment: page.scene.prompt_moment || null,
      authoring_note: page.scene.authoring_note || null,
      layout: page.layout ? structuredClone(page.layout) : null,
      style_id,
      characters: cast,
      protagonist_pose: protagonist?.pose || "in_piedi",
      helper_id: helper?.character_id || null,
      helper_pose: helper?.pose || null,
      render: {status:"queued",generated_image_url:null,generated_image_path:null,attempts:0,prompt_hash:null,compiled_prompt:null,error:null}
    });
  }
  return JSON.parse(JSON.stringify(pages));
}

export function allPagesReady(pages) {
  return Array.isArray(pages) && pages.length > 0 &&
    pages.every((page) => page?.render?.status === "ready" && page?.render?.generated_image_path);
}
