# DreamTaily — Contratto scene del Bosco

**Stato:** prima estensione dati, senza asset definitivi.

## Decisioni chiuse

- `scene-pilot.json` resta separato da `story.json` in questa fase.
- Contiene 10 scene narrative e una copertina separata.
- Gli ID scena coincidono con gli step della storia.
- Il protagonista utente usa sempre `in_piedi`.
- Le coordinate sono normalizzate 0–1.
- `x` e `y` indicano il punto di ancoraggio ai piedi, al centro.
- `scale` indica l'altezza del personaggio come frazione dell'altezza scena.
- I percorsi immagine sono relativi alla cartella della storia.
- Le varianti atmosfera sono dichiarate soltanto per le sei scene già varianti nel testo:
  `s1`, `s2`, `s4`, `s5`, `s6_promessa`, `s6_festa`.
- Le comparse del finale festa restano incorporate nello sfondo per l'MVP.

## Inventario

```text
Copertina:
cover

Scene narrative:
s1
s2
s3_felci
s3_ruscello
s4_felci
s4_ruscello
s4
s5
s6_promessa
s6_festa
```

## Totale sfondi previsto

```text
1 copertina
10 sfondi base
12 varianti atmosfera
= 23 file
```

Il precedente riferimento a circa 22 sfondi escludeva implicitamente la copertina.

## Nota importante

I riferimenti puntano ad asset futuri sotto `scenes/`. La loro assenza non è un errore
in questa fase: il file è il contratto di autoraggio che precede la produzione grafica.
