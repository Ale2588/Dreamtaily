import { caricaGabbie, gabbiaPerNome } from "./gabbie.js";
import { renderDoppia, stiliDoppia } from "./doppia.js";

let inizializzato = false;

export function inizializzaRendererGabbie(json) {
  caricaGabbie(json);
  inizializzato = true;
}

export function applicaLayoutAlLibro(book, story) {
  const layouts = new Map((story?.steps || []).map((step) => [step.key, step.layout || null]));
  return {
    ...book,
    pages: (book?.pages || []).map((page) => ({
      ...page,
      layout: structuredClone(layouts.get(page.step_key) || null),
    })),
  };
}

export function renderPaginaImpaginata(page) {
  if (!page?.layout?.gabbia) return null;
  if (!inizializzato) throw new Error("GABBIE_CATALOGO_NON_CARICATO");
  const gabbia = gabbiaPerNome(page.layout.gabbia);
  if (!gabbia) throw new Error(`GABBIA_SCONOSCIUTA:${page.layout.gabbia}`);
  const livelli = page.scene?.layers || [];
  const figura = livelli.find((layer) => layer.role === page.layout.figura_slot)?.src || null;
  return renderDoppia({
    gabbia,
    immagine: page.scene?.bg || null,
    testo: page.text || "",
    figura,
    livelli,
    specchiata: page.layout.specchiata === true,
  });
}

export { stiliDoppia };
