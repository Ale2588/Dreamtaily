# DreamTaily — Addendum sperimentale `scene`

## Stato

Pilota isolato. Non modifica ancora lo schema canonico v2.

## Vocabolario pose

```text
in_piedi
cammina
seduto
si_china
di_spalle
```

## Convenzione dei riferimenti

Tutti gli asset narrativi sono relativi alla cartella della storia.

Per il Bosco sono stati verificati nel branch:

```text
stories/il-bosco-dei-sussurri/setup/atmosfera_notte.png
stories/il-bosco-dei-sussurri/setup/atmosfera_tramonto.png
```

Nel file narrativo diventano quindi:

```text
setup/atmosfera_notte.png
setup/atmosfera_tramonto.png
```

Il resolver aggiunge una sola volta:

```text
stories/{story_slug}/
```

## Coordinate

- `x`: posizione orizzontale del punto di ancoraggio;
- `y`: posizione verticale del punto di ancoraggio;
- `scale`: altezza rispetto alla scena;
- `z`: ordine dei livelli;
- ancoraggio CSS: piedi al centro, tramite `translate(-50%, -100%)`.

## Gate prima dell'integrazione

- notte e tramonto devono apparire entrambe;
- il protagonista non deve fluttuare né essere tagliato;
- il ridimensionamento deve conservare la posizione;
- pose sconosciute devono essere bloccate;
- asset mancanti devono essere bloccati;
- il composer deve restare indipendente dal flusso di scelta.
