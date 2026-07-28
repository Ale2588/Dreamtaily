# DreamTaily — Libreria libri senza alterare il funnel

## Sovrascrivere

```text
index.html
```

Base ripristinata e verificata:

```text
eaf5192898bd961c336bf2beaa0d4ceefcf64ab3
```

Questa patch NON parte dalla versione che aveva alterato il funnel.

## Cosa cambia

Viene aggiunta esclusivamente una sezione **I tuoi libri** sopra la libreria
personaggi già esistente.

Ogni libro può essere:

- aperto o ripreso;
- modificato;
- eliminato.

## Cosa non cambia

Restano identici alla versione funzionante:

- creazione del personaggio;
- wow;
- selezione del personaggio;
- scelta della storia;
- atmosfera;
- camminata narrativa;
- scelta sentiero e aiutante;
- composizione;
- lettore;
- checkout;
- consegna;
- comportamento originale della libreria personaggi;
- pulsante landing “Riprendi il tuo libro”.

`openCharacterLibrary()` esegue prima il comportamento originale e soltanto
dopo carica la sezione libri.
