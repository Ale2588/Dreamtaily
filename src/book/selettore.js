import { catalogoGabbie } from "./gabbie.js";

export const FAMIGLIE_ATTIVE = Object.freeze({ scena: true, figura: true, dissolvenza: true });

export function lunghezzaEditoriale(testo) {
  if (typeof testo === "string") return testo.length;
  if (!testo || typeof testo !== "object") return 0;
  return Math.max(0, ...Object.values(testo).filter((value) => typeof value === "string").map((value) => value.length));
}

function latoImmagine(gabbia, specchiata = false) {
  const immagini = (specchiata && gabbia.specchiata?.immagini) || gabbia.immagini || [];
  if (immagini.length !== 1) return "entrambi";
  const image = immagini[0];
  if (image.x < 620 && image.x + image.w <= 620) return "sinistra";
  if (image.x >= 620) return "destra";
  return "entrambi";
}

export function gabbieDisponibili(testo, contesto = {}) {
  const { gabbie } = catalogoGabbie();
  const lunghezza = lunghezzaEditoriale(testo);
  const famiglie = { ...FAMIGLIE_ATTIVE, ...(contesto.famiglieAttive || {}) };
  const precedente = typeof contesto.gabbiaPrecedente === "string"
    ? gabbie.find((item) => item.nome === contesto.gabbiaPrecedente)
    : contesto.gabbiaPrecedente;
  const usate = new Set(contesto.gabbieUsate || []);

  return gabbie
    .filter((gabbia) => lunghezza <= gabbia.max)
    .filter((gabbia) => famiglie[gabbia.famiglia] !== false)
    .filter((gabbia) => !(gabbia.nome === "Panoramica" && contesto.voltoInPiega === true))
    .filter((gabbia) => !(gabbia.nome === "Velo" && usate.has("Velo")))
    .filter((gabbia) => !(precedente?.taglio && gabbia.taglio && precedente.taglio === gabbia.taglio))
    .filter((gabbia) => variantiAmmissibili(gabbia, contesto.latoPrecedente).length > 0)
    .map((gabbia) => gabbia.nome);
}

function variantiAmmissibili(gabbia, latoPrecedente) {
  const varianti = [{ specchiata: false, lato: latoImmagine(gabbia, false) }];
  if (gabbia.specchiata) varianti.push({ specchiata: true, lato: latoImmagine(gabbia, true) });
  return varianti.filter(({ lato }) =>
    !(lato === latoPrecedente && ["sinistra", "destra"].includes(lato))
  );
}

export function orientamentiDisponibili(gabbia, contesto = {}) {
  return variantiAmmissibili(gabbia, contesto.latoPrecedente);
}

export function latoDellaGabbia(gabbia, specchiata = false) {
  return latoImmagine(gabbia, specchiata);
}
