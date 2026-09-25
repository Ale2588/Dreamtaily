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
  editorial: { book_cover: { front: { title: "Il bosco di [Nome]", subtitle: "Una storia per [Nome]", layout: { gabbia: "Ritratto", catalog_version: 2, prompt_layout_instruction: "Keep the top calm." }, brand_variant: "dark" } } },
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
scenes.scenes.s1.authoring_note = "La campanella deve restare visibile accanto a [Nome]";
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

  assert.equal(book.pages.length, 2);
  assert.deepEqual(book.pages.map((page) => page.step_key), ["s1", "s3_felci"]);
  assert.deepEqual(book.pages.map((page) => page.chapter), [1, 2]);
  assert.equal(book.pages[0].text, "Ciao Lia.");
  assert.equal(book.pages[0].scene.bg, "s1.png");
  assert.equal(book.pages[0].scene.prompt_environment, "Bosco quieto");
  assert.equal(book.pages[0].scene.prompt_moment, "Lia ascolta");
  assert.equal(book.pages[0].scene.authoring_note, "La campanella deve restare visibile accanto a Lia");
  assert.deepEqual(book.meta.choices.setup, {});
  assert.equal(book.pages[1].text, "Etto arriva. Ora Etto accompagna Lia.");
  assert.deepEqual(
    book.pages[1].scene.layers.map((layer) => layer.role),
    ["helper", "protagonist"]
  );
  assert.equal(book.cover.title, "Il bosco dei sussurri");
  assert.equal(book.cover.subtitle, "Un’avventura di Lia");
  assert.equal(book.cover.layout, null);
  assert.equal(book.cover.brand_variant, null);
  assert.equal((bookToMarkdown(book).match(/---/g) || []).length, 1);
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

test("three branch choices steer the path but create zero final question pages", () => {
  const branchingStory = {
    slug: "three-forks",
    title: "Tre scelte",
    start: "q1",
    steps: [
      { key: "q1", title: "Prima domanda", content_ref: "q1", decision: { type: "branch", key: "one", options: [{ key: "a", next: "a1" }, { key: "x", next: "x1" }] } },
      { key: "a1", title: "Conseguenza A", content_ref: "a1", next: "q2" },
      { key: "x1", title: "Conseguenza X", content_ref: "x1", next: "q2" },
      { key: "q2", title: "Seconda domanda", content_ref: "q2", decision: { type: "branch", key: "two", options: [{ key: "b", next: "b1" }, { key: "y", next: "y1" }] } },
      { key: "b1", title: "Conseguenza B", content_ref: "b1", next: "q3" },
      { key: "y1", title: "Conseguenza Y", content_ref: "y1", next: "q3" },
      { key: "q3", title: "Terza domanda", content_ref: "q3", decision: { type: "branch", key: "three", options: [{ key: "c", next: "c1" }, { key: "z", next: "z1" }] } },
      { key: "c1", title: "Conseguenza C", content_ref: "c1", next: null },
      { key: "z1", title: "Conseguenza Z", content_ref: "z1", next: null },
    ],
  };
  const refs = Object.fromEntries(branchingStory.steps.map((step) => [step.content_ref, `Testo ${step.key}`]));
  const branchingScenes = { scenes: Object.fromEntries(branchingStory.steps.map((step) => [step.key, {
    background_ref: `${step.key}.png`,
    slots: [{ role: "protagonist", pose: "in_piedi", x: .5, y: .9, scale: .3, z: 1 }],
  }])) };
  const book = composeStory({
    story: branchingStory,
    scenes: branchingScenes,
    contentByRef: refs,
    choices: {
      story: branchingStory.slug,
      protagonist: { name: "Lia", asset_ref: "lia.png" },
      branches: { one: "a", two: "b", three: "c" },
    },
  });

  assert.deepEqual(book.pages.map((page) => page.step_key), ["a1", "b1", "c1"]);
  assert.equal(book.pages.filter((page) => page.step_key.startsWith("q")).length, 0);
  assert.deepEqual(book.pages.map((page) => page.chapter), [1, 2, 3]);
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
