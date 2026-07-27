/**
 * DreamTaily book reader.
 * Contract: renderBook(root, book, options?) -> controller
 */

const DEFAULT_LABELS = {
  previous: "Pagina precedente",
  next: "Pagina successiva",
  close: "Chiudi il libro",
  cover: "Copertina",
  chapter: "Capitolo",
  page: "Pagina",
  of: "di",
  end: "Fine",
};

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeBook(book) {
  invariant(book && typeof book === "object", "A composed book object is required.");
  invariant(book.meta && typeof book.meta === "object", "book.meta is required.");
  invariant(Array.isArray(book.pages), "book.pages must be an array.");
  return {
    meta: {
      title: book.meta.title || "DreamTaily",
      protagonist: book.meta.protagonist || "",
      story_slug: book.meta.story_slug || "",
      style: book.meta.style || "",
    },
    cover: book.cover || null,
    pages: book.pages.map((page, index) => ({
      id: page.id || `p${index + 1}`,
      step_key: page.step_key || null,
      chapter: page.chapter ?? index + 1,
      title: page.title || "",
      text: page.text || "",
      scene: page.scene || { bg: null, wash: null, layers: [] },
    })),
  };
}

export function buildReaderSequence(book) {
  const normalized = normalizeBook(book);
  const sequence = [];
  if (normalized.cover) {
    sequence.push({
      kind: "cover",
      id: "cover",
      title: normalized.cover.title || normalized.meta.title,
      subtitle: normalized.cover.subtitle || "",
      scene: normalized.cover.scene || { bg: null, wash: null, layers: [] },
    });
  }
  for (const page of normalized.pages) sequence.push({ kind: "page", ...page });
  return sequence;
}

export function createReaderState(book, initialIndex = 0) {
  const sequence = buildReaderSequence(book);
  invariant(sequence.length > 0, "The book has no readable pages.");
  let index = clamp(Number(initialIndex) || 0, 0, sequence.length - 1);
  return {
    get index() { return index; },
    get length() { return sequence.length; },
    get current() { return sequence[index]; },
    get canPrevious() { return index > 0; },
    get canNext() { return index < sequence.length - 1; },
    goTo(nextIndex) {
      index = clamp(Number(nextIndex) || 0, 0, sequence.length - 1);
      return sequence[index];
    },
    previous() {
      if (index > 0) index -= 1;
      return sequence[index];
    },
    next() {
      if (index < sequence.length - 1) index += 1;
      return sequence[index];
    },
    first() { index = 0; return sequence[index]; },
    last() { index = sequence.length - 1; return sequence[index]; },
    sequence,
  };
}

function sceneHtml(scene = {}) {
  const background = scene.bg
    ? `<img class="dt-reader-bg" src="${escapeHtml(scene.bg)}" alt="">`
    : `<div class="dt-reader-bg dt-reader-bg-placeholder" aria-hidden="true"></div>`;
  const wash = scene.wash
    ? `<div class="dt-reader-wash" style="background:${escapeHtml(scene.wash)}"></div>`
    : "";
  const layers = [...(scene.layers || [])]
    .sort((a, b) => (a.z || 0) - (b.z || 0))
    .map((layer) => `<img class="dt-reader-layer" src="${escapeHtml(layer.src)}" alt=""
      data-role="${escapeHtml(layer.role || "")}"
      style="left:${Number(layer.x || 0) * 100}%;top:${Number(layer.y || 0) * 100}%;
      height:${Number(layer.scale || 0) * 100}%;z-index:${Number(layer.z || 0)}">`)
    .join("");
  return `<div class="dt-reader-scene">${background}${wash}${layers}</div>`;
}

export function readerViewModel(book, state, labels = DEFAULT_LABELS) {
  const item = state.current;
  const isCover = item.kind === "cover";
  return {
    item,
    isCover,
    title: item.title || book.meta.title,
    eyebrow: isCover ? labels.cover : `${labels.chapter} ${escapeHtml(item.chapter)}`,
    text: isCover ? item.subtitle || "" : item.text || "",
    progress: `${labels.page} ${state.index + 1} ${labels.of} ${state.length}`,
    canPrevious: state.canPrevious,
    canNext: state.canNext,
    isLast: !state.canNext,
  };
}

function styles() {
  return `
  .dt-reader{--cream:#f7f0e5;--paper:#fffdf8;--brown:#3d2b1f;--muted:#8a7868;
  --coral:#e8735a;--coral-dark:#c9543c;--teal:#5b9ea0;--line:#eadfce;
  --shadow:0 18px 50px rgba(61,43,31,.14);min-height:100%;padding:22px;
  background:linear-gradient(160deg,#f7f0e5,#efe5d5);color:var(--brown);
  font-family:'Nunito',system-ui,sans-serif}.dt-reader *{box-sizing:border-box}
  .dt-reader-shell{max-width:1180px;margin:0 auto}.dt-reader-topbar{display:flex;
  align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
  .dt-reader-brand{display:flex;align-items:center;gap:10px;font-family:'Baloo 2';
  font-weight:800;font-size:21px}.dt-reader-brand img{width:42px;height:42px;border-radius:50%}
  .dt-reader-progress{font-size:13px;font-weight:800;color:var(--muted)}
  .dt-reader-close,.dt-reader-button{border:0;border-radius:14px;padding:12px 18px;
  font:inherit;font-weight:800;cursor:pointer}.dt-reader-close{background:#fff;color:var(--brown);
  border:1px solid var(--line)}.dt-reader-spread{display:grid;
  grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr);min-height:min(720px,calc(100svh - 150px));
  overflow:hidden;background:var(--paper);border:1px solid var(--line);border-radius:30px;
  box-shadow:var(--shadow)}.dt-reader-visual{padding:22px;background:linear-gradient(160deg,#dce8df,#f4e6d2);
  display:flex;align-items:center}.dt-reader-scene{position:relative;width:100%;aspect-ratio:4/3;
  border-radius:22px;overflow:hidden;background:#e9dcc4;box-shadow:0 14px 34px rgba(61,43,31,.16)}
  .dt-reader-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .dt-reader-bg-placeholder{background:linear-gradient(165deg,#6f8f7c,#314d59 60%,#4c684d)}
  .dt-reader-wash{position:absolute;inset:0;z-index:1;pointer-events:none}
  .dt-reader-layer{position:absolute;transform:translate(-50%,-100%);width:auto;object-fit:contain;
  filter:drop-shadow(0 12px 14px rgba(28,38,31,.28))}
  .dt-reader-copy{position:relative;padding:clamp(28px,5vw,58px);display:flex;flex-direction:column;
  justify-content:center;border-left:1px solid var(--line)}.dt-reader-eyebrow{color:var(--coral-dark);
  font-size:12px;letter-spacing:1.4px;text-transform:uppercase;font-weight:800;margin-bottom:12px}
  .dt-reader-title{font-family:'Baloo 2';font-size:clamp(32px,4vw,54px);line-height:1.02;margin:0 0 20px}
  .dt-reader-text{font-family:'Lora',Georgia,serif;font-size:clamp(17px,1.5vw,21px);
  line-height:1.75;white-space:pre-wrap;color:#4a382b}.dt-reader-cover .dt-reader-title{font-size:clamp(44px,6vw,76px)}
  .dt-reader-cover .dt-reader-text{font-style:italic;color:var(--muted)}
  .dt-reader-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px}
  .dt-reader-button{background:linear-gradient(#ef876d,#df684f);color:#fff;
  box-shadow:0 10px 24px rgba(61,43,31,.18)}.dt-reader-button.secondary{background:#fff;color:var(--brown);
  border:1px solid var(--line);box-shadow:none}.dt-reader-button:disabled{opacity:.4;cursor:not-allowed}
  .dt-reader-dots{display:flex;gap:7px;justify-content:center;flex:1;flex-wrap:wrap}
  .dt-reader-dot{width:9px;height:9px;border-radius:50%;border:0;background:#d9cbb6;padding:0;cursor:pointer}
  .dt-reader-dot.active{width:24px;border-radius:10px;background:var(--teal)}
  @media(max-width:820px){.dt-reader{padding:14px}.dt-reader-topbar{align-items:flex-start;flex-wrap:wrap}
  .dt-reader-spread{grid-template-columns:1fr;min-height:0}.dt-reader-visual{padding:14px}
  .dt-reader-copy{border-left:0;border-top:1px solid var(--line);padding:26px 22px}}
  @media(max-width:560px){.dt-reader{padding:8px}.dt-reader-brand{font-size:18px}
  .dt-reader-brand img{width:38px;height:38px}.dt-reader-close{padding:9px 12px}
  .dt-reader-spread{border-radius:20px}.dt-reader-visual{padding:8px}.dt-reader-scene{border-radius:15px}
  .dt-reader-copy{padding:22px 18px}.dt-reader-actions{display:grid;grid-template-columns:1fr 1fr}
  .dt-reader-dots{grid-column:1/-1;grid-row:1}.dt-reader-button{width:100%}}`;
}

function frameHtml(book, state, labels) {
  const view = readerViewModel(book, state, labels);
  return `<style>${styles()}</style>
  <section class="dt-reader" aria-label="${escapeHtml(book.meta.title)}">
    <div class="dt-reader-shell">
      <header class="dt-reader-topbar">
        <div class="dt-reader-brand"><img src="assets/brand/dreamtaily-icon.png" alt=""><span>DreamTaily</span></div>
        <div class="dt-reader-progress" aria-live="polite">${escapeHtml(view.progress)}</div>
        <button class="dt-reader-close" type="button" data-reader-action="close">${escapeHtml(labels.close)}</button>
      </header>
      <article class="dt-reader-spread ${view.isCover ? "dt-reader-cover" : ""}">
        <div class="dt-reader-visual">${sceneHtml(view.item.scene)}</div>
        <div class="dt-reader-copy">
          <div class="dt-reader-eyebrow">${view.eyebrow}</div>
          <h1 class="dt-reader-title">${escapeHtml(view.title)}</h1>
          <div class="dt-reader-text">${escapeHtml(view.text)}</div>
        </div>
      </article>
      <nav class="dt-reader-actions" aria-label="Navigazione del libro">
        <button class="dt-reader-button secondary" type="button" data-reader-action="previous"
          ${view.canPrevious ? "" : "disabled"}>← ${escapeHtml(labels.previous)}</button>
        <div class="dt-reader-dots">
          ${state.sequence.map((_, i) => `<button class="dt-reader-dot ${i === state.index ? "active" : ""}"
            type="button" data-reader-index="${i}" aria-label="${escapeHtml(`${labels.page} ${i + 1}`)}"></button>`).join("")}
        </div>
        <button class="dt-reader-button" type="button" data-reader-action="next"
          ${view.canNext ? "" : "disabled"}>${view.isLast ? escapeHtml(labels.end) : `${escapeHtml(labels.next)} →`}</button>
      </nav>
    </div>
  </section>`;
}

export function renderBook(root, rawBook, options = {}) {
  invariant(root && typeof root.replaceChildren === "function", "A DOM root element is required.");
  const book = normalizeBook(rawBook);
  const labels = { ...DEFAULT_LABELS, ...(options.labels || {}) };
  const state = createReaderState(book, options.initialIndex || 0);
  const onClose = typeof options.onClose === "function" ? options.onClose : () => {};
  const onPageChange = typeof options.onPageChange === "function" ? options.onPageChange : () => {};

  function render() {
    root.innerHTML = frameHtml(book, state, labels);
    root.querySelector('[data-reader-action="previous"]')?.addEventListener("click", () => {
      state.previous(); render(); onPageChange(state.index, state.current);
    });
    root.querySelector('[data-reader-action="next"]')?.addEventListener("click", () => {
      if (!state.canNext) return;
      state.next(); render(); onPageChange(state.index, state.current);
    });
    root.querySelector('[data-reader-action="close"]')?.addEventListener("click", onClose);
    root.querySelectorAll("[data-reader-index]").forEach((button) => {
      button.addEventListener("click", () => {
        state.goTo(Number(button.dataset.readerIndex));
        render(); onPageChange(state.index, state.current);
      });
    });
  }

  function handleKeydown(event) {
    if (event.key === "ArrowLeft" && state.canPrevious) {
      state.previous(); render(); onPageChange(state.index, state.current);
    } else if (event.key === "ArrowRight" && state.canNext) {
      state.next(); render(); onPageChange(state.index, state.current);
    } else if (event.key === "Escape") onClose();
  }

  document.addEventListener("keydown", handleKeydown);
  render();

  return {
    state,
    next() { if (state.canNext) { state.next(); render(); } return state.current; },
    previous() { if (state.canPrevious) { state.previous(); render(); } return state.current; },
    goTo(index) { state.goTo(index); render(); return state.current; },
    destroy() { document.removeEventListener("keydown", handleKeydown); root.replaceChildren(); },
  };
}
