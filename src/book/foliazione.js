export function costruisciLibro({ storie = [], gabbieScelte = {}, copertina = null, quarta = null }) {
  const pagine = [{ tipo: "copertina", contenuto: copertina }, { tipo: "bianca" }];

  for (const storia of storie) {
    pagine.push({ tipo: "frontespizio", storia: storia.slug || storia.id || null, titolo: storia.title || storia.titolo || "" });
    for (const step of storia.pages || storia.pagine || []) {
      const scelta = gabbieScelte[step.key] || step.layout || {};
      pagine.push({
        tipo: "doppia",
        storia: storia.slug || storia.id || null,
        step: step.key,
        testo: step.text ?? step.testo ?? "",
        immagine: step.image ?? step.immagine ?? null,
        gabbia: scelta.gabbia || scelta.nome || null,
        specchiata: scelta.specchiata === true,
        figuraSlot: scelta.figuraSlot || null,
      });
    }
  }

  pagine.push({ tipo: "bianca" }, { tipo: "bianca" }, { tipo: "quarta", contenuto: quarta });
  const facciate = pagine.reduce((totale, pagina) => totale + (pagina.tipo === "doppia" ? 2 : 1), 0);
  Object.defineProperty(pagine, "totaleFacciate", { value: facciate, enumerable: false });
  return pagine;
}
