# DreamTaily — Chiusura flusso MVP reale

## File da caricare nella root della branch

```text
mvp-flow.js
story-validator.js
```

`story-validator.js` sostituisce quello esistente e conserva l'API:

```js
DreamTailyStoryValidator.validateStory(story)
```

In più carica `mvp-flow.js` dopo che `index.html` ha inizializzato stato e funzioni.

## Non modificare

```text
configuratore.html
genera-libro.html
libro.html
```

Non fanno parte del nuovo flusso. Potranno essere archiviati sotto `/reference/`
dopo il collaudo.

## Flusso risultante

```text
personaggio
→ catalogo Bosco
→ setup unico con atmosfera, sentiero, aiutante e finale
→ composeStory()
→ lettore pagina per pagina
→ checkout finto
→ consegna
→ libreria / home
```

## Cosa viene riusato

- `index.html` come unica app;
- stato e funzioni Supabase già presenti;
- `stories/il-bosco-dei-sussurri/story.json`;
- `stories/il-bosco-dei-sussurri/scene-pilot.json`;
- `src/story-composer.js`;
- `story-validator.js` come unico validatore;
- tabelle `books`, `book_stories`, `story_cast_assignments`;
- immagini salvate dei personaggi.

## Verifica manuale

1. Crea o scegli un personaggio.
2. Aggiungi il Bosco.
3. Controlla che non si apra più alcun iframe.
4. Scegli atmosfera, sentiero, aiutante compatibile e finale sulla stessa pagina.
5. Premi **Sfoglia il libro**.
6. Verifica copertina + 7 capitoli e badge `✓ testo risolto`.
7. All'ultima pagina premi **Ordina il libro**.
8. Inserisci una email valida e completa il pagamento finto.
9. Verifica consegna, link copiabile, riapertura libro e ritorno alla libreria.

## Ruvidezza nota

Gli sfondi definitivi delle scene possono non esistere ancora. Il lettore mantiene
comunque proporzioni e layer; l'assenza dello sfondo non blocca testo, navigazione
o checkout.
