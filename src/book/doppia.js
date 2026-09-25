import { dividiTestoGabbia } from "./testo-gabbia.js";

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

function geometria(item) {
  return `left:${percent(item.x, 1240)};top:${percent(item.y, 465)};width:${percent(item.w, 1240)};height:${percent(item.h, 465)}`;
}

function livelliScenaHtml(livelli, riquadro) {
  return (livelli || []).map((livello, index) => {
    if (!livello?.src) return "";
    const left = (livello.x ?? 0.5) * 100;
    const top = (livello.y ?? 1) * 100;
    const height = (livello.scale ?? 0.5) * 100;
    return `<img class="dtb-livello dtb-livello-${index + 1}" src="${escapeHtml(livello.src)}" alt="" style="left:${left}%;top:${top}%;height:${height}%;z-index:${Number(livello.z ?? index) + 2}">`;
  }).join("");
}

export function renderDoppia({ gabbia, immagine, testo, figura = null, livelli = [], specchiata = false }) {
  if (!gabbia?.nome) throw new Error("GABBIA_RICHIESTA");
  if (String(testo || "").length > gabbia.max) throw new Error(`TESTO_TROPPO_LUNGO:${gabbia.nome}`);
  const variante = specchiata && gabbia.specchiata ? gabbia.specchiata : gabbia;
  const immagini = variante.immagini || gabbia.immagini || [];
  const testi = variante.testo || gabbia.testo;
  const parti = dividiTestoGabbia(testo, testi, gabbia.divisione);
  if (!parti) throw new Error(`TESTO_NON_DIVISIBILE:${gabbia.nome}`);

  const immaginiHtml = immagini.map((item, index) => {
    const source = item.asset === "figura" ? figura : immagine;
    if (!source) throw new Error(`ASSET_MANCANTE:${gabbia.nome}:${item.asset || "scena"}`);
    const mask = item.mask ? `;mask-image:${item.mask};-webkit-mask-image:${item.mask}` : "";
    const mirror = item.specchiata ? ";transform:scaleX(-1)" : "";
    if (item.asset === "figura") {
      return `<img class="dtb-immagine dtb-immagine-${index + 1}" src="${escapeHtml(source)}" alt="" style="${geometria(item)};object-position:${escapeHtml(item.position || "center")}${mask}${mirror}">`;
    }
    return `<div class="dtb-scena dtb-immagine-${index + 1}" style="${geometria(item)}${mask}${mirror}"><img class="dtb-scena-sfondo" src="${escapeHtml(source)}" alt="" style="object-position:${escapeHtml(item.position || "center")}">${livelliScenaHtml(livelli, item)}</div>`;
  }).join("");

  const pannello = variante.pannello || gabbia.pannello;
  const pannelloHtml = pannello
    ? `<div class="dtb-pannello" aria-hidden="true" style="${geometria(pannello)}"></div>`
    : "";

  const testoHtml = testi.map((item, index) =>
    `<div class="dtb-testo dtb-testo-${index + 1}" style="${geometria(item)};font-size:${item.fontSize / 12.4}cqw;line-height:${item.lineHeight}"><p>${escapeHtml(parti[index] || "")}</p></div>`
  ).join("");

  return `<section class="dtb-doppia dtb-${escapeHtml(gabbia.nome.toLowerCase())}" data-gabbia="${escapeHtml(gabbia.nome)}" style="container-type:inline-size;position:relative;aspect-ratio:1240 / 465;overflow:hidden;background:#fdf5e6;color:#22321f">${immaginiHtml}${pannelloHtml}${testoHtml}</section>`;
}

export const stiliDoppia = `
.dtb-doppia{font-family:Faustina,Georgia,serif}
.dtb-immagine{position:absolute;display:block;object-fit:cover;border:0;border-radius:0;box-shadow:none}
.dtb-scena{position:absolute;overflow:hidden}
.dtb-scena-sfondo{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;border:0;border-radius:0;box-shadow:none}
.dtb-livello{position:absolute;display:block;width:auto;object-fit:contain;transform:translate(-50%,-100%);filter:drop-shadow(0 10px 12px rgba(0,0,0,.2))}
.dtb-pannello{position:absolute;z-index:3;background:rgba(253,245,230,.94)}
.dtb-testo{position:absolute;z-index:4;display:flex;align-items:flex-start}
.dtb-testo p{margin:0;white-space:pre-wrap}
`;
