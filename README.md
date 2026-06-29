# DreamTaily

Personalized children's book builder. Parents and children build a story together by choosing narrative pieces that connect into a complete illustrated book following the hero's journey.

## Structure

```
dreamtaily/
├── index.html          # Full single-page app
├── assets/
│   └── char/
│       ├── paper/      # Paper Cut style characters
│       ├── water/      # Watercolour style characters
│       └── crayon/     # Crayon style characters
└── README.md
```

## Setup

1. Clone the repo
2. Open `index.html` in a browser — works locally with no build step
3. Deploy to GitHub Pages: Settings → Pages → Deploy from branch `main` / root

## Characters

8 companions × 3 styles = 24 PNGs:
`rabbit, bear, fox, owl, frog, eagle, hedgehog, mouse`

## Narrative system

5 stations following the hero's journey. Each option grants tags; later options require tags from earlier choices. Picking an option in station N resets all choices downstream.

## Tech

Plain HTML + CSS + JavaScript. No frameworks, no build step, no dependencies.
