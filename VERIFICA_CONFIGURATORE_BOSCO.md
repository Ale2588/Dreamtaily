# Verifica e correzioni — configuratore del Bosco

## Verifica del branch

Controllato il file `configuratore.html` pubblicato sul branch
`git-checkout--b-Phase-3-story-cast-foundation`.

Gli asset referenziati esistono:

```text
assets/char/crayon/fox.png
assets/char/water/rabbit.png
assets/char/water/bear.png
assets/char/paper/rabbit.png
stories/il-bosco-dei-sussurri/setup/atmosfera_notte.png
stories/il-bosco-dei-sussurri/setup/atmosfera_tramonto.png
```

## Problemi corretti

- il compagno era obbligatorio nei dati ma mostrato come facoltativo;
- il sentiero non cambiava l'anteprima live;
- cambiando protagonista poteva restare lo stesso personaggio come aiutante;
- prima della scelta dell'aiutante compariva `[Aiutante]`;
- tutte le pagine sembravano uguali perché usavano lo stesso identico sfondo e inquadratura;
- titolo e commenti indicavano ancora reference/demo;
- nessun errore visibile quando un asset non viene caricato.

## Differenziazione temporanea delle scene

Non esistono ancora sfondi d'autore separati per ogni capitolo.

Il fix non inventa asset. Usa le due immagini reali notte/tramonto con:

- ritagli diversi;
- zoom diversi;
- trattamenti leggeri coerenti con il capitolo;
- posizioni diverse dei personaggi;
- etichetta `scena temporanea`.

Questa soluzione serve solo a verificare il giro UX. Andrà sostituita dagli sfondi scena definitivi.

## Test richiesto

```text
[ ] Tramonto e notte sono chiaramente diversi
[ ] Felci e ruscello cambiano subito l'anteprima
[ ] Le pagine hanno inquadrature distinguibili
[ ] Protagonista e aiutante non possono essere lo stesso personaggio
[ ] Il compagno appare come obbligatorio
[ ] Nessun marcatore grezzo prima del reader
[ ] Nessun 404 silenzioso sulle immagini
[ ] Checkout e consegna simulata funzionano
```
