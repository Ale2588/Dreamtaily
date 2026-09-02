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

function layer(scene, role) {
  return (scene?.layers || []).find((item) => item.role === role) || null;
}

export function planBookRender(book) {
  assertResolvedBook(book);
  const atmosphere = book.meta?.choices?.setup?.atmosfera || "giorno";
  const pages = [];

  if (book.cover) {
    const protagonist = layer(book.cover.scene, "protagonist");
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
      atmosphere,
      protagonist_pose: protagonist?.pose || "in_piedi",
      helper_id: null,
      helper_pose: null,
      render: {status:"queued",generated_image_url:null,generated_image_path:null,attempts:0,prompt_hash:null,error:null}
    });
  }

  for (const page of book.pages) {
    const protagonist = layer(page.scene, "protagonist");
    const helper = layer(page.scene, "helper");
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
      atmosphere,
      protagonist_pose: protagonist?.pose || "in_piedi",
      helper_id: helper?.character_id || null,
      helper_pose: helper?.pose || null,
      render: {status:"queued",generated_image_url:null,generated_image_path:null,attempts:0,prompt_hash:null,error:null}
    });
  }
  return JSON.parse(JSON.stringify(pages));
}

export function allPagesReady(pages) {
  return Array.isArray(pages) && pages.length > 0 &&
    pages.every((page) => page?.render?.status === "ready" && page?.render?.generated_image_path);
}
