# DreamTaily — Fix ingresso funnel dai personaggi

## Sovrascrivere

```text
index.html
```

Base verificata:

```text
d959e11384456553faa65ee92549c0bb945173f0
```

## Problema corretto

Il percorso `personaggio salvato → scelta storia` apriva ancora
`configuratore.html` dentro un iframe legacy.

## Nuovo comportamento

Dopo la scelta della storia, `startStoryComposer()` apre direttamente:

```text
screen-setup → screen-composer → screen-book
```

tutto dentro `index.html`.

## Protezione

`openIntegratedStoryConfigurator()` non può più aprire l'iframe. Un eventuale
vecchio richiamo viene reindirizzato al funnel integrato.

## Non modificato

Homepage, creazione personaggio, libreria, scelta storia, persistenza,
compositore, lettore, checkout, consegna e percorsi del Bosco.
