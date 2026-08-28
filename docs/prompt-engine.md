# DreamTaily — Prompt Engine v1

## Scope
Implements backlog DT-RE-011, DT-RE-012 and DT-RE-013 and provides the render-facing
contract needed to finish DT-RE-010 persistence later.

## Source of truth used
The canonical helper traits and scene environments come from the existing DreamTaily
authoring prompt document. Narrative moments are aligned to the current
`stories/il-bosco-dei-sussurri/story.json`.

No story text is generated here.

## Rendering strategy
Primary mode:

```text
Image 1 = approved background
Image 2 = protagonist canonical reference
Image 3 = optional helper canonical reference
+
buildPageRenderPrompt(...)
=
one cohesive generated illustration
```

No mask is required in primary mode.

`src/scene-mask.js` remains available only for later fallback/containment experiments.

## Important distinction
`SCENE_PROMPTS` does not replace the actual background image.
The background image remains the authoritative visual reference.
The text prompt reinforces:
- major environmental landmarks;
- narrative moment;
- atmosphere;
- character identities;
- integration rules.

## Helper canon
The four helpers included are:
- Etto — rabbit
- Briciola — mouse
- Fiamma — fox
- Ulivo — owl

Their unique authored identity markers are embedded in `HELPER_IDENTITIES`.

## Usage

```js
import { buildPageRenderPrompt } from "./src/render-prompts.js";

const prompt = buildPageRenderPrompt({
  sceneId: "s3_ruscello",
  atmosphere: "notte",
  protagonistIdentity: characterAsset.identity_prompt,
  protagonistPose: "in_piedi",
  helperId: "ulivo",
  helperPose: "cammina"
});
```

## Next
1. Persist protagonist `identity_prompt`.
2. QA three generated scenes using this exact prompt builder.
3. Only then build `render-book`.
