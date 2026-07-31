# DreamTaily — Pacchetto completo Book-Creation

Questo pacchetto include **sia il fix dell'index**, sia il **scene-pilot.json aggiornato** per agganciare le nuove varianti notte/tramonto delle scene di ramo.

## File da sovrascrivere

```text
index.html
stories/il-bosco-dei-sussurri/scene-pilot.json
```

## Include

- ingresso pulito nel funnel anche dopo la creazione del personaggio;
- reset dello stato libro/storia quando si parte da un personaggio appena creato;
- catalogo aiutanti allineato ai 4 nuovi aiutanti;
- `*_in_piedi.png` come immagine standard degli aiutanti;
- cache busting `fix-5` per sfondi e pose;
- badge build aggiornato: `Book-Creation 2026-07-30 fix-5`;
- collegamento delle 8 nuove varianti:
  - `s3_felci_notte.png`
  - `s3_felci_tramonto.png`
  - `s3_ruscello_notte.png`
  - `s3_ruscello_tramonto.png`
  - `s4_felci_notte.png`
  - `s4_felci_tramonto.png`
  - `s4_ruscello_notte.png`
  - `s4_ruscello_tramonto.png`

## Prima del test

Assicurati di avere davvero questi 8 PNG in:

```text
stories/il-bosco-dei-sussurri/scenes/
```

Se i file non sono ancora caricati, le relative scene mostreranno un errore esplicito di asset mancante.
