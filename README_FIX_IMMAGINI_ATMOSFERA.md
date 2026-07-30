# Fix definitivo immagini atmosfera

Sovrascrivere:

```text
index.html
```

Base verificata:

```text
b23b8035c608f8c0a8fea7c4b01133786ec6582d
```

Il fix:

- accetta sia path relativi sia path già completi;
- usa direttamente i due percorsi canonici:
  - `stories/il-bosco-dei-sussurri/setup/atmosfera_notte.png`
  - `stories/il-bosco-dei-sussurri/setup/atmosfera_tramonto.png`
- aggiunge un parametro di versione per evitare cache vecchie;
- non elimina più silenziosamente la carta al primo errore;
- prova un fallback e scrive l'URL fallito nella console.

Dopo il caricamento eseguire un refresh forzato del browser.
