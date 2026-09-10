/*
 * DreamTaily — validatore del catalogo di copertina
 * Nessuna dipendenza. Funziona in Node e nel browser.
 *
 *   Node:     node valida-gabbie.js gabbie-copertina.json
 *   Browser:  validaGabbie.valida(catalogo)  ->  { ok, errori, avvisi, controlli, perGabbia }
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.validaGabbie = factory();
})(typeof self !== "undefined" ? self : this, function () {

  var AREE_SINGOLE = ["image_area", "title_area", "subtitle_area", "description_area", "brand_area", "technical_area", "panel_area"];
  var AREE_TIPOGRAFICHE = ["title_area", "subtitle_area", "description_area", "brand_area", "technical_area", "panel_area"];
  var AREE_TESTO = ["title_area", "subtitle_area", "description_area", "brand_area", "technical_area"];

  function rect(a) { return a && typeof a.x === "number" && typeof a.y === "number" && typeof a.w === "number" && typeof a.h === "number"; }
  function dentro(a, box) {
    return a.x >= box.x && a.y >= box.y && a.x + a.w <= box.x + box.w && a.y + a.h <= box.y + box.h;
  }
  function sovrapposizione(a, b) {
    var x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    var y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    return x * y;
  }
  function fmt(a) { return "[" + a.x + "," + a.y + " " + a.w + "×" + a.h + "] fino a x=" + (a.x + a.w) + " y=" + (a.y + a.h); }

  function valida(cat) {
    var errori = [], avvisi = [], controlli = 0, perGabbia = {};
    var m = (cat && cat.sistema_di_misura) || {};
    var W = m.larghezza || 620, H = m.altezza || 465;
    var formatoBox = { x: 0, y: 0, w: W, h: H };
    var safe = m.safe_box || { x: 26, y: 26, w: W - 52, h: H - 52 };
    var bleed = m.bleed_box || { x: -12, y: -12, w: W + 24, h: H + 24 };
    var obbligatori = cat.campi_obbligatori || [];
    var gabbie = (cat && cat.gabbie) || [];

    // 5 · conteggio per tipo
    controlli++;
    var front = gabbie.filter(function (g) { return g.tipo === "front"; }).length;
    var back = gabbie.filter(function (g) { return g.tipo === "back"; }).length;
    if (front !== 3) errori.push("catalogo: attese 3 gabbie front, trovate " + front);
    if (back !== 2) errori.push("catalogo: attese 2 gabbie back, trovate " + back);
    var altri = gabbie.filter(function (g) { return g.tipo !== "front" && g.tipo !== "back"; });
    altri.forEach(function (g) { errori.push((g.nome || "?") + ": tipo non ammesso «" + g.tipo + "» (solo front o back; il dorso non fa parte del catalogo)"); });

    gabbie.forEach(function (g) {
      var e = [];

      // 4 · campi obbligatori presenti (il valore può essere null, la chiave no)
      obbligatori.forEach(function (k) {
        controlli++;
        if (!(k in g)) e.push("campo obbligatorio mancante: " + k);
      });

      // formato dichiarato
      controlli++;
      if (!g.formato || g.formato.larghezza !== W || g.formato.altezza !== H) {
        e.push("formato non conforme: atteso " + W + " × " + H);
      }

      // 1 · ogni rettangolo entro il formato
      var tutte = [];
      AREE_SINGOLE.forEach(function (k) { if (g[k]) tutte.push([k, g[k]]); });
      ["safe_zones", "subject_zones", "avoid_zones"].forEach(function (k) {
        (g[k] || []).forEach(function (z, i) { tutte.push([k + "[" + i + "]", z]); });
      });
      (g.veil || []).forEach(function (v, i) { if (v && v.copre) tutte.push(["veil[" + i + "].copre", v.copre]); });

      tutte.forEach(function (p) {
        controlli++;
        if (!rect(p[1])) { e.push(p[0] + ": rettangolo malformato"); return; }
        if (!dentro(p[1], formatoBox)) e.push(p[0] + " esce dal formato " + W + " × " + H + ": " + fmt(p[1]));
      });

      // 2 · aree tipografiche essenziali entro il margine di sicurezza
      AREE_TIPOGRAFICHE.forEach(function (k) {
        if (!g[k] || !rect(g[k])) return;
        controlli++;
        if (!dentro(g[k], safe)) {
          e.push(k + " esce dal margine di sicurezza (x " + safe.x + "–" + (safe.x + safe.w) + ", y " + safe.y + "–" + (safe.y + safe.h) + "): " + fmt(g[k]));
        }
      });

      // 3 · sovrapposizioni incompatibili fra aree di testo e subject zone
      (g.subject_zones || []).forEach(function (z, i) {
        if (!rect(z)) return;
        controlli++;
        if (!dentro(z, safe)) {
          e.push("subject_zones[" + i + "] (dettagli essenziali) esce dalla zona sicura: " + fmt(z));
        }
        if (z.estensione_ammessa) {
          controlli++;
          if (!rect(z.estensione_ammessa)) e.push("subject_zones[" + i + "].estensione_ammessa: rettangolo malformato");
          else {
            if (!dentro(z.estensione_ammessa, bleed)) e.push("subject_zones[" + i + "].estensione_ammessa esce dall'abbondanza: " + fmt(z.estensione_ammessa));
            if (sovrapposizione(z, z.estensione_ammessa) < z.w * z.h - 0.5) e.push("subject_zones[" + i + "].estensione_ammessa non contiene la zona essenziale");
          }
        }
        AREE_TESTO.forEach(function (k) {
          if (!g[k] || !rect(g[k])) return;
          controlli++;
          var s = sovrapposizione(g[k], z);
          if (s > 0) e.push(k + " si sovrappone a subject_zones[" + i + "] per " + Math.round(s) + " punti²: " + fmt(g[k]) + " vs " + fmt(z));
        });
      });

      // coerenza pannello / marchio
      if (g.panel_area && g.panel_area.contiene) {
        g.panel_area.contiene.forEach(function (k) {
          controlli++;
          if (!g[k] || !rect(g[k])) { e.push("panel_area dichiara di contenere " + k + ", che non esiste"); return; }
          if (!dentro(g[k], g.panel_area)) e.push("panel_area dichiara di contenere " + k + " ma non lo copre: pannello " + fmt(g.panel_area) + " vs " + k + " " + fmt(g[k]));
        });
      }

      // coerenza tipo / aree
      controlli++;
      if (g.tipo === "front" && (!g.title_area || !g.brand_area)) e.push("gabbia front senza title_area o brand_area");
      controlli++;
      if (g.tipo === "back" && !g.description_area) e.push("gabbia back senza description_area");
      controlli++;
      if (g.tipo === "front" && g.brand_area && g.brand_area.facoltativo === true) e.push("il marchio non è facoltativo in copertina frontale");

      // avvisi: contenuti di esempio entro i tetti
      if (g.esempio) {
        [["titolo", "max_title"], ["sottotitolo", "max_subtitle"], ["descrizione", "max_description"]].forEach(function (p) {
          var t = g.esempio[p[0]], max = g[p[1]];
          if (typeof t === "string" && typeof max === "number" && t.length > max) {
            avvisi.push(g.nome + ": esempio." + p[0] + " è " + t.length + " caratteri, tetto " + max);
          }
        });
      }
      if (g.tipo === "back" && !g.technical_area) avvisi.push(g.nome + ": nessuna area tecnica riservata");

      perGabbia[g.nome] = e;
      e.forEach(function (msg) { errori.push(g.nome + ": " + msg); });
    });

    return { ok: errori.length === 0, errori: errori, avvisi: avvisi, controlli: controlli, perGabbia: perGabbia };
  }

  function report(r) {
    var out = [];
    out.push(r.ok ? "OK — " + r.controlli + " controlli superati, 0 errori" : "FALLITO — " + r.errori.length + " errori su " + r.controlli + " controlli");
    r.errori.forEach(function (m) { out.push("  ✗ " + m); });
    r.avvisi.forEach(function (m) { out.push("  ! " + m); });
    return out.join("\n");
  }

  return { valida: valida, report: report, utils: { dentro: dentro, sovrapposizione: sovrapposizione } };
});

if (typeof require === "function" && typeof module === "object" && require.main === module) {
  var fs = require("fs");
  var file = process.argv[2] || "gabbie-copertina.json";
  var r = module.exports.valida(JSON.parse(fs.readFileSync(file, "utf8")));
  console.log(module.exports.report(r));
  process.exit(r.ok ? 0 : 1);
}
