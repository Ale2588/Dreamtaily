# Hotfix `max_decisions`

## Problema

Il validatore contava tutti i nodi decisionali presenti nel grafo.

Nel Bosco:

- `d_sentiero`
- `helper` nel ramo felci
- `helper` nel ramo ruscello
- `d_finale`

Sono quattro nodi nel grafo, ma un percorso ne attraversa solo tre.

## Correzione

`max_decisions` viene ora confrontato con il numero massimo di decisioni attraversate in un singolo percorso giocabile.

Per il Bosco:

```text
d_sentiero → helper di un solo ramo → d_finale = 3
```

La storia è quindi valida con:

```json
"max_decisions": 3
```
