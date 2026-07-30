# DreamTaily — Fix libri finali e ripresa del giro

## Sovrascrivere

```text
index.html
```

Base verificata:

```text
11a9e22e6ff8de0a8978524522938bcb852e8aae
```

## Problema corretto

Il checkout cambiava lo stato del libro da `draft` a `ready`, ma la landing
cercava esclusivamente i libri `draft`. Di conseguenza il libro finale spariva.

Inoltre il lettore viveva solo in memoria: dopo un refresh, le scelte erano
salvate ma l'oggetto `book` non veniva ricostruito.

## Nuovo comportamento

- la landing cerca sia `draft` sia `ready`;
- per un libro pronto mostra **Apri il tuo libro →**;
- la riapertura carica `book_stories`, assegnazioni e scelte da Supabase;
- ricostruisce deterministicamente il `book`;
- apre direttamente il lettore;
- se le scelte sono incomplete torna al setup, senza pagina vuota;
- `Vai al mio libro` funziona anche dopo un refresh;
- il giro checkout → consegna → libreria → libro resta percorribile.

## Collaudo

1. Completa il libro e il checkout.
2. Torna alla home.
3. Verifica **Apri il tuo libro →**.
4. Apri il libro.
5. Ricarica la pagina.
6. Premi di nuovo **Apri il tuo libro →**.
7. Verifica che copertina, pagine e scelte siano ricostruite.
