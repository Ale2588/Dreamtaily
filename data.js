// ══════════════════════════════════════
// DREAMTAILY — CONTENT DATA
// ══════════════════════════════════════
// This file contains all editable content:
// styles, companions, stations, options.
// Edit here — never touch index.html for content changes.

const STYLES = [
  {
    id:   'paper',
    name: 'Paper Cut',
    tag:  'Forme nette, strati colorati',
  },
  {
    id:   'water',
    name: 'Acquerello',
    tag:  'Morbido, caldo, onirico',
  },
  {
    id:   'crayon',
    name: 'Pastelli',
    tag:  'Vivace, tattile, giocoso',
  },
];

const COMPANIONS = [
  { id:'rabbit',   name:'Etto',     species:'Coniglietto' },
  { id:'bear',     name:'Rubens',   species:'Orsacchiotto' },
  { id:'fox',      name:'Fiamma',   species:'Volpetta' },
  { id:'owl',      name:'Ulivo',    species:'Gufetto' },
  { id:'frog',     name:'Salto',    species:'Ranocchio' },
  { id:'eagle',    name:'Vento',    species:'Aquilotto' },
  { id:'hedgehog', name:'Pinto',    species:'Riccetto' },
  { id:'mouse',    name:'Briciola', species:'Topolino' },
];

// ── TINT PALETTES ──
// Used to generate spot illustrations for each option card.
// Each palette is [bg-light, bg-mid, ground, accent, deep]
const TINTS = {
  forest: ['#E9F1E3','#D4E6CD','#9DBE90','#5E8C6A','#456B4F'],
  sea:    ['#E4F0F1','#CCE5E6','#8FC3C4','#5B9EA0','#3F7779'],
  night:  ['#ECE8F3','#D9D3EC','#B6AED4','#8E84BC','#6E6498'],
  meadow: ['#F4EFD6','#ECE4BF','#CFD494','#A6B05E','#7E8742'],
  coral:  ['#FBE9E3','#F8D9CE','#F0B0A0','#E8735A','#C4513A'],
  gold:   ['#FCF0CF','#F8E5AE','#F2D079','#EBB430','#C9941C'],
  home:   ['#FDF4E7','#F5E8D0','#E8D0A8','#C9A870','#9E7A42'],
};

// ── EMBLEMS ──
// Emoji used as the central icon in each spot illustration.
const EMBLEMS = {
  home:     '🏠',
  forest:   '🌲',
  sea:      '🌊',
  meadow:   '🌻',
  moon:     '🌙',
  star:     '⭐',
  storm:    '⛈️',
  map:      '🗺️',
  friend:   '🤝',
  door:     '🚪',
  mountain: '⛰️',
  path:     '🛤️',
  voice:    '💫',
  animal:   '🦊',
  sound:    '🔔',
  courage:  '❤️',
};

// ══════════════════════════════════════
// STATIONS
// ══════════════════════════════════════
// Each station has:
//   id       — unique key
//   name     — display name
//   icon     — emoji shown in station header
//   role     — question shown before a choice is made
//   options  — array of option objects (see below)
//
// Each option has:
//   id       — unique key
//   label    — short display text
//   blurb    — one-line flavour text
//   emblem   — key from EMBLEMS
//   tint     — key from TINTS
//   grant    — {key: value} added to grants when this option is chosen
//   requires — {key: [allowed values]} — option is locked if grants don't match
//              use requires:{} for always-available options
//              use requires:{world:['home','garden']} to require world=home OR world=garden
// ══════════════════════════════════════

const STATIONS = [
  // ─────────────────────────────────────
  // STATION 1 — Il Mondo Ordinario
  // Always unlocked. Grants a 'world' tag.
  // ─────────────────────────────────────
  {
    id:   's1',
    name: 'Il Mondo Ordinario',
    icon: '🏡',
    role: 'Come inizia la giornata?',
    options: [
      {
        id:       'bored',
        label:    'Si annoia',
        blurb:    'La noia è l\'inizio di ogni avventura.',
        emblem:   'home',
        tint:     'home',
        grant:    { world: 'home' },
        requires: {},
      },
      {
        id:       'explore',
        label:    'Vuole esplorare',
        blurb:    'Qualcosa fuori dalla finestra lo chiama.',
        emblem:   'forest',
        tint:     'meadow',
        grant:    { world: 'garden' },
        requires: {},
      },
      {
        id:       'noise',
        label:    'Sente un rumore dalla finestra',
        blurb:    'Un suono misterioso arriva dal bosco.',
        emblem:   'sound',
        tint:     'forest',
        grant:    { world: 'forest' },
        requires: {},
      },
      {
        id:       'alone',
        label:    'Si sente solo',
        blurb:    'Qualcuno o qualcosa lo aspetta là fuori.',
        emblem:   'friend',
        tint:     'coral',
        grant:    { world: 'home' },
        requires: {},
      },
    ],
  },

  // ─────────────────────────────────────
  // STATION 2 — Il Conflitto
  // Requires a 'world' tag from station 1.
  // Grants a 'tone' tag.
  // ─────────────────────────────────────
  {
    id:   's2',
    name: 'Il Conflitto',
    icon: '⚡',
    role: 'Cosa succede dopo?',
    options: [
      {
        id:       'garden',
        label:    'Esplora il giardino',
        blurb:    'Il giardino nasconde più di quanto sembri.',
        emblem:   'meadow',
        tint:     'meadow',
        grant:    { tone: 'discover' },
        requires: { world: ['home','garden'] },
      },
      {
        id:       'forest',
        label:    'Va nel bosco',
        blurb:    'Il bosco è fitto e pieno di ombre.',
        emblem:   'forest',
        tint:     'forest',
        grant:    { tone: 'adventure' },
        requires: { world: ['garden','forest'] },
      },
      {
        id:       'sound',
        label:    'Segue un suono misterioso',
        blurb:    'Ogni passo porta verso l\'ignoto.',
        emblem:   'sound',
        tint:     'night',
        grant:    { tone: 'mystery' },
        requires: { world: ['forest','home'] },
      },
      {
        id:       'seek',
        label:    'Cerca qualcuno',
        blurb:    'Forse c\'è qualcuno che ha bisogno di lui.',
        emblem:   'friend',
        tint:     'coral',
        grant:    { tone: 'friendship' },
        requires: { world: ['home','garden'] },
      },
    ],
  },

  // ─────────────────────────────────────
  // STATION 3 — Il Mondo Straordinario
  // Requires a 'tone' tag from station 2.
  // Grants a 'place' tag.
  // ─────────────────────────────────────
  {
    id:   's3',
    name: 'Il Mondo Straordinario',
    icon: '✨',
    role: 'Cosa trova?',
    options: [
      {
        id:       'animals',
        label:    'Trova gli animaletti del bosco',
        blurb:    'Una famiglia segreta lo accoglie.',
        emblem:   'forest',
        tint:     'forest',
        grant:    { place: 'forest' },
        requires: { tone: ['adventure','mystery'] },
      },
      {
        id:       'character',
        label:    'Incontra qualcuno di speciale',
        blurb:    'Un incontro cambia tutto.',
        emblem:   'friend',
        tint:     'coral',
        grant:    { place: 'any' },
        requires: { tone: ['friendship','discover'] },
      },
      {
        id:       'passage',
        label:    'Trova un passaggio nascosto',
        blurb:    'Una porta che non c\'era ieri.',
        emblem:   'door',
        tint:     'night',
        grant:    { place: 'secret' },
        requires: { tone: ['mystery','adventure'] },
      },
      {
        id:       'voice',
        label:    'Sente una voce misteriosa',
        blurb:    'La voce sa cose che lui non sa.',
        emblem:   'voice',
        tint:     'night',
        grant:    { place: 'any' },
        requires: { tone: ['mystery','adventure'] },
      },
    ],
  },

  // ─────────────────────────────────────
  // STATION 4 — La Sfida
  // Requires a 'place' tag from station 3.
  // No grant — resolves the challenge.
  // ─────────────────────────────────────
  {
    id:   's4',
    name: 'La Sfida',
    icon: '🗝️',
    role: 'Cosa deve affrontare?',
    options: [
      {
        id:       'trust',
        label:    'Guadagnarsi la fiducia di un animale',
        blurb:    'Fermo, tranquillo, paziente.',
        emblem:   'animal',
        tint:     'forest',
        grant:    {},
        requires: { place: ['forest','any'] },
      },
      {
        id:       'road',
        label:    'Trovare la strada nel buio',
        blurb:    'Ricorda un segno che aveva notato.',
        emblem:   'moon',
        tint:     'night',
        grant:    {},
        requires: { place: ['forest','secret'] },
      },
      {
        id:       'help',
        label:    'Chiedere aiuto a uno sconosciuto',
        blurb:    'La timidezza si scioglie in un sorriso.',
        emblem:   'friend',
        tint:     'coral',
        grant:    {},
        requires: { place: ['any','forest','secret'] },
      },
      {
        id:       'big',
        label:    'Affrontare qualcosa di enorme',
        blurb:    'Da vicino era solo piccolo e spaventato.',
        emblem:   'mountain',
        tint:     'meadow',
        grant:    {},
        requires: { place: ['forest','secret'] },
      },
    ],
  },

  // ─────────────────────────────────────
  // STATION 5 — Il Ritorno
  // Always fully unlocked.
  // ─────────────────────────────────────
  {
    id:   's5',
    name: 'Il Ritorno',
    icon: '🎈',
    role: 'Come torna a casa?',
    options: [
      {
        id:       'new',
        label:    'Torna con qualcosa di nuovo',
        blurb:    'Non un oggetto — una consapevolezza.',
        emblem:   'star',
        tint:     'gold',
        grant:    {},
        requires: {},
      },
      {
        id:       'sleep',
        label:    'Torna a dormire sereno',
        blurb:    'La paura si è trasformata in qualcosa di morbido.',
        emblem:   'moon',
        tint:     'night',
        grant:    {},
        requires: {},
      },
      {
        id:       'parents',
        label:    'I genitori lo aspettano',
        blurb:    'Ha qualcosa di bello da raccontare.',
        emblem:   'home',
        tint:     'home',
        grant:    {},
        requires: {},
      },
      {
        id:       'friend',
        label:    'Ha fatto un nuovo amico',
        blurb:    'Il mondo straordinario è diventato familiare.',
        emblem:   'friend',
        tint:     'coral',
        grant:    {},
        requires: {},
      },
    ],
  },
];
