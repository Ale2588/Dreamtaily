const WIDTH = 1240;
const HEIGHT = 465;

let catalogo = null;

function numeroFinito(value, label) {
  if (!Number.isFinite(value)) throw new Error(`GABBIE_COORDINATA_NON_VALIDA:${label}`);
}

function validaRiquadro(riquadro, label) {
  for (const key of ["x", "y", "w", "h"]) numeroFinito(riquadro?.[key], `${label}.${key}`);
  if (riquadro.x < 0 || riquadro.y < 0 || riquadro.w <= 0 || riquadro.h <= 0 ||
      riquadro.x + riquadro.w > WIDTH || riquadro.y + riquadro.h > HEIGHT) {
    throw new Error(`GABBIE_RIQUADRO_FUORI_FORMATO:${label}`);
  }
}

function intersecaPiega(riquadro, banda) {
  return riquadro.x < banda.x + banda.w && riquadro.x + riquadro.w > banda.x;
}

function chiaveRiquadro(riquadro) {
  return [riquadro.x, riquadro.y, riquadro.w, riquadro.h].join(":");
}

function validaSpecchiatura(base, specchiata, label) {
  if (!specchiata) return;
  for (const tipo of ["immagini", "testo"]) {
    const originali = base[tipo] || [];
    const varianti = specchiata[tipo] || [];
    if (originali.length !== varianti.length) throw new Error(`GABBIE_SPECCHIATURA_CONTEGGIO:${label}:${tipo}`);
    const attese = originali.map((item) => chiaveRiquadro({ ...item, x: WIDTH - item.x - item.w })).sort();
    const ricevute = varianti.map(chiaveRiquadro).sort();
    if (attese.join("|") !== ricevute.join("|")) throw new Error(`GABBIE_SPECCHIATURA_NON_SIMMETRICA:${label}:${tipo}`);
  }
}

export function caricaGabbie(json) {
  const value = typeof json === "string" ? JSON.parse(json) : structuredClone(json);
  if (!value || !Array.isArray(value.gabbie) || !value.tagli || !value.tipografia || !value.formato || !value.colori) {
    throw new Error("GABBIE_CATALOGO_NON_VALIDO");
  }

  const nomi = new Set();
  const bandaPiega = value.formato.bandaPiega || { x: 592, w: 56 };
  for (const gabbia of value.gabbie) {
    for (const key of ["nome", "famiglia", "max", "registro"]) {
      if (gabbia?.[key] == null || gabbia[key] === "") throw new Error(`GABBIE_CAMPO_MANCANTE:${key}`);
    }
    if (!Array.isArray(gabbia.testo) || !gabbia.testo.length) {
      throw new Error(`GABBIE_TESTO_MANCANTE:${gabbia.nome}`);
    }
    if (nomi.has(gabbia.nome)) throw new Error(`GABBIE_NOME_DUPLICATO:${gabbia.nome}`);
    nomi.add(gabbia.nome);
    if (gabbia.taglio && !value.tagli[gabbia.taglio]) {
      throw new Error(`GABBIE_TAGLIO_SCONOSCIUTO:${gabbia.nome}:${gabbia.taglio}`);
    }
    gabbia.testo.forEach((item, index) => validaRiquadro(item, `${gabbia.nome}.testo.${index}`));
    gabbia.immagini?.forEach((item, index) => validaRiquadro(item, `${gabbia.nome}.immagini.${index}`));
    if (gabbia.pannello) validaRiquadro(gabbia.pannello, `${gabbia.nome}.pannello`);
    gabbia.specchiata?.testo?.forEach((item, index) =>
      validaRiquadro(item, `${gabbia.nome}.specchiata.testo.${index}`));
    gabbia.specchiata?.immagini?.forEach((item, index) =>
      validaRiquadro(item, `${gabbia.nome}.specchiata.immagini.${index}`));
    if (gabbia.specchiata?.pannello) validaRiquadro(gabbia.specchiata.pannello, `${gabbia.nome}.specchiata.pannello`);
    for (const item of [...gabbia.testo, ...(gabbia.specchiata?.testo || [])]) {
      if (intersecaPiega(item, bandaPiega)) throw new Error(`GABBIE_TESTO_IN_PIEGA:${gabbia.nome}`);
    }
    validaSpecchiatura(gabbia, gabbia.specchiata, gabbia.nome);
  }

  catalogo = value;
  return catalogo;
}

export function gabbiaPerNome(nome) {
  if (!catalogo) throw new Error("GABBIE_CATALOGO_NON_CARICATO");
  return catalogo.gabbie.find((item) => item.nome === nome) || null;
}

export function catalogoGabbie() {
  if (!catalogo) throw new Error("GABBIE_CATALOGO_NON_CARICATO");
  return catalogo;
}
