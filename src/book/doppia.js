function percent(value, total) {
  return `${(value / total) * 100}%`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dividiTesto(testo, riquadri) {
  const value = String(testo || "").trim();
  if (riquadri.length === 1) return [value];
  const parole = value.split(/\s+/).filter(Boolean);
  const totale = riquadri.reduce((sum, item) => sum + (item.max || 1), 0);
  const risultati = [];
  let indice = 0;
  for (let r = 0; r < riquadri.length; r += 1) {
    if (r === riquadri.length - 1) {
      risultati.push(parole.slice(indice).join(" "));
      break;
    }
    const obiettivo = Math.round(value.length * ((riquadri[r].max || 1) / totale));
    const selezionate = [];
    while (indice < parole.length && (selezionate.join(" ").length < obiettivo || !selezionate.length)) {
      selezionate.push(parole[indice]);
      indice += 1;
    }
    risultati.push(selezionate.join(" "));
  }
  return risultati;
}

function geometria(item) {
  return `left:${percent(item.x, 1240)};top:${percent(item.y, 465)};width:${percent(item.w, 1240)};height:${percent(item.h, 465)}`;
}

export function renderDoppia({ gabbia, immagine, testo, figura = null, specchiata = false }) {
  if (!gabbia?.nome) throw new Error("GABBIA_RICHIESTA");
  if (String(testo || "").length > gabbia.max) throw new Error(`TESTO_TROPPO_LUNGO:${gabbia.nome}`);
  const variante = specchiata && gabbia.specchiata ? gabbia.specchiata : gabbia;
  const immagini = variante.immagini || gabbia.immagini || [];
  const testi = variante.testo || gabbia.testo;
  const parti = dividiTesto(testo, testi);

  const immaginiHtml = immagini.map((item, index) => {
    const source = item.asset === "figura" ? figura : immagine;
    if (!source) throw new Error(`ASSET_MANCANTE:${gabbia.nome}:${item.asset || "scena"}`);
    const mask = item.mask ? `;mask-image:${item.mask};-webkit-mask-image:${item.mask}` : "";
    const mirror = item.specchiata ? ";transform:scaleX(-1)" : "";
    return `<img class="dtb-immagine dtb-immagine-${index + 1}" src="${escapeHtml(source)}" alt="" style="${geometria(item)};object-position:${escapeHtml(item.position || "center")}${mask}${mirror}">`;
  }).join("");

  const testoHtml = testi.map((item, index) =>
    `<div class="dtb-testo dtb-testo-${index + 1}" style="${geometria(item)};font-size:${item.fontSize / 12.4}cqw;line-height:${item.lineHeight}"><p>${escapeHtml(parti[index] || "")}</p></div>`
  ).join("");

  return `<section class="dtb-doppia dtb-${escapeHtml(gabbia.nome.toLowerCase())}" data-gabbia="${escapeHtml(gabbia.nome)}" style="container-type:inline-size;position:relative;aspect-ratio:1240 / 465;overflow:hidden;background:#fdf5e6;color:#22321f">${immaginiHtml}${testoHtml}</section>`;
}

export const stiliDoppia = `
.dtb-doppia{font-family:Faustina,Georgia,serif}
.dtb-immagine{position:absolute;display:block;object-fit:cover;border:0;border-radius:0;box-shadow:none}
.dtb-testo{position:absolute;display:flex;align-items:flex-start}
.dtb-testo p{margin:0;white-space:pre-wrap}
`;
