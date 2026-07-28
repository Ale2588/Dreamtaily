# DreamTaily — Fix definitivo percorso dai personaggi

## Sovrascrivere

```text
index.html
```

Base verificata:

```text
6345e56a95cb6a879e1e24585e60bfd8b5d62a21
```

## Causa reale

Quando si selezionava un personaggio salvato, rimanevano attivi:

```text
app.bookId
app.bookStories
```

Se il libro corrente conteneva già il Bosco, la schermata storie lo considerava
già aggiunto e mostrava la vecchia modalità “Vai al mio libro”.

## Correzione

`useSavedCharacter()` ora pulisce soltanto il contesto attivo del funnel:

```text
bookId, bookStories, activeStoryDefinition, scelte e posizione
```

I libri esistenti non vengono eliminati dal database e restano nella libreria.

Il percorso diventa:

```text
personaggio salvato
→ catalogo Bosco selezionabile
→ nuovo draft
→ screen-setup
→ screen-composer
→ screen-book
```
