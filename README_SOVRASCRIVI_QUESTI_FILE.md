# DreamTaily — Integrazione reale nel file index della branch

Questi file sono stati costruiti partendo dall'`index.html` della branch con blob SHA:

```text
edbf73b103945997ae89a8cdbd6d099f18e31a48
```

## Caricamento

Sovrascrivere nella root del repository:

```text
index.html
configuratore.html
```

Non è necessario eseguire script.

## Cosa cambia davvero

Dopo:

```text
Aggiungi questa storia al libro
```

il flusso principale apre il nuovo configuratore a schermo intero.

Il flusso precedente di creazione personaggio, Supabase, `books`,
`book_stories` e assegnazione protagonista resta nel file.

## Persistenza

```text
atmosfera + bivi → book_stories.path_choices
compagno          → story_cast_assignments / helper
```

## Test minimo

```text
[ ] Aprire index.html, non configuratore.html direttamente
[ ] Creare o selezionare un personaggio
[ ] Scegliere Il bosco dei sussurri
[ ] Premere Aggiungi questa storia al libro
[ ] Verificare che si apra la UI crema/teal del nuovo configuratore
[ ] Scegliere compagno, atmosfera e bivi
[ ] Premere Chiudi
[ ] Verificare il ritorno al riepilogo libro
```
