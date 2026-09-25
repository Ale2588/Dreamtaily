function parole(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean);
}

function frasi(value) {
  return String(value || "")
    .trim()
    .match(/[^.!?]+[.!?]+(?:[»”’"')\]]*)|[^.!?]+$/g)
    ?.map((item) => item.trim())
    .filter(Boolean) || [];
}

function dividiProporzionalmente(value, riquadri) {
  const items = parole(value);
  const totale = riquadri.reduce((sum, item) => sum + (item.max || 1), 0);
  const risultati = [];
  let indice = 0;
  for (let r = 0; r < riquadri.length; r += 1) {
    if (r === riquadri.length - 1) {
      risultati.push(items.slice(indice).join(" "));
      break;
    }
    const obiettivo = Math.round(value.length * ((riquadri[r].max || 1) / totale));
    const selezionate = [];
    while (indice < items.length && (selezionate.join(" ").length < obiettivo || !selezionate.length)) {
      selezionate.push(items[indice]);
      indice += 1;
    }
    risultati.push(selezionate.join(" "));
  }
  return risultati;
}

function dividiSuFrase(value, riquadri) {
  if (riquadri.length !== 2) return null;
  const items = frasi(value);
  if (items.length < 2) return null;
  const primoMax = riquadri[0].max || 0;
  const secondoMax = riquadri[1].max || 0;
  let scelta = null;
  for (let index = 1; index < items.length; index += 1) {
    const prima = items.slice(0, index).join(" ");
    const seconda = items.slice(index).join(" ");
    if (prima.length <= primoMax && seconda.length <= secondoMax) scelta = [prima, seconda];
  }
  return scelta;
}

export function dividiTestoGabbia(testo, riquadri, divisione = null) {
  const value = String(testo || "").trim();
  if (riquadri.length === 1) return [value];
  if (divisione?.regola === "confine-frase") return dividiSuFrase(value, riquadri);
  return dividiProporzionalmente(value, riquadri);
}

export function testoCompatibileConGabbia(gabbia, testo, specchiata = false) {
  const value = String(testo || "").trim();
  if (value.length > gabbia.max) return false;
  const variante = specchiata && gabbia.specchiata ? gabbia.specchiata : gabbia;
  return dividiTestoGabbia(value, variante.testo || gabbia.testo, gabbia.divisione) !== null;
}
