# DreamTaily — Fix atmosfera dentro il libro

## Sovrascrivere

```text
index.html
```

Base verificata:

```text
1d5063f5ac8c65efaceb417b3c3ca71dd68948b7
```

## Problema corretto

La scelta atmosfera caricava correttamente le immagini del setup. Il libro
provava invece a caricare varianti scena mancanti e, al 404, eliminava lo
sfondo con `this.remove()`.

## Nuovo comportamento

```text
sfondo variante scena
→ se manca, immagine atmosfera scelta
→ se anche il fallback manca, rimuove lo sfondo e registra l'errore
```

Il fallback vale sia nell'anteprima narrativa sia nel lettore.

## Test

1. Scegli Di notte.
2. Completa il percorso e apri il libro.
3. Verifica lo sfondo notturno.
4. Torna a Modifica, scegli Al tramonto e ricomponi.
5. Verifica lo sfondo al tramonto.
