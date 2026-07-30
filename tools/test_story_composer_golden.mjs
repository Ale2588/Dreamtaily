#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { composeStory, bookToMarkdown } from "../src/story-composer.js";

const repo = path.resolve(process.argv[2] || ".");
const storyRoot = path.join(repo, "stories", "il-bosco-dei-sussurri");
const rendersRoot = path.join(repo, "renders");

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function collectContent(story) {
  const refs = new Set();
  for (const step of story.steps || []) {
    if (step.content_ref) refs.add(step.content_ref);
    for (const variants of Object.values(step.variant_refs || {})) {
      for (const ref of Object.values(variants || {})) refs.add(ref);
    }
    for (const entry of step.decision?.catalog_roster || []) {
      if (entry.entrance_ref) refs.add(entry.entrance_ref);
    }
  }

  const map = {};
  for (const ref of refs) {
    map[ref] = await fs.readFile(path.join(storyRoot, ref), "utf8");
  }
  return map;
}

const story = await readJson(path.join(storyRoot, "story.json"));
const scenes = await readJson(path.join(storyRoot, "scene-pilot.json"));
const contentByRef = await collectContent(story);

const catalog = {
  etto: { name: "Etto", image: "assets/char/crayon/fox.png" },
  briciola: { name: "Briciola", image: "assets/char/water/rabbit.png" },
  fiamma: { name: "Fiamma", image: "assets/char/water/bear.png" },
  ulivo: { name: "Ulivo", image: "assets/char/paper/rabbit.png" },
  rubens: { name: "Rubens", image: "assets/char/paper/fox.png" },
};

const cases = [];
for (const atmosfera of ["notte", "tramonto"]) {
  for (const d_sentiero of ["felci", "ruscello"]) {
    const helpers =
      d_sentiero === "felci"
        ? ["etto", "briciola", "fiamma"]
        : ["ulivo", "briciola"];
    for (const helper of helpers) {
      for (const d_finale of ["promessa", "festa"]) {
        const book = composeStory({
          story,
          scenes,
          contentByRef,
          catalog,
          choices: {
            story: story.slug,
            protagonist: {
              name: "Lia",
              asset_ref: "assets/char/water/bear.png",
            },
            cast: { helper },
            setup: { atmosfera },
            branches: { d_sentiero, d_finale },
          },
        });
        cases.push({
          key: `${atmosfera}/${d_sentiero}/${helper}/${d_finale}`,
          markdown: bookToMarkdown(book).replace(/\r\n/g, "\n"),
        });
      }
    }
  }
}

let names;
try {
  names = (await fs.readdir(rendersRoot)).filter((name) => name.endsWith(".md"));
} catch {
  console.error(`Golden directory not found: ${rendersRoot}`);
  process.exit(1);
}

if (!names.length) {
  console.error(`No .md golden renders found in: ${rendersRoot}`);
  process.exit(1);
}

let failures = 0;
for (const name of names) {
  const actual = (await fs.readFile(path.join(rendersRoot, name), "utf8")).replace(/\r\n/g, "\n");
  const match = cases.find((item) => item.markdown === actual);
  if (!match) {
    failures += 1;
    console.error(`NO MATCH: renders/${name}`);
  } else {
    console.log(`MATCH: renders/${name} <- ${match.key}`);
  }
}

if (failures) {
  console.error(`Golden regression failed: ${failures}/${names.length} renders unmatched.`);
  process.exit(1);
}

console.log(`Golden regression OK: ${names.length} render(s) matched.`);
