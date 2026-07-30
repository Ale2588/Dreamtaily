# DreamTaily — Lettore del libro

## File da caricare

```text
src/book-reader.js
tests/book-reader.test.mjs
demo/book-reader-demo.html
package.json
```

`package.json` sostituisce quello attuale e conserva gli script del compositore.

## Contratto

```js
renderBook(root, book, options) → controller
```

Il lettore riceve solo l'oggetto `book` prodotto dal compositore. Non legge
`story.json`, `scene-pilot.json`, Supabase o le scelte del configuratore.

## Funzioni esportate

```text
buildReaderSequence(book)
createReaderState(book, initialIndex)
readerViewModel(book, state, labels)
renderBook(root, book, options)
```

## Supporta

- copertina;
- spread testuali e illustrate;
- layer con coordinate normalizzate;
- pulsanti, indicatori e tastiera;
- frecce sinistra/destra;
- `Esc` per chiudere;
- desktop, tablet e mobile;
- placeholder quando uno sfondo non esiste ancora.

## Test

```bash
npm run test:reader
npm test
```

## Demo

```bash
python -m http.server 8000
```

Aprire:

```text
http://localhost:8000/demo/book-reader-demo.html
```

Il passo seguente è collegare `composeStory()` e `renderBook()` dentro
`configuratore.html`.
