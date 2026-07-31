# DreamTaily — Prompt pack completo immagini
**Branch:** `book-creation`  
**Libro:** `Il Bosco dei Sussurri`  
**Totale:** 39 asset: 23 sfondi + 16 aiutanti  
**Regola madre:** l’IA dipinge, l’HTML scrive. Nessuna immagine deve contenere testo.
## Come usarlo
1. Genera **una immagine alla volta** seguendo l’ordine del documento.
2. Per gli sfondi base/giorno non usare reference: genera da prompt.
3. Per le varianti `notte` e `tramonto`, usa il PNG base approvato della stessa scena come immagine di riferimento quando possibile.
4. Salva il file con il **nome esatto** indicato.
5. Caricalo nel path esatto indicato, sulla branch `book-creation`.
6. Non inserire personaggi negli sfondi e non inserire testo in nessuna immagine.
## Dove caricare
```text
Sfondi:
stories/il-bosco-dei-sussurri/scenes/<nome-file>.png

Aiutanti:
assets/char/paper/<nome-file>.png
```
## Ordine consigliato
Prima le ancore di stile: `s2.png`, `s4.png`, `etto_in_piedi.png`. Poi prosegui in ordine numerico. Per ogni variante genera prima la base corrispondente.
## Manifest asset
| # | File | Tipo | Atmosfera | Path | Reference consigliato |
|---:|---|---|---|---|---|
| 1 | `cover.png` | sfondo | fissa | `stories/il-bosco-dei-sussurri/scenes/cover.png` | — |
| 2 | `s1.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s1.png` | — |
| 3 | `s2.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s2.png` | — |
| 4 | `s3_felci.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s3_felci.png` | — |
| 5 | `s3_ruscello.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s3_ruscello.png` | — |
| 6 | `s4_felci.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s4_felci.png` | — |
| 7 | `s4_ruscello.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s4_ruscello.png` | — |
| 8 | `s4.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s4.png` | — |
| 9 | `s5.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s5.png` | — |
| 10 | `s6_promessa.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s6_promessa.png` | — |
| 11 | `s6_festa.png` | sfondo | giorno/unica | `stories/il-bosco-dei-sussurri/scenes/s6_festa.png` | — |
| 12 | `s1.notte.png` | sfondo | notte | `stories/il-bosco-dei-sussurri/scenes/s1.notte.png` | s1.png |
| 13 | `s1.tramonto.png` | sfondo | tramonto | `stories/il-bosco-dei-sussurri/scenes/s1.tramonto.png` | s1.png |
| 14 | `s2.notte.png` | sfondo | notte | `stories/il-bosco-dei-sussurri/scenes/s2.notte.png` | s2.png |
| 15 | `s2.tramonto.png` | sfondo | tramonto | `stories/il-bosco-dei-sussurri/scenes/s2.tramonto.png` | s2.png |
| 16 | `s4.notte.png` | sfondo | notte | `stories/il-bosco-dei-sussurri/scenes/s4.notte.png` | s4.png |
| 17 | `s4.tramonto.png` | sfondo | tramonto | `stories/il-bosco-dei-sussurri/scenes/s4.tramonto.png` | s4.png |
| 18 | `s5.notte.png` | sfondo | notte | `stories/il-bosco-dei-sussurri/scenes/s5.notte.png` | s5.png |
| 19 | `s5.tramonto.png` | sfondo | tramonto | `stories/il-bosco-dei-sussurri/scenes/s5.tramonto.png` | s5.png |
| 20 | `s6_promessa.notte.png` | sfondo | notte | `stories/il-bosco-dei-sussurri/scenes/s6_promessa.notte.png` | s6_promessa.png |
| 21 | `s6_promessa.tramonto.png` | sfondo | tramonto | `stories/il-bosco-dei-sussurri/scenes/s6_promessa.tramonto.png` | s6_promessa.png |
| 22 | `s6_festa.notte.png` | sfondo | notte | `stories/il-bosco-dei-sussurri/scenes/s6_festa.notte.png` | s6_festa.png |
| 23 | `s6_festa.tramonto.png` | sfondo | tramonto | `stories/il-bosco-dei-sussurri/scenes/s6_festa.tramonto.png` | s6_festa.png |
| 24 | `etto_in_piedi.png` | aiutante | trasparente | `assets/char/paper/etto_in_piedi.png` | same helper previous approved poses |
| 25 | `etto_seduto.png` | aiutante | trasparente | `assets/char/paper/etto_seduto.png` | same helper previous approved poses |
| 26 | `etto_cammina.png` | aiutante | trasparente | `assets/char/paper/etto_cammina.png` | same helper previous approved poses |
| 27 | `etto_si_china.png` | aiutante | trasparente | `assets/char/paper/etto_si_china.png` | same helper previous approved poses |
| 28 | `briciola_in_piedi.png` | aiutante | trasparente | `assets/char/paper/briciola_in_piedi.png` | same helper previous approved poses |
| 29 | `briciola_seduto.png` | aiutante | trasparente | `assets/char/paper/briciola_seduto.png` | same helper previous approved poses |
| 30 | `briciola_cammina.png` | aiutante | trasparente | `assets/char/paper/briciola_cammina.png` | same helper previous approved poses |
| 31 | `briciola_si_china.png` | aiutante | trasparente | `assets/char/paper/briciola_si_china.png` | same helper previous approved poses |
| 32 | `fiamma_in_piedi.png` | aiutante | trasparente | `assets/char/paper/fiamma_in_piedi.png` | same helper previous approved poses |
| 33 | `fiamma_seduto.png` | aiutante | trasparente | `assets/char/paper/fiamma_seduto.png` | same helper previous approved poses |
| 34 | `fiamma_cammina.png` | aiutante | trasparente | `assets/char/paper/fiamma_cammina.png` | same helper previous approved poses |
| 35 | `fiamma_si_china.png` | aiutante | trasparente | `assets/char/paper/fiamma_si_china.png` | same helper previous approved poses |
| 36 | `ulivo_in_piedi.png` | aiutante | trasparente | `assets/char/paper/ulivo_in_piedi.png` | same helper previous approved poses |
| 37 | `ulivo_seduto.png` | aiutante | trasparente | `assets/char/paper/ulivo_seduto.png` | same helper previous approved poses |
| 38 | `ulivo_cammina.png` | aiutante | trasparente | `assets/char/paper/ulivo_cammina.png` | same helper previous approved poses |
| 39 | `ulivo_si_china.png` | aiutante | trasparente | `assets/char/paper/ulivo_si_china.png` | same helper previous approved poses |

---

# Prompt completi

## 01. `cover.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/cover.png`  
**QA essenziale:** Campanella calda e leggibile; sentiero d’ingresso; terzo superiore calmo; nessun titolo.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

SCENE (empty, no characters): the threshold of a whispering forest at gentle dusk. In the
foreground, tall uncut meadow grass gives way to a narrow earth path that enters the trees
and disappears into a soft, inviting darkness. Slender birch and warm-brown trunks frame the
opening, with layered sage-green and deep pine foliage receding behind them. Hanging from a
low branch on the right, a small warm BRASS BELL with a worn faded-brick ribbon catches the
last light — it is the warmest, most attractive point of the image. A few small paper motes
of light float near the path.

LIGHTING / ATMOSPHERE: gentle dusk, soft warm light on the left fading into cool bluish depth
inside the forest, calm and inviting, magical but never scary.

PALETTE: warm cream paper, sage and moss greens, deep pine green, warm brown bark, pale birch
cream, warm brass, faded brick ribbon, soft dusky blue in the depth.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 02. `s1.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s1.png`  
**QA essenziale:** Passaggio erba tagliata → erba alta → bosco; campanella visibile; fascia bassa libera.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): the edge of a quiet village where a mown lawn ends and tall
uncut meadow grass begins, leading to the dense treeline of a forest. A few simple cream and
pale-ochre village houses sit small and quiet in the left background, their windows dark. In
the middle band, hanging from a low branch at the very edge of the trees, a small warm BRASS
BELL with a worn faded-brick ribbon. The forest beyond is calm, dense, with branches that
gently touch each other.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: warm cream paper, mown grass green, tall dusty sage grass, deep pine green, warm
brown bark, pale birch cream, warm brass, faded brick ribbon.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 03. `s2.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s2.png`  
**QA essenziale:** Bivio leggibile: felci a sinistra, ruscello a destra; basso centrale libero.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): inside the forest, a soft earth path splits clearly in two. On
the LEFT, very tall dense sage-green ferns form what looks like a room made of leaves; the
path enters them and disappears after a few steps. On the RIGHT, a small clear teal stream
runs alongside the path, with rounded grey stones breaking the surface like the backs of
sleeping animals. Slender trunks rise on both sides; the fork itself is open and readable.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: sage and moss green ferns, deep pine green, clear muted teal water, warm grey stone,
warm brown bark, pale birch cream, warm cream paper.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 04. `s3_felci.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s3_felci.png`  
**QA essenziale:** Stanza verde intima; apertura tra le fronde leggibile; pavimento basso libero.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): deep inside very tall sage-green ferns, so dense they enclose
the space like a green room; visibility is short, the narrow path is almost swallowed by
fronds that lean in from both sides at shoulder height. In the middle band, a small gap opens
between the fronds, as if the leaves had just parted slightly. A few tiny water drops cling
to the leaf tips. Soft dappled light filters from above.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: layered sage green, dusty olive, moss green, deep forest green, hints of warm brown
stems, pale cream light between the fronds.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 05. `s3_ruscello.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s3_ruscello.png`  
**QA essenziale:** Impronte verso il sasso; ramo basso sopra l’acqua; fascia bassa praticabile.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): a small clear teal stream seen from its mossy bank. A line of
tiny wet footprints presses into the soft brown mud along the water's edge and leads toward a
dry rounded stone sitting just above the surface. Tall reeds and layered leaves along the
bank; a bare LOW BRANCH reaches out over the water in the middle band. Rounded grey stones
break the water.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: clear muted teal water, warm brown mud, moss green, sage green reeds, warm grey
stone, pale birch cream, warm cream paper.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 06. `s4_felci.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s4_felci.png`  
**QA essenziale:** Radici come dita; passaggio basso; nastro piccolo visibile; spazio per posa chinata.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): the fern path narrows to a hush and ends against huge warm-brown
tree roots lifted out of the ground like the fingers of a hand. Between two of these roots
there is a LOW MOSSY PASSAGE — not a real tunnel, just a low gap wide enough for one small
creature at a time — with an irregular ceiling of roots. Warm light spills through from the
far side of the gap. On the moss in the foreground, a small piece of thin worn faded-brick
RIBBON catches the light.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: warm brown and walnut roots, deep moss green, sage green ferns closing behind, faded
brick ribbon, warm cream light through the gap, cool bluish shadow inside the passage.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 07. `s4_ruscello.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s4_ruscello.png`  
**QA essenziale:** Pietre come percorso chiaro; acqua leggibile; primo piano stabile per personaggi.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): the teal stream widens into a calm crossing where a line of flat
rounded stepping stones spans the water like a small bridge. Mossy banks with tall reeds on
both sides, layered paper ripples on the surface, a few warm gold glints where the light
touches the water. The near stones in the lower foreground are broad and stable.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: clear muted teal water, warm grey stone, moss green banks, sage green reeds, warm
brown earth, warm gold highlights, warm cream paper.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 08. `s4.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s4.png`  
**QA essenziale:** Radura tonda ordinata; due rami incrociati con campanella; spazio per due personaggi seduti.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): a round forest clearing with low, soft, tidy grass, ringed by
slender trees — it looks as if someone had cleaned it on purpose. Open pale sky above. In the
middle band, about two metres off the ground, TWO BRANCHES HAVE GROWN CROSSED over each other,
and a small warm BRASS BELL with a worn faded-brick ribbon is caught in the crossing, hanging
quietly. Everything is still and listening.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: soft low grass green, moss green, sage green, warm brown bark, pale birch cream, warm
brass bell, faded brick ribbon, pale cream sky.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 09. `s5.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s5.png`  
**QA essenziale:** Rami incrociati vuoti; radice-spalla riconoscibile; uscita verso il campo.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): the clearing opening back toward the way home. On one side, a
thick warm-brown root rises like a low shoulder, just climbable, beneath two branches that
have grown crossed — now EMPTY, nothing caught in them any more. The path leads out between
layered trees toward a bright opening where the forest ends and open meadow can be glimpsed
beyond. Soft, reassuring, a sense of returning.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: warm brown roots and bark, moss and sage green, pale birch cream, soft grass green in
the distant opening, warm cream light at the exit.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 10. `s6_promessa.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s6_promessa.png`  
**QA essenziale:** Bordo bosco/campo, cancello e casa lontani; patch d’erba per campanella; NON radura.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): the border between forest and home. In the foreground, soft tall
meadow grass at the very edge of the trees, with a small patch of bare flattened grass where
something could be set down. Beyond it, an open field stretches away, and in the far distance
a simple low garden GATE and the quiet shapes of a house. The treeline rises on one side, calm
and deep green. Intimate, tender, a threshold of farewell.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: soft meadow grass green, dusty sage, deep pine treeline, warm brown gate wood, pale
cream house shapes, warm cream sky.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 11. `s6_festa.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s6_festa.png`  
**QA essenziale:** Festa senza creature; luci e festoni piccoli; centro basso libero.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.


SCENE (empty, no characters): a small warm celebration prepared in the round forest clearing.
Simple paper bunting and tiny warm-gold lanterns are strung between the slender trees, small
paper petals and leaves float in the air, and the low soft grass is dotted with little bundles
of wildflowers. Two branches grown crossed above are empty. Festive, cosy and joyful, but the
clearing itself is still empty and waiting.

LIGHTING / ATMOSPHERE: gentle natural daylight, clearly readable colors, soft short shadows, calm and reassuring mood.

PALETTE: soft grass green, sage and moss green, warm gold lantern light, warm cream and coral
bunting, warm brown bark, pale cream sky.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 12. `s1.notte.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s1.notte.png`  
**Reference da usare:** `s1.png`  
**QA essenziale:** Notte leggibile e non nera; una sola finestra accesa; campanella con piccolo riflesso caldo.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s1.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new notte lighting version; do not simply tint the image.

SCENE (empty, no characters): the edge of a quiet village where a mown lawn ends and tall
uncut meadow grass begins, leading to the dense treeline of a forest. A few simple village
houses sit small and quiet in the left background, their windows dark except one faintly lit.
In the middle band, hanging from a low branch at the very edge of the trees, a small warm
BRASS BELL with a worn faded-brick ribbon. The forest beyond reads as one great silent shadow,
calm and dense.

LIGHTING / ATMOSPHERE: night version of exactly the same scene. Deep indigo and midnight blue
paper tones, soft silver moonlight from above picking out pale edges on leaves and ground,
cool bluish shadows. Details remain clearly readable — never black, never murky. Magical,
hushed and safe, absolutely not scary. Any brass bell keeps a small warm glint so it stays the
warmest point.

PALETTE: warm cream paper, mown grass green, tall dusty sage grass, deep pine green, warm
brown bark, pale birch cream, warm brass, faded brick ribbon.
Add night palette: deep indigo, midnight blue, dusky navy, soft silver moonlight, cool grey-blue highlights.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 13. `s1.tramonto.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s1.tramonto.png`  
**Reference da usare:** `s1.png`  
**QA essenziale:** Passaggio erba tagliata → erba alta → bosco; campanella visibile; fascia bassa libera. Variante tramonto: luce corallo/albicocca, geometria invariata.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s1.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new tramonto lighting version; do not simply tint the image.

SCENE (empty, no characters): the edge of a quiet village where a mown lawn ends and tall
uncut meadow grass begins, leading to the dense treeline of a forest. A few simple cream and
pale-ochre village houses sit small and quiet in the left background, their windows dark. In
the middle band, hanging from a low branch at the very edge of the trees, a small warm BRASS
BELL with a worn faded-brick ribbon. The forest beyond is calm, dense, with branches that
gently touch each other.

LIGHTING / ATMOSPHERE: sunset version of exactly the same scene. Warm coral and apricot light
washes across the scene, with soft golden reflections on leaf and paper edges. Long but soft
shadows, warm glowing sky. Cosy and golden, never harsh, never dramatic. Any brass bell glows
warmly.

PALETTE: warm cream paper, mown grass green, tall dusty sage grass, deep pine green, warm
brown bark, pale birch cream, warm brass, faded brick ribbon.
Add sunset palette: warm coral, apricot, soft terracotta glow, golden rim light.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 14. `s2.notte.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s2.notte.png`  
**Reference da usare:** `s2.png`  
**QA essenziale:** Bivio leggibile: felci a sinistra, ruscello a destra; basso centrale libero.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s2.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new notte lighting version; do not simply tint the image.

SCENE (empty, no characters): inside the forest, a soft earth path splits clearly in two. On
the LEFT, very tall dense sage-green ferns form what looks like a room made of leaves; the
path enters them and disappears after a few steps. On the RIGHT, a small clear teal stream
runs alongside the path, with rounded grey stones breaking the surface like the backs of
sleeping animals. Slender trunks rise on both sides; the fork itself is open and readable.

LIGHTING / ATMOSPHERE: night version of exactly the same scene. Deep indigo and midnight blue
paper tones, soft silver moonlight from above picking out pale edges on leaves and ground,
cool bluish shadows. Details remain clearly readable — never black, never murky. Magical,
hushed and safe, absolutely not scary. Any brass bell keeps a small warm glint so it stays the
warmest point.

PALETTE: sage and moss green ferns, deep pine green, clear muted teal water, warm grey stone,
warm brown bark, pale birch cream, warm cream paper.
Add night palette: deep indigo, midnight blue, dusky navy, soft silver moonlight, cool grey-blue highlights.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 15. `s2.tramonto.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s2.tramonto.png`  
**Reference da usare:** `s2.png`  
**QA essenziale:** Bivio leggibile: felci a sinistra, ruscello a destra; basso centrale libero. Variante tramonto: luce corallo/albicocca, geometria invariata.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s2.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new tramonto lighting version; do not simply tint the image.

SCENE (empty, no characters): inside the forest, a soft earth path splits clearly in two. On
the LEFT, very tall dense sage-green ferns form what looks like a room made of leaves; the
path enters them and disappears after a few steps. On the RIGHT, a small clear teal stream
runs alongside the path, with rounded grey stones breaking the surface like the backs of
sleeping animals. Slender trunks rise on both sides; the fork itself is open and readable.

LIGHTING / ATMOSPHERE: sunset version of exactly the same scene. Warm coral and apricot light
washes across the scene, with soft golden reflections on leaf and paper edges. Long but soft
shadows, warm glowing sky. Cosy and golden, never harsh, never dramatic. Any brass bell glows
warmly.

PALETTE: sage and moss green ferns, deep pine green, clear muted teal water, warm grey stone,
warm brown bark, pale birch cream, warm cream paper.
Add sunset palette: warm coral, apricot, soft terracotta glow, golden rim light.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 16. `s4.notte.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s4.notte.png`  
**Reference da usare:** `s4.png`  
**QA essenziale:** Radura tonda ordinata; due rami incrociati con campanella; spazio per due personaggi seduti.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s4.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new notte lighting version; do not simply tint the image.

SCENE (empty, no characters): a round forest clearing with low, soft, tidy grass, ringed by
slender trees — it looks as if someone had cleaned it on purpose. Open pale sky above. In the
middle band, about two metres off the ground, TWO BRANCHES HAVE GROWN CROSSED over each other,
and a small warm BRASS BELL with a worn faded-brick ribbon is caught in the crossing, hanging
quietly. Everything is still and listening.

LIGHTING / ATMOSPHERE: night version of exactly the same scene. Deep indigo and midnight blue
paper tones, soft silver moonlight from above picking out pale edges on leaves and ground,
cool bluish shadows. Details remain clearly readable — never black, never murky. Magical,
hushed and safe, absolutely not scary. Any brass bell keeps a small warm glint so it stays the
warmest point.

PALETTE: soft low grass green, moss green, sage green, warm brown bark, pale birch cream, warm
brass bell, faded brick ribbon, pale cream sky.
Add night palette: deep indigo, midnight blue, dusky navy, soft silver moonlight, cool grey-blue highlights.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 17. `s4.tramonto.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s4.tramonto.png`  
**Reference da usare:** `s4.png`  
**QA essenziale:** Radura tonda ordinata; due rami incrociati con campanella; spazio per due personaggi seduti. Variante tramonto: luce corallo/albicocca, geometria invariata.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s4.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new tramonto lighting version; do not simply tint the image.

SCENE (empty, no characters): a round forest clearing with low, soft, tidy grass, ringed by
slender trees — it looks as if someone had cleaned it on purpose. Open pale sky above. In the
middle band, about two metres off the ground, TWO BRANCHES HAVE GROWN CROSSED over each other,
and a small warm BRASS BELL with a worn faded-brick ribbon is caught in the crossing, hanging
quietly. Everything is still and listening.

LIGHTING / ATMOSPHERE: sunset version of exactly the same scene. Warm coral and apricot light
washes across the scene, with soft golden reflections on leaf and paper edges. Long but soft
shadows, warm glowing sky. Cosy and golden, never harsh, never dramatic. Any brass bell glows
warmly.

PALETTE: soft low grass green, moss green, sage green, warm brown bark, pale birch cream, warm
brass bell, faded brick ribbon, pale cream sky.
Add sunset palette: warm coral, apricot, soft terracotta glow, golden rim light.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 18. `s5.notte.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s5.notte.png`  
**Reference da usare:** `s5.png`  
**QA essenziale:** Rami incrociati vuoti; radice-spalla riconoscibile; uscita verso il campo.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s5.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new notte lighting version; do not simply tint the image.

SCENE (empty, no characters): the clearing opening back toward the way home. On one side, a
thick warm-brown root rises like a low shoulder, just climbable, beneath two branches that
have grown crossed — now EMPTY, nothing caught in them any more. The path leads out between
layered trees toward a bright opening where the forest ends and open meadow can be glimpsed
beyond. Soft, reassuring, a sense of returning.

LIGHTING / ATMOSPHERE: pre-dawn version of exactly the same scene. Night is slowly giving way
to morning: deep indigo still holds in the lower forest and in the shadows, while a pale cool
light is beginning to grow between the branches and at the forest opening, with the first hints
of warm cream on the horizon. Silver-blue moonlight fading. Hopeful, quiet, safe, absolutely
not scary.

PALETTE: warm brown roots and bark, moss and sage green, pale birch cream, soft grass green in
the distant opening, warm cream light at the exit.
Add night palette: deep indigo, midnight blue, dusky navy, soft silver moonlight, cool grey-blue highlights.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 19. `s5.tramonto.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s5.tramonto.png`  
**Reference da usare:** `s5.png`  
**QA essenziale:** Rami incrociati vuoti; radice-spalla riconoscibile; uscita verso il campo. Variante tramonto: luce corallo/albicocca, geometria invariata.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s5.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new tramonto lighting version; do not simply tint the image.

SCENE (empty, no characters): the clearing opening back toward the way home. On one side, a
thick warm-brown root rises like a low shoulder, just climbable, beneath two branches that
have grown crossed — now EMPTY, nothing caught in them any more. The path leads out between
layered trees toward a bright opening where the forest ends and open meadow can be glimpsed
beyond. Soft, reassuring, a sense of returning.

LIGHTING / ATMOSPHERE: sunset version of exactly the same scene. Warm coral and apricot light
washes across the scene, with soft golden reflections on leaf and paper edges. Long but soft
shadows, warm glowing sky. Cosy and golden, never harsh, never dramatic. Any brass bell glows
warmly.

PALETTE: warm brown roots and bark, moss and sage green, pale birch cream, soft grass green in
the distant opening, warm cream light at the exit.
Add sunset palette: warm coral, apricot, soft terracotta glow, golden rim light.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 20. `s6_promessa.notte.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s6_promessa.notte.png`  
**Reference da usare:** `s6_promessa.png`  
**QA essenziale:** Bordo bosco/campo, cancello e casa lontani; patch d’erba per campanella; NON radura.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s6_promessa.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new notte lighting version; do not simply tint the image.

SCENE (empty, no characters): the border between forest and home. In the foreground, soft tall
meadow grass at the very edge of the trees, with a small patch of bare flattened grass where
something could be set down. Beyond it, an open field stretches away, and in the far distance
a simple low garden GATE and the quiet shapes of a house. The treeline rises on one side, calm
and deep green. Intimate, tender, a threshold of farewell.

LIGHTING / ATMOSPHERE: night version of exactly the same scene. Deep indigo and midnight blue
paper tones, soft silver moonlight from above picking out pale edges on leaves and ground,
cool bluish shadows. Details remain clearly readable — never black, never murky. Magical,
hushed and safe, absolutely not scary. Any brass bell keeps a small warm glint so it stays the
warmest point.

PALETTE: soft meadow grass green, dusty sage, deep pine treeline, warm brown gate wood, pale
cream house shapes, warm cream sky.
Add night palette: deep indigo, midnight blue, dusky navy, soft silver moonlight, cool grey-blue highlights.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 21. `s6_promessa.tramonto.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s6_promessa.tramonto.png`  
**Reference da usare:** `s6_promessa.png`  
**QA essenziale:** Bordo bosco/campo, cancello e casa lontani; patch d’erba per campanella; NON radura. Variante tramonto: luce corallo/albicocca, geometria invariata.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s6_promessa.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new tramonto lighting version; do not simply tint the image.

SCENE (empty, no characters): the border between forest and home. In the foreground, soft tall
meadow grass at the very edge of the trees, with a small patch of bare flattened grass where
something could be set down. Beyond it, an open field stretches away, and in the far distance
a simple low garden GATE and the quiet shapes of a house. The treeline rises on one side, calm
and deep green. Intimate, tender, a threshold of farewell.

LIGHTING / ATMOSPHERE: sunset version of exactly the same scene. Warm coral and apricot light
washes across the scene, with soft golden reflections on leaf and paper edges. Long but soft
shadows, warm glowing sky. Cosy and golden, never harsh, never dramatic. Any brass bell glows
warmly.

PALETTE: soft meadow grass green, dusty sage, deep pine treeline, warm brown gate wood, pale
cream house shapes, warm cream sky.
Add sunset palette: warm coral, apricot, soft terracotta glow, golden rim light.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 22. `s6_festa.notte.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s6_festa.notte.png`  
**Reference da usare:** `s6_festa.png`  
**QA essenziale:** Festa senza creature; luci e festoni piccoli; centro basso libero.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s6_festa.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new notte lighting version; do not simply tint the image.

SCENE (empty, no characters): a small warm celebration prepared in the round forest clearing.
Simple paper bunting and tiny warm-gold lanterns are strung between the slender trees, small
paper petals and leaves float in the air, and the low soft grass is dotted with little bundles
of wildflowers. Two branches grown crossed above are empty. Festive, cosy and joyful, but the
clearing itself is still empty and waiting.

LIGHTING / ATMOSPHERE: night version of exactly the same scene. Deep indigo and midnight blue
paper tones, soft silver moonlight from above picking out pale edges on leaves and ground,
cool bluish shadows. Details remain clearly readable — never black, never murky. Magical,
hushed and safe, absolutely not scary. Any brass bell keeps a small warm glint so it stays the
warmest point.

PALETTE: soft grass green, sage and moss green, warm gold lantern light, warm cream and coral
bunting, warm brown bark, pale cream sky.
Add night palette: deep indigo, midnight blue, dusky navy, soft silver moonlight, cool grey-blue highlights.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 23. `s6_festa.tramonto.png`

**Tipo:** sfondo  
**Carica qui:** `stories/il-bosco-dei-sussurri/scenes/s6_festa.tramonto.png`  
**Reference da usare:** `s6_festa.png`  
**QA essenziale:** Festa senza creature; luci e festoni piccoli; centro basso libero. Variante tramonto: luce corallo/albicocca, geometria invariata.

```text
Children's book illustration in CUT-PAPER COLLAGE style: hand-cut layered construction paper,
visibly torn and cut edges, real paper grain and fiber texture, matte opaque surfaces, soft
short shadows between stacked paper layers, no outlines, simplified warm reassuring shapes.
Depth built only by overlapping paper layers.

REFERENCE IMAGE: use the approved daytime base image `s6_festa.png` as the visual composition reference. Keep the same camera angle, same layout, same positions of all important elements, same geometry and same negative-space areas. Create a new tramonto lighting version; do not simply tint the image.

SCENE (empty, no characters): a small warm celebration prepared in the round forest clearing.
Simple paper bunting and tiny warm-gold lanterns are strung between the slender trees, small
paper petals and leaves float in the air, and the low soft grass is dotted with little bundles
of wildflowers. Two branches grown crossed above are empty. Festive, cosy and joyful, but the
clearing itself is still empty and waiting.

LIGHTING / ATMOSPHERE: sunset version of exactly the same scene. Warm coral and apricot light
washes across the scene, with soft golden reflections on leaf and paper edges. Long but soft
shadows, warm glowing sky. Cosy and golden, never harsh, never dramatic. Any brass bell glows
warmly.

PALETTE: soft grass green, sage and moss green, warm gold lantern light, warm cream and coral
bunting, warm brown bark, pale cream sky.
Add sunset palette: warm coral, apricot, soft terracotta glow, golden rim light.

COMPOSITION (critical):
- horizontal 4:3
- child's eye level, slightly frontal
- three depth planes: uncluttered lower foreground, narrative subject in the middle band, forest masses and sky in the back
- KEEP THE TOP THIRD calm, light and free of important or high-contrast elements
- leave clear readable negative space in the lower-center (35%–70% of the width) with a believable ground surface where small characters will later stand
- absolutely NO characters, no people, no animals anywhere in the image
- absolutely NO text, letters, words or captions anywhere in the image
- this is a lighting variant only: keep the identical composition, identical element
  positions, identical framing and identical geometry as the daytime version of this scene;
  change ONLY light, sky, shadows and mood

NEGATIVE: no text, no letters, no words, no captions, no titles, no signs, no numbers,
no watermark, no signature; no people, no children, no human figures, no animals,
no characters, no creatures; no photorealism, no 3D render, no CGI, no plastic or glossy
surfaces, no watercolor washes, no crayon or pencil texture, no flat vector style,
no thick outlines, no cel shading, no neon or saturated colors, no lens flare,
no heavy dramatic shadows, no scary or threatening mood, no clutter in the lower center,
no important elements in the top third, no frame, no border, no vignette, no collage of
multiple panels, no split screen.

Output: single horizontal 4:3 illustration, no frame, no border.
```

**Controllo prima di approvare:** 4:3, zero personaggi, zero testo, terzo superiore libero, basso centrale libero, stile paper-cut coerente.

## 24. `etto_in_piedi.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/etto_in_piedi.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Orecchie basse, naso a bottone, toppa azzurro polvere sul ginocchio sinistro.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Etto, a small young RABBIT. Warm taupe-grey fur with a cream belly and cream inner
ears. LONG EARS HELD LOW along his back, never upright — he keeps them down so as not to be
noticed. A dark, round, button-like nose. A small patch of lighter dusty-blue fabric sewn on his
LEFT KNEE. Shy, gentle, watchful expression.

POSE: standing upright, facing slightly three-quarter toward the viewer, calm and alert, body balanced on the invisible ground line. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- feet, paws, or seated body base rest on the logical bottom edge of the frame, as if on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 25. `etto_seduto.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/etto_seduto.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Orecchie basse, naso a bottone, toppa azzurro polvere sul ginocchio sinistro.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Etto, a small young RABBIT. Warm taupe-grey fur with a cream belly and cream inner
ears. LONG EARS HELD LOW along his back, never upright — he keeps them down so as not to be
noticed. A dark, round, button-like nose. A small patch of lighter dusty-blue fabric sewn on his
LEFT KNEE. Shy, gentle, watchful expression.

POSE: sitting calmly on the ground, body upright and relaxed, legs or body base folded naturally beneath, front paws/wings resting close to the body, head slightly tilted as if listening. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- the seated body base rests on the logical bottom edge of the frame, as if sitting on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 26. `etto_cammina.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/etto_cammina.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Orecchie basse, naso a bottone, toppa azzurro polvere sul ginocchio sinistro.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Etto, a small young RABBIT. Warm taupe-grey fur with a cream belly and cream inner
ears. LONG EARS HELD LOW along his back, never upright — he keeps them down so as not to be
noticed. A dark, round, button-like nose. A small patch of lighter dusty-blue fabric sewn on his
LEFT KNEE. Shy, gentle, watchful expression.

POSE: walking in mid-stride, one front paw and the opposite hind paw forward, body turned three-quarter, weight moving forward, calm and purposeful. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- feet, paws, or seated body base rest on the logical bottom edge of the frame, as if on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 27. `etto_si_china.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/etto_si_china.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Orecchie basse, naso a bottone, toppa azzurro polvere sul ginocchio sinistro.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Etto, a small young RABBIT. Warm taupe-grey fur with a cream belly and cream inner
ears. LONG EARS HELD LOW along his back, never upright — he keeps them down so as not to be
noticed. A dark, round, button-like nose. A small patch of lighter dusty-blue fabric sewn on his
LEFT KNEE. Shy, gentle, watchful expression.

POSE: crouching low and leaning forward, body close to the ground, head lowered and pushed slightly forward as if sniffing or peering into a low gap. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- the lowered body rests on the logical bottom edge of the frame, as if crouching on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 28. `briciola_in_piedi.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/briciola_in_piedi.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Deve sembrare un topolino, il più piccolo; orecchie rotonde avanti; macchiolina vicino a un baffo.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Briciola, a very small young MOUSE, clearly the smallest of the four helpers.
Warm light grey fur with a cream belly, soft pink inner ears. Large round ears turned forward
as if listening carefully. A small dark spot beside one whisker — this mark must be visible in
every pose. Gentle, alert, slightly trembling but brave expression.

POSE: standing upright, facing slightly three-quarter toward the viewer, calm and alert, body balanced on the invisible ground line. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- feet, paws, or seated body base rest on the logical bottom edge of the frame, as if on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 29. `briciola_seduto.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/briciola_seduto.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Deve sembrare un topolino, il più piccolo; orecchie rotonde avanti; macchiolina vicino a un baffo.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Briciola, a very small young MOUSE, clearly the smallest of the four helpers.
Warm light grey fur with a cream belly, soft pink inner ears. Large round ears turned forward
as if listening carefully. A small dark spot beside one whisker — this mark must be visible in
every pose. Gentle, alert, slightly trembling but brave expression.

POSE: sitting calmly on the ground, body upright and relaxed, legs or body base folded naturally beneath, front paws/wings resting close to the body, head slightly tilted as if listening. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- the seated body base rests on the logical bottom edge of the frame, as if sitting on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 30. `briciola_cammina.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/briciola_cammina.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Deve sembrare un topolino, il più piccolo; orecchie rotonde avanti; macchiolina vicino a un baffo.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Briciola, a very small young MOUSE, clearly the smallest of the four helpers.
Warm light grey fur with a cream belly, soft pink inner ears. Large round ears turned forward
as if listening carefully. A small dark spot beside one whisker — this mark must be visible in
every pose. Gentle, alert, slightly trembling but brave expression.

POSE: walking in mid-stride, one front paw and the opposite hind paw forward, body turned three-quarter, weight moving forward, calm and purposeful. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- feet, paws, or seated body base rest on the logical bottom edge of the frame, as if on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 31. `briciola_si_china.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/briciola_si_china.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Deve sembrare un topolino, il più piccolo; orecchie rotonde avanti; macchiolina vicino a un baffo.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Briciola, a very small young MOUSE, clearly the smallest of the four helpers.
Warm light grey fur with a cream belly, soft pink inner ears. Large round ears turned forward
as if listening carefully. A small dark spot beside one whisker — this mark must be visible in
every pose. Gentle, alert, slightly trembling but brave expression.

POSE: crouching low and leaning forward, body close to the ground, head lowered and pushed slightly forward as if sniffing or peering into a low gap. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- the lowered body rests on the logical bottom edge of the frame, as if crouching on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 32. `fiamma_in_piedi.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/fiamma_in_piedi.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Volpetta arancio-ruggine; zampe bianche; coda lunga bassa; un orecchio dritto e uno piegato.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Fiamma, a young female FOX. Soft rust-orange paper fur, white paws as if dipped in
flour, cream muzzle and chest. A long tail held LOW and still, never lifted. One ear stands
upright while the other bends forward — this asymmetry is mandatory in every pose. Cautious,
clever, observant expression.

POSE: standing upright, facing slightly three-quarter toward the viewer, calm and alert, body balanced on the invisible ground line. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- feet, paws, or seated body base rest on the logical bottom edge of the frame, as if on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 33. `fiamma_seduto.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/fiamma_seduto.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Volpetta arancio-ruggine; zampe bianche; coda lunga bassa; un orecchio dritto e uno piegato.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Fiamma, a young female FOX. Soft rust-orange paper fur, white paws as if dipped in
flour, cream muzzle and chest. A long tail held LOW and still, never lifted. One ear stands
upright while the other bends forward — this asymmetry is mandatory in every pose. Cautious,
clever, observant expression.

POSE: sitting calmly on the ground, body upright and relaxed, legs or body base folded naturally beneath, front paws/wings resting close to the body, head slightly tilted as if listening. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- the seated body base rests on the logical bottom edge of the frame, as if sitting on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 34. `fiamma_cammina.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/fiamma_cammina.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Volpetta arancio-ruggine; zampe bianche; coda lunga bassa; un orecchio dritto e uno piegato.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Fiamma, a young female FOX. Soft rust-orange paper fur, white paws as if dipped in
flour, cream muzzle and chest. A long tail held LOW and still, never lifted. One ear stands
upright while the other bends forward — this asymmetry is mandatory in every pose. Cautious,
clever, observant expression.

POSE: walking in mid-stride, one front paw and the opposite hind paw forward, body turned three-quarter, weight moving forward, calm and purposeful. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- feet, paws, or seated body base rest on the logical bottom edge of the frame, as if on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 35. `fiamma_si_china.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/fiamma_si_china.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Volpetta arancio-ruggine; zampe bianche; coda lunga bassa; un orecchio dritto e uno piegato.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Fiamma, a young female FOX. Soft rust-orange paper fur, white paws as if dipped in
flour, cream muzzle and chest. A long tail held LOW and still, never lifted. One ear stands
upright while the other bends forward — this asymmetry is mandatory in every pose. Cautious,
clever, observant expression.

POSE: crouching low and leaning forward, body close to the ground, head lowered and pushed slightly forward as if sniffing or peering into a low gap. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- the lowered body rests on the logical bottom edge of the frame, as if crouching on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 36. `ulivo_in_piedi.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/ulivo_in_piedi.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Gufetto bruno; occhi enormi a bottone; piuma ribelle dalla parte sbagliata; mai in volo.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Ulivo, a small OWL. Warm speckled brown paper feathers with a cream belly. Very
large round button-like eyes. On top of his head, one rebellious feather points the wrong way,
opposite to all the others — this marker must be visible in every pose. Wings closed unless
the pose requires balance; calm, thoughtful, slightly comic expression.

POSE: standing upright, facing slightly three-quarter toward the viewer, calm and alert, body balanced on the invisible ground line. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- feet, paws, or seated body base rest on the logical bottom edge of the frame, as if on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 37. `ulivo_seduto.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/ulivo_seduto.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Gufetto bruno; occhi enormi a bottone; piuma ribelle dalla parte sbagliata; mai in volo.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Ulivo, a small OWL. Warm speckled brown paper feathers with a cream belly. Very
large round button-like eyes. On top of his head, one rebellious feather points the wrong way,
opposite to all the others — this marker must be visible in every pose. Wings closed unless
the pose requires balance; calm, thoughtful, slightly comic expression.

POSE: sitting calmly on the ground, body upright and relaxed, legs or body base folded naturally beneath, front paws/wings resting close to the body, head slightly tilted as if listening. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- the seated body base rests on the logical bottom edge of the frame, as if sitting on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 38. `ulivo_cammina.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/ulivo_cammina.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Gufetto bruno; occhi enormi a bottone; piuma ribelle dalla parte sbagliata; mai in volo.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Ulivo, a small OWL. Warm speckled brown paper feathers with a cream belly. Very
large round button-like eyes. On top of his head, one rebellious feather points the wrong way,
opposite to all the others — this marker must be visible in every pose. Wings closed unless
the pose requires balance; calm, thoughtful, slightly comic expression.

POSE: making a tiny hopping walking step on the ground, wings closed, one foot lifted slightly and the other planted, body leaning forward a little. He is walking on the ground, never flying. Keep the large eyes and rebellious feather clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- feet, paws, or seated body base rest on the logical bottom edge of the frame, as if on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.

## 39. `ulivo_si_china.png`

**Tipo:** aiutante  
**Carica qui:** `assets/char/paper/ulivo_si_china.png`  
**Reference da usare:** `same helper previous approved poses`  
**QA essenziale:** Gufetto bruno; occhi enormi a bottone; piuma ribelle dalla parte sbagliata; mai in volo.

```text
Character asset for a children's book, CUT-PAPER COLLAGE style: hand-cut layered construction
paper, visibly torn and cut edges, real paper grain texture, matte opaque surfaces, soft short
shadows between paper layers, no outlines, simplified warm shapes. Exactly the same paper-cut
technique as the book's backgrounds — it must not look like it comes from a different style.

CHARACTER: Ulivo, a small OWL. Warm speckled brown paper feathers with a cream belly. Very
large round button-like eyes. On top of his head, one rebellious feather points the wrong way,
opposite to all the others — this marker must be visible in every pose. Wings closed unless
the pose requires balance; calm, thoughtful, slightly comic expression.

POSE: crouching low and leaning forward, body close to the ground, head lowered and pushed slightly forward as if sniffing or peering into a low gap. Keep the identity markers clearly visible.

PRESENTATION (critical):
- the character ALONE, isolated, on a fully TRANSPARENT background (PNG alpha)
- full body entirely visible, nothing cropped
- the lowered body rests on the logical bottom edge of the frame, as if crouching on an invisible ground line
- clear readable silhouette, seen at child's eye level, slightly frontal
- keep the character's own soft paper layer shadows, but NO ground shadow, NO cast environmental shadow, NO scenery, NO background elements, NO extra props
- NO text, letters or labels anywhere

NEGATIVE: no text, no letters, no words, no captions, no watermark, no signature; no scenery,
no background, no ground shadow, no other characters; no photorealism, no 3D render, no CGI,
no plastic or glossy surfaces, no watercolor washes, no crayon or pencil texture, no flat
vector style, no thick outlines, no cel shading, no neon or saturated colors, no frame, no border.

Output: single character asset, transparent background.
```

**Controllo prima di approvare:** PNG trasparente reale, corpo intero, identità coerente tra pose, nessuna ombra a terra, nessuno sfondo.
