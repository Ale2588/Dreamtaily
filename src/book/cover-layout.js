let catalogo = null;

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pct(value, total) {
  return `${(Number(value) / total) * 100}%`;
}

function geometry(area, width, height) {
  return `left:${pct(area.x, width)};top:${pct(area.y, height)};width:${pct(area.w, width)};height:${pct(area.h, height)}`;
}

function requiredFields(value, fields, label) {
  for (const field of fields) {
    if (!(field in (value || {}))) throw new Error(`COVER_CATALOG_FIELD_MISSING:${label}.${field}`);
  }
}

export function inizializzaGabbieCopertina(json) {
  const value = typeof json === "string" ? JSON.parse(json) : structuredClone(json);
  if (!value || value.versione !== 2 || !Array.isArray(value.gabbie)) throw new Error("COVER_CATALOG_INVALID");
  if (value.gabbie.filter((item) => item.tipo === "front").length !== 3) throw new Error("COVER_FRONT_COUNT_INVALID");
  if (value.gabbie.filter((item) => item.tipo === "back").length !== 2) throw new Error("COVER_BACK_COUNT_INVALID");
  for (const item of value.gabbie) {
    requiredFields(item, ["nome", "tipo", "formato", "image_area", "title_area", "subtitle_area", "description_area", "brand_area", "technical_area", "safe_zones", "subject_zones", "avoid_zones", "max_title", "max_subtitle", "max_description", "supports_multiple_characters", "prompt_layout_instruction"], item.nome || "unknown");
  }
  catalogo = value;
  return structuredClone(catalogo);
}

export function gabbieCopertina(tipo = "front") {
  if (!catalogo) throw new Error("COVER_CATALOG_NOT_INITIALIZED");
  return catalogo.gabbie.filter((item) => item.tipo === tipo).map((item) => structuredClone(item));
}

export function gabbiaCopertinaPerNome(nome, tipo = null) {
  if (!catalogo) throw new Error("COVER_CATALOG_NOT_INITIALIZED");
  return structuredClone(catalogo.gabbie.find((item) => item.nome === nome && (!tipo || item.tipo === tipo)) || null);
}

export function validaSceltaCopertina({ story, scenes }) {
  if (!catalogo) throw new Error("COVER_CATALOG_NOT_INITIALIZED");
  const config = story?.editorial?.book_cover || {};
  const front = config.front || {};
  const errors = [];
  const gabbia = catalogo.gabbie.find((item) => item.tipo === "front" && item.nome === front.layout?.gabbia);
  if (!gabbia) errors.push({ code: "COVER_LAYOUT_REQUIRED" });
  if (!String(front.title || "").trim()) errors.push({ code: "COVER_TITLE_REQUIRED" });
  if (!String(front.subtitle || "").trim()) errors.push({ code: "COVER_SUBTITLE_REQUIRED" });
  if (gabbia && String(front.title || "").length > gabbia.max_title) errors.push({ code: "COVER_TITLE_OVERFLOW", max: gabbia.max_title });
  if (gabbia && String(front.subtitle || "").length > gabbia.max_subtitle) errors.push({ code: "COVER_SUBTITLE_OVERFLOW", max: gabbia.max_subtitle });
  const coverScene = scenes?.cover || null;
  if (!coverScene) errors.push({ code: "COVER_SCENE_REQUIRED" });
  if (!String(coverScene?.prompt_environment || coverScene?.environment_prompt || "").trim()) errors.push({ code: "COVER_ENVIRONMENT_REQUIRED" });
  if (!String(coverScene?.prompt_moment || coverScene?.moment_prompt || "").trim()) errors.push({ code: "COVER_MOMENT_REQUIRED" });
  return errors;
}

function veilStyle(veil, theme) {
  const rgb = theme === "light" ? "14,22,20" : "253,245,230";
  const opacity = theme === "light" ? veil.opacita_scuro : veil.opacita_chiaro;
  const solid = `rgba(${rgb},${opacity})`;
  const clear = `rgba(${rgb},0)`;
  if (veil.tipo === "verticale-alto") return `linear-gradient(to bottom,${solid},${clear})`;
  if (veil.tipo === "verticale-basso") return `linear-gradient(to top,${solid},${clear})`;
  if (veil.tipo === "orizzontale-sinistra") return `linear-gradient(to right,${solid},${clear})`;
  return solid;
}

export function renderCopertina({ gabbia, image, title, subtitle, brandVariant = "dark", logoSrc = "assets/brand/dreamtaily-icon.png", portrait = false }) {
  if (!gabbia || gabbia.tipo !== "front") throw new Error("COVER_FRONT_LAYOUT_REQUIRED");
  const width = gabbia.formato.larghezza;
  const height = gabbia.formato.altezza;
  const ink = brandVariant === "light" ? "#fdf5e6" : "#22321f";
  const veils = (gabbia.veil || []).map((item) => `<div class="dtc-veil" style="${geometry(item.copre, width, height)};background:${veilStyle(item, brandVariant)}"></div>`).join("");
  const text = (area, value, className) => area ? `<div class="${className}" style="${geometry(area, width, height)};font-size:${pct(area.corpo, width)};line-height:${area.interlinea / area.corpo};text-align:${area.allineamento};color:${ink}">${esc(value)}</div>` : "";
  const brand = `<div class="dtc-brand" style="${geometry(gabbia.brand_area, width, height)};color:${ink};justify-content:${gabbia.brand_area.allineamento === "center" ? "center" : "flex-start"}"><img src="${esc(logoSrc)}" alt=""><strong>DreamTaily</strong></div>`;
  return `<section class="dtc-cover" data-cover-layout="${esc(gabbia.nome)}" data-cover-format="${portrait ? "portrait" : "landscape"}"><img class="dtc-image" src="${esc(image)}" alt="">${veils}${text(gabbia.title_area, title, "dtc-title")}${text(gabbia.subtitle_area, subtitle, "dtc-subtitle")}${brand}</section>`;
}

export const stiliCopertina = `
.dtc-cover{position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;container-type:inline-size;background:#fdf5e6;font-family:Faustina,Georgia,serif}
.dtc-cover>*{position:absolute;box-sizing:border-box}.dtc-image{inset:0;width:100%;height:100%;object-fit:cover}
.dtc-title,.dtc-subtitle{display:flex;align-items:center;justify-content:center;text-wrap:balance;z-index:3}
.dtc-title{font-weight:600}.dtc-subtitle{font-style:italic}.dtc-veil{z-index:2}.dtc-brand{display:flex;align-items:center;gap:2.2cqw;z-index:4;font-size:3.25cqw}
.dtc-brand img{position:static;width:5.2cqw;height:5.2cqw;object-fit:cover;border-radius:50%;background:#fff}.dtc-brand strong{font-weight:700;letter-spacing:.01em}
.dtc-cover[data-cover-format="portrait"]{aspect-ratio:2/3;max-width:min(100%,680px);margin-inline:auto}
.dtc-cover[data-cover-format="portrait"] .dtc-title{left:9%!important;top:7%!important;width:82%!important;height:25%!important;font-size:clamp(34px,10cqw,72px)!important;line-height:1.02!important;text-align:center!important;align-items:center;font-weight:700;text-shadow:0 2px 16px rgba(253,245,230,.35)}
.dtc-cover[data-cover-format="portrait"][data-cover-layout="Margine"] .dtc-title{left:9%!important;top:9%!important;width:66%!important;text-align:left!important;justify-content:flex-start}
.dtc-cover[data-cover-format="portrait"][data-cover-layout="Pannello"] .dtc-title{left:8%!important;top:61%!important;width:84%!important;height:22%!important;background:rgba(253,245,230,.86);padding:5%;border-radius:2cqw}
.dtc-cover[data-cover-format="portrait"] .dtc-subtitle{display:none}
.dtc-cover[data-cover-format="portrait"] .dtc-brand{left:9%!important;top:88%!important;width:82%!important;height:8%!important;justify-content:center!important;gap:2.5cqw;font-size:clamp(18px,4.8cqw,34px)!important}
.dtc-cover[data-cover-format="portrait"] .dtc-brand img{width:9cqw;height:9cqw;border-radius:50%;box-shadow:0 2px 10px rgba(34,50,31,.18)}
`;
