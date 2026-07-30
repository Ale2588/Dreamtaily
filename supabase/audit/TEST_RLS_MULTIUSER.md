# Test RLS multiutente

## Obiettivo

Dimostrare che due utenti anonimi distinti non possono leggere o modificare reciprocamente:

- personaggi;
- riferimenti personaggio;
- libri;
- storie del libro;
- assegnazioni del cast.

## Procedura

1. Apri il sito nel browser A.
2. Crea il personaggio A e un libro A.
3. Apri il sito nel browser B, usando un profilo browser diverso o una finestra realmente isolata.
4. Crea il personaggio B e un libro B.
5. Nel browser A verifica che non compaiano dati di B.
6. Nel browser B verifica che non compaiano dati di A.
7. Prova a riaprire entrambi dopo refresh.
8. Controlla dal frontend che ciascun profilo continui a vedere solo i propri dati.

## Esito

```text
[ ] Browser A vede solo A
[ ] Browser B vede solo B
[ ] Refresh non mescola i dati
[ ] Le storie mantengono il proprio protagonista
[ ] Nessun errore RLS inatteso in console
```

## Nota

Il test UI dimostra isolamento funzionale, ma non sostituisce il controllo delle policy nel file `verify_schema.sql`.
