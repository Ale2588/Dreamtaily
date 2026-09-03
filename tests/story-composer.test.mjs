import test from "node:test";
import assert from "node:assert/strict";
import {
  composeStory,
  bookToMarkdown,
  resolveStoryPath,
  StoryCompositionError,
} from "../src/story-composer.js";

const story = {
  slug: "il-bosco-dei-sussurri",
  title: "Il bosco dei sussurri",
  start: "s1",
  steps: [
    {
      key: "s1",
      chapter: 1,
      title: "Inizio",
      content_ref: "s1.md",
      next: "s2",
      variant_refs: { atmosfera: { notte: "s1.notte.md" } },
    },
    {
      key: "s2",
      chapter: 2,
      title: "Bivio",
      content_ref: "s2.md",
      decision: {
        type: "branch",
        key: "d_sentiero",
        options: [
          { key: "felci", next: "s3_felci" },
          { key: "ruscello", next: "s3_ruscello" },
        ],
      },
    },
    {
      key: "s3_felci",
      chapter: 3,
      title: "Felci",
      content_ref: "s3_felci.md",
      decision: {
        type: "cast",
        key: "helper",
        catalog_roster: [{ key: "etto", entrance_ref: "etto.md" }],
      },
      next: null,
    },
    {
      key: "s3_ruscello",
      chapter: 3,
      title: "Ruscello",
      content_ref: "s3_ruscello.md",
      decision: {
        type: "cast",
        key: "helper",
        catalog_roster: [{ key: "ulivo", entrance_ref: "ulivo.md" }],
      },
      next: null,
    },
  ],
};

const scenes = {
  cover: {
    background_ref: "cover.png",
    slots: [
      { role: "protagonist", pose: "in_piedi", x: 0.5, y: 0.9, scale: 0.5, z: 2 },
    ],
  },
  scenes: Object.fromEntries(
    story.steps.map((step) => [
      step.key,
      {
        background_ref: `${step.key}.png`,
        prompt_environment: `Environment for ${step.key}`,
        prompt_moment: `Moment for ${step.key}`,
        variant_backgrounds:
          step.key === "s1" ? { atmosfera: { notte: "s1.notte.png" } } : {},
        slots: [
          { role: "protagonist", pose: "in_piedi", x: 0.4, y: 0.9, scale: 0.3, z: 2 },
          ...(step.key.startsWith("s3")
            ? [{ role: "helper", pose: "in_piedi", x: 0.6, y: 0.9, scale: 0.25, z: 1 }]
            : []),
        ],
      },
    ])
  ),
};
scenes.scenes.s1.environment_prompt = "Bosco quieto";
scenes.scenes.s1.moment_prompt = "Lia ascolta";
delete scenes.scenes.s1.prompt_environment;
delete scenes.scenes.s1.prompt_moment;

const contentByRef = {
  "s1.md": "Ciao [Nome]. [VARIANTE:atmosfera]",
  "s1.notte.md": "È notte.",
  "s2.md": "Due sentieri.",
  "s3_felci.md": "[ENTRATA_AIUTANTE] Ora [Aiutante] accompagna [Nome].",
  "s3_ruscello.md": "[ENTRATA_AIUTANTE] Ora [Aiutante] accompagna [Nome].",
  "etto.md": "Etto arriva.",
  "ulivo.md": "Ulivo arriva.",
};

const catalog = {
  etto: { name: "Etto", image: "etto.png" },
  ulivo: { name: "Ulivo", image: "ulivo.png" },
};

const baseChoices = {
  story: story.slug,
  protagonist: { name: "Lia", asset_ref: "lia.png" },
  setup: { atmosfera: "notte" },
};

test("resolves the selected path", () => {
  const path = resolveStoryPath(story, {
    ...baseChoices,
    cast: { helper: "etto" },
    branches: { d_sentiero: "felci" },
  });
  assert.deepEqual(path.map((step) => step.key), ["s1", "s2", "s3_felci"]);
});

test("composes resolved pages and visual layers", () => {
  const book = composeStory({
    story,
    scenes,
    contentByRef,
    catalog,
    choices: {
      ...baseChoices,
      cast: { helper: "etto" },
      branches: { d_sentiero: "felci" },
    },
  });

  assert.equal(book.pages.length, 3);
  assert.equal(book.pages[0].text, "Ciao Lia.");
  assert.equal(book.pages[0].scene.bg, "s1.png");
  assert.equal(book.pages[0].scene.prompt_environment, "Bosco quieto");
  assert.equal(book.pages[0].scene.prompt_moment, "Lia ascolta");
  assert.deepEqual(book.meta.choices.setup, {});
  assert.equal(book.pages[2].text, "Etto arriva. Ora Etto accompagna Lia.");
  assert.deepEqual(
    book.pages[2].scene.layers.map((layer) => layer.role),
    ["helper", "protagonist"]
  );
  assert.equal(book.cover.subtitle, "Un’avventura di Lia");
  assert.equal((bookToMarkdown(book).match(/---/g) || []).length, 2);
});

test("rejects a missing branch choice", () => {
  assert.throws(
    () =>
      composeStory({
        story,
        scenes,
        contentByRef,
        catalog,
        choices: { ...baseChoices, cast: { helper: "etto" }, branches: {} },
      }),
    (error) =>
      error instanceof StoryCompositionError &&
      error.code === "BRANCH_CHOICE_REQUIRED"
  );
});

test("rejects a helper unavailable on the chosen branch", () => {
  assert.throws(
    () =>
      composeStory({
        story,
        scenes,
        contentByRef,
        catalog,
        choices: {
          ...baseChoices,
          cast: { helper: "ulivo" },
          branches: { d_sentiero: "felci" },
        },
      }),
    (error) =>
      error instanceof StoryCompositionError &&
      error.code === "HELPER_NOT_ALLOWED"
  );
});

test("composes named cast slots from user and catalog sources", () => {
  const namedStory = {
    slug: "playtime",
    title: "Giochiamo",
    start: "s1",
    cast_slots: [
      { key: "protagonist", introduced_at: "start" },
      { key: "playmate", introduced_at: "s1" },
    ],
    steps: [
      {
        key: "s1",
        content_ref: "play.md",
        decision: {
          type: "cast",
          key: "choose_playmate",
          slot: "playmate",
          allowed_sources: ["user_character", "catalog_character"],
          catalog_roster: [{ key: "etto", entrance_ref: "etto-entry.md" }],
          user_character_entrance_ref: "user-entry.md",
        },
        next: null,
      },
    ],
  };
  const namedScenes = {
    scenes: {
      s1: {
        background_ref: "play.png",
        slots: [
          { role: "protagonist", pose: "in_piedi", x: 0.3, y: 0.9, scale: 0.3, z: 1 },
          { role: "playmate", pose: "in_piedi", x: 0.7, y: 0.9, scale: 0.3, z: 2 },
        ],
      },
    },
  };
  const namedContent = {
    "play.md": "[ENTRATA:playmate] [PERSONAGGIO:protagonist] gioca con [PERSONAGGIO:playmate].",
    "etto-entry.md": "Etto arriva.",
    "user-entry.md": "Arriva qualcuno di speciale.",
  };

  const personal = composeStory({
    story: namedStory,
    scenes: namedScenes,
    contentByRef: namedContent,
    catalog,
    choices: {
      story: "playtime",
      cast: {
        protagonist: { source: "user_character", name: "Anna", asset_ref: "anna.png" },
        playmate: { source: "user_character", name: "Luca", asset_ref: "luca.png" },
      },
    },
  });
  assert.equal(personal.pages[0].text, "Arriva qualcuno di speciale. Anna gioca con Luca.");
  assert.deepEqual(personal.pages[0].scene.layers.map((layer) => layer.role), ["protagonist", "playmate"]);

  const dreamtaily = composeStory({
    story: namedStory,
    scenes: namedScenes,
    contentByRef: namedContent,
    catalog,
    choices: {
      story: "playtime",
      cast: {
        protagonist: { source: "user_character", name: "Anna", asset_ref: "anna.png" },
        playmate: { source: "catalog_character", character_id: "etto" },
      },
    },
  });
  assert.equal(dreamtaily.pages[0].text, "Etto arriva. Anna gioca con Etto.");
});

test("resolves protagonist and cast markers in page titles",()=>{
  const markedStory=structuredClone(story);
  markedStory.steps[0].title="Cosa decide [Nome] con [PERSONAGGIO:helper]?";
  const book=composeStory({
    story:markedStory,
    scenes,
    contentByRef,
    catalog,
    choices:{...baseChoices,cast:{helper:"etto"},branches:{d_sentiero:"felci"}}
  });
  assert.equal(book.pages[0].title,"Cosa decide Lia con Etto?");
});
