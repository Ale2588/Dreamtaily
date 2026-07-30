# DreamTaily — integrazione reale compose → read

## Sovrascrivere

```text
configuratore.html
```

I moduli seguenti devono essere già presenti nella branch:

```text
src/story-composer.js
src/book-reader.js
stories/il-bosco-dei-sussurri/story.json
stories/il-bosco-dei-sussurri/scene-pilot.json
```

## Nuovo comportamento

Il pulsante **Sfoglia il libro** ora:

```text
1. raccoglie le scelte correnti
2. carica story.json e scene-pilot.json
3. carica capitoli, varianti ed entrate
4. chiama composeStory(...)
5. passa il book a renderBook(...)
6. apre il lettore a schermo intero
```

**Chiudi il libro** torna al configuratore senza perdere le scelte.

## Nota asset

Gli sfondi sotto `stories/il-bosco-dei-sussurri/scenes/` non sono ancora
stati prodotti. Finché mancano, il lettore può mostrare lo spazio scena senza
l'illustrazione definitiva. Il testo completo e i personaggi vengono comunque
composti dal flusso reale.

## Verifica

```text
[ ] completa protagonista, compagno, atmosfera e bivi
[ ] premi “Sfoglia il libro”
[ ] compare “Sto componendo il libro…”
[ ] si apre la copertina del lettore
[ ] avanti/indietro funzionano
[ ] “Chiudi il libro” torna alle scelte
```
