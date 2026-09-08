import { caricaGabbie, catalogoGabbie, gabbiaPerNome } from "./gabbie.js";
import { latoDellaGabbia, lunghezzaEditoriale } from "./selettore.js";
import { renderDoppia, stiliDoppia } from "./doppia.js";

export function inizializzaEditorGabbie(json) {
  return caricaGabbie(json);
}

function successori(step) {
  if (step?.decision?.type === "branch") return (step.decision.options || []).map((option) => option.next).filter(Boolean);
  return step?.next ? [step.next] : [];
}

function predecessori(story, key) {
  return (story?.steps || []).filter((step) => successori(step).includes(key));
}

function testoStep(contentByRef, step) {
  return contentByRef?.[step?.content_ref] ?? "";
}

function slotsScena(scenes, key) {
  return (scenes?.scenes?.[key]?.slots || []).map((slot) => slot.role).filter(Boolean);
}

function orientamenti(gabbia, precedenti) {
  const values = [{ specchiata: false, lato: latoDellaGabbia(gabbia, false) }];
  if (gabbia.specchiata) values.push({ specchiata: true, lato: latoDellaGabbia(gabbia, true) });
  return values.filter(({ lato }) => precedenti.every((step) => {
    const scelta = step.layout;
    if (!scelta?.gabbia) return true;
    const prima = gabbiaPerNome(scelta.gabbia);
    if (!prima) return true;
    const latoPrima = latoDellaGabbia(prima, scelta.specchiata === true);
    return !(lato === latoPrima && ["sinistra", "destra"].includes(lato));
  }));
}

export function modelloImpaginazione({ story, scenes, contentByRef, stepKey }) {
  const step = (story?.steps || []).find((item) => item.key === stepKey);
  if (!step) return null;
  const testo = testoStep(contentByRef, step);
  const lunghezza = lunghezzaEditoriale(testo);
  const previous = predecessori(story, step.key);
  const usedElsewhere = new Set((story.steps || []).filter((item) => item.key !== step.key).map((item) => item.layout?.gabbia).filter(Boolean));
  const sceneSlots = slotsScena(scenes, step.key);

  const gabbie = catalogoGabbie().gabbie.flatMap((gabbia) => {
    if (lunghezza > gabbia.max) return [];
    if (gabbia.famiglia === "figura" && !sceneSlots.length) return [];
    if (gabbia.nome === "Velo" && usedElsewhere.has("Velo")) return [];
    if (previous.some((item) => {
      const prior = gabbiaPerNome(item.layout?.gabbia);
      return prior?.taglio && gabbia.taglio && prior.taglio === gabbia.taglio;
    })) return [];
    const availableOrientations = orientamenti(gabbia, previous);
    return availableOrientations.length ? [{ ...gabbia, orientamenti: availableOrientations }] : [];
  });

  return { step, testo, lunghezza, sceneSlots, gabbie, scelta: step.layout || null };
}

export function validaImpaginazione({ story, scenes, contentByRef }) {
  const issues = [];
  const steps = story?.steps || [];
  const velo = steps.filter((step) => step.layout?.gabbia === "Velo");
  if (velo.length > 1) velo.slice(1).forEach((step) => issues.push({ code: "LAYOUT_VELO_DUPLICATE", step: step.key }));

  for (const step of steps) {
    const scelta = step.layout;
    if (!scelta?.gabbia) {
      issues.push({ code: "LAYOUT_REQUIRED", step: step.key });
      continue;
    }
    const gabbia = gabbiaPerNome(scelta.gabbia);
    if (!gabbia) {
      issues.push({ code: "LAYOUT_UNKNOWN", step: step.key });
      continue;
    }
    if (lunghezzaEditoriale(testoStep(contentByRef, step)) > gabbia.max) {
      issues.push({ code: "LAYOUT_TEXT_OVERFLOW", step: step.key, max: gabbia.max });
    }
    if (gabbia.famiglia === "figura") {
      const available = slotsScena(scenes, step.key);
      if (!scelta.figura_slot || !available.includes(scelta.figura_slot)) {
        issues.push({ code: "LAYOUT_FIGURE_REQUIRED", step: step.key });
      }
    }
    for (const nextKey of successori(step)) {
      const next = steps.find((item) => item.key === nextKey);
      const nextLayout = gabbiaPerNome(next?.layout?.gabbia);
      if (!nextLayout) continue;
      if (gabbia.taglio && nextLayout.taglio && gabbia.taglio === nextLayout.taglio) {
        issues.push({ code: "LAYOUT_CROP_REPEATED", step: next.key, previous: step.key });
      }
      const side = latoDellaGabbia(gabbia, scelta.specchiata === true);
      const nextSide = latoDellaGabbia(nextLayout, next.layout?.specchiata === true);
      if (side === nextSide && ["sinistra", "destra"].includes(side)) {
        issues.push({ code: "LAYOUT_SIDE_REPEATED", step: next.key, previous: step.key });
      }
    }
  }
  return issues;
}

export function anteprimaImpaginazione({ gabbia, testo, immagine, figura, specchiata }) {
  return renderDoppia({ gabbia, testo, immagine, figura, specchiata });
}

export { stiliDoppia };
