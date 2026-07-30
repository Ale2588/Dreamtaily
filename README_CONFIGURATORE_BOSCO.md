# DreamTaily — Configuratore statico del Bosco

## Stato

Primo giro completo statico basato sulla reference approvata.

Non sostituisce ancora `index.html`. Va pubblicato come:

```text
/configuratore.html
```

## Contiene

```text
Configura
→ Sfoglia
→ Checkout finto
→ Consegna simulata
```

## Dati reali collegati

- storia: Il bosco dei sussurri;
- atmosfera: notte / tramonto;
- bivi: sentiero / finale;
- personaggi di catalogo già presenti nel repository;
- immagini notte e tramonto già presenti nel repository.

## Limiti dichiarati

- i testi incorporati sono adattamenti brevi dei `composer_summary`, non ancora il testo integrale dei Markdown;
- le immagini notte/tramonto vengono riutilizzate come sfondo di tutte le pagine;
- gli asset personaggio esistenti vengono riutilizzati per tutte le pose;
- checkout e link permanente sono simulati;
- non scrive su Supabase;
- non usa AI.

Questi limiti permettono di testare subito il giro UX completo senza fingere che gli asset editoriali finali esistano già.

## Test

Aprire:

```text
/configuratore.html
```

Verificare:

```text
[ ] eroe sblocca il resto
[ ] compagno obbligatorio
[ ] notte carica atmosfera_notte.png
[ ] tramonto carica atmosfera_tramonto.png
[ ] sentiero cambia le pagine del capitolo 3 e 4
[ ] finale cambia l'ultima pagina
[ ] nessun marcatore grezzo
[ ] reader navigabile
[ ] email abilita il pagamento finto
[ ] consegna mostra il link
[ ] Ricomincia azzera lo stato
[ ] responsive mobile
```

## Commit suggerito

```bash
git add configuratore.html README_CONFIGURATORE_BOSCO.md
git commit -m "add static forest book configurator"
git push
```
