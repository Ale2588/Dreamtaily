# Modello degli stili visivi

## Decisione MVP

Il libro possiede un solo style_id. Per l’MVP l’unico stile attivo è:

- paper — Paper Cut.

water (Acquerello) e crayon (Pastelli) sono già registrati nel catalogo come
stili pianificati, ma non sono selezionabili e non possono raggiungere il
renderer finché non avranno prompt, reference e collaudo dedicati.

## Separazione dal contenuto

Lo stile è una proprietà del libro e controlla il linguaggio visivo complessivo.
Luce, ora del giorno e atmosfera appartengono invece alla singola scena e sono
definite dall’autore tramite sfondo e prompt ambiente/momento.

Le vecchie opzioni globali notte e tramonto erano varianti del prototipo:
il runtime le ignora, non le salva nelle nuove scelte e non le passa al renderer.

## Compatibilità

Gli snapshot già confermati restano immutabili. Durante l’MVP il planner
normalizza comunque ogni render sul solo stile attivo paper, così i valori
storici non bloccano i libri già congelati.

Quando verrà attivato un nuovo stile serviranno, come un’unica release:

1. prompt di stile approvato;
2. reference del personaggio per quello stile;
3. asset degli aiutanti compatibili;
4. test visivi e di continuità;
5. attivazione dello stile nel catalogo.
