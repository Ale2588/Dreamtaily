#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { composeStory, bookToMarkdown } from "../src/story-composer.js";

function parseArgs(argv) {
  const result = { choice: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--") && !result.storyJson) {
      result.storyJson = token;
      continue;
    }
    const key = token.replace(/^--/, "");
    const value = argv[index + 1];
    index += 1;
    if (key === "choice") result.choice.push(value);
    else result[key] = value;
  }
  return result;
}

async function collectContent(storyRoot, story) {
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

  const contentByRef = {};
  await Promise.all(
    [...refs].map(async (ref) => {
      contentByRef[ref] = await fs.readFile(path.join(storyRoot, ref), "utf8");
    })
  );
  return contentByRef;
}

const args = parseArgs(process.argv.slice(2));
if (!args.storyJson || !args.output || !args.helper) {
  console.error(
    "Usage: node tools/render_story_js.mjs STORY_JSON --name Lia --helper etto " +
      "--choice atmosfera=notte --choice d_sentiero=felci --choice d_finale=promessa " +
      "--protagonist-asset assets/example.png --output output.md"
  );
  process.exit(2);
}

const storyPath = path.resolve(args.storyJson);
const storyRoot = path.dirname(storyPath);
const story = JSON.parse(await fs.readFile(storyPath, "utf8"));
const scenes = JSON.parse(
  await fs.readFile(path.join(storyRoot, "scene-pilot.json"), "utf8")
);
const contentByRef = await collectContent(storyRoot, story);
const branches = {};
const setup = {};

for (const item of args.choice || []) {
  const [key, value] = item.split("=", 2);
  if ((story.setup || []).some((entry) => entry.key === key)) setup[key] = value;
  else branches[key] = value;
}

const catalog = {
  etto: { name: "Etto", image: "assets/char/crayon/fox.png" },
  briciola: { name: "Briciola", image: "assets/char/water/rabbit.png" },
  fiamma: { name: "Fiamma", image: "assets/char/water/bear.png" },
  ulivo: { name: "Ulivo", image: "assets/char/paper/rabbit.png" },
  rubens: { name: "Rubens", image: "assets/char/paper/fox.png" },
};

const book = composeStory({
  story,
  scenes,
  contentByRef,
  catalog,
  choices: {
    story: story.slug,
    style: args.style || "papercut",
    protagonist: {
      name: args.name || "Lia",
      asset_ref: args["protagonist-asset"] || "assets/char/water/bear.png",
    },
    cast: { helper: args.helper },
    setup,
    branches,
  },
});

await fs.writeFile(path.resolve(args.output), bookToMarkdown(book), "utf8");
if (args.json) {
  await fs.writeFile(path.resolve(args.json), `${JSON.stringify(book, null, 2)}\n`, "utf8");
}
