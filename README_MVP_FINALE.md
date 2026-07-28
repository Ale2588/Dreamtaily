# DreamTaily — MVP finale dentro index.html

## Sovrascrivere

```text
index.html
```

Il file di partenza è la versione esatta della branch con blob SHA:

```text
8f41383b768ce499f774f8538e3d8c2fd3c5562f
```

## Flusso implementato

```text
landing
→ creator
→ wow
→ library / stories
→ setup atmosfera
→ camminata narrativa reversibile
→ composizione deterministica
→ lettore pagina per pagina
→ checkout finto
→ consegna
→ libreria / home
```

## Camminata narrativa

- s1: momento introduttivo;
- s2: scelta del sentiero;
- s3 del ramo: scelta dell’aiutante compatibile;
- passaggi del ramo e convergenza;
- s5: scelta del finale;
- s6 scelto;
- composizione e lettore.

Ogni momento mostra titolo, contesto e anteprima. Il tasto Indietro conserva le
scelte. Cambiare il sentiero cancella le scelte a valle incompatibili.

## File riusati

```text
stories/il-bosco-dei-sussurri/story.json
stories/il-bosco-dei-sussurri/scene-pilot.json
src/story-composer.js
story-validator.js
```

## Collaudo necessario

1. Creare o scegliere un personaggio.
2. Scegliere il Bosco.
3. Verificare che non si apra alcun iframe.
4. Scegliere l’atmosfera.
5. Attraversare i momenti e provare Indietro.
6. Provare entrambi i sentieri e controllare i roster.
7. Arrivare al lettore e verificare copertina + capitoli.
8. Usare “Modifica il libro”, cambiare una scelta e ricomporre.
9. Completare checkout finto e consegna.
10. Tornare alla libreria.

## Ruvidezza nota

Gli sfondi definitivi delle scene possono mancare. In quel caso resta visibile
la composizione dei personaggi sul contenitore scena; il giro non viene bloccato.
