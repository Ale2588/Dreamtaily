#!/usr/bin/env node
/**
 * DreamTaily one-page render gate.
 *
 * Recommended scene: s3_felci with protagonist + Etto.
 *
 * Dry run (no API key required):
 *   node tools/test_render_one_page.mjs \
 *     --protagonist ./my-protagonist.png \
 *     --identity "a young child, ..." \
 *     --dry-run
 *
 * Live:
 *   OPENAI_API_KEY=... node tools/test_render_one_page.mjs \
 *     --protagonist ./my-protagonist.png \
 *     --identity "a young child, ..."
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildMaskRects, renderMaskPNG } from "../src/scene-mask.js";

const REPO = process.cwd();
const STORY_ROOT = path.join(REPO, "stories", "il-bosco-dei-sussurri");
const DEFAULT_SCENE = "s3_felci";
const DEFAULT_HELPER = "etto";
const DEFAULT_HELPER_IDENTITY =
  "a small rabbit, long ears held low, dark button nose, dusty-blue fabric patch on the left knee";

function parseArgs(argv) {
  const values = {
    scene: DEFAULT_SCENE,
    atmosphere: "giorno",
    helper: DEFAULT_HELPER,
    quality: "low",
    out: path.join(REPO, "tmp", "render-gate"),
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--dry-run") values.dryRun = true;
    else if (key === "--scene") values.scene = argv[++i];
    else if (key === "--atmosphere") values.atmosphere = argv[++i];
    else if (key === "--helper") values.helper = argv[++i];
    else if (key === "--quality") values.quality = argv[++i];
    else if (key === "--out") values.out = path.resolve(argv[++i]);
    else if (key === "--protagonist") values.protagonist = path.resolve(argv[++i]);
    else if (key === "--identity") values.identity = argv[++i];
    else throw new Error(`Unknown argument: ${key}`);
  }
  return values;
}

function readPngDimensions(bytes) {
  if (
    bytes.length < 24 ||
    bytes[0] !== 137 ||
    bytes[1] !== 80 ||
    bytes[2] !== 78 ||
    bytes[3] !== 71
  ) {
    throw new Error("BACKGROUND_NOT_PNG");
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function sceneBackground(definition, atmosphere) {
  if (atmosphere === "giorno") return definition.background_ref;
  return (
    definition.variant_backgrounds?.atmosfera?.[atmosphere] ||
    definition.background_ref
  );
}

function atmospherePrompt(value) {
  return {
    giorno: "gentle daylight",
    tramonto: "warm coral sunset",
    notte: "deep indigo night with silver moonlight",
  }[value] || value;
}

function buildPrompt({ identity, protagonistPose, helperIdentity, helperPose, atmosphere }) {
  return [
    "Edit ONLY the masked region of the provided background illustration.",
    "The FIRST input image is the approved background and its layout is authoritative.",
    "The SECOND input image is the protagonist identity reference.",
    "The THIRD input image, when present, is the helper identity reference.",
    "Place the character(s) into the scene, matching the existing cut-paper collage style exactly:",
    "same hand-cut paper texture, torn edges, matte surfaces, and the same lighting direction and colour temperature as the background.",
    "They must look built from the same paper, not pasted on.",
    "",
    `PROTAGONIST (use the second input image as identity reference): ${identity}. Pose: ${protagonistPose}.`,
    helperIdentity
      ? `HELPER (use the third input image as identity reference): ${helperIdentity}. Pose: ${helperPose}.`
      : "",
    "Correct relative scale; feet resting naturally on the ground plane.",
    `Atmosphere: ${atmospherePrompt(atmosphere)}.`,
    "",
    "Do NOT alter the composition outside the masked region.",
    "Do NOT render any text, letters, words or captions.",
  ].filter(Boolean).join("\n");
}

async function fileBlob(filename) {
  const bytes = await fs.readFile(filename);
  return new Blob([bytes], { type: "image/png" });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.protagonist) {
    throw new Error("--protagonist path is required");
  }
  if (!args.identity) {
    throw new Error("--identity text is required");
  }

  const contract = JSON.parse(
    await fs.readFile(path.join(STORY_ROOT, "scene-pilot.json"), "utf8")
  );
  const definition = contract.scenes?.[args.scene];
  if (!definition) throw new Error(`Unknown scene: ${args.scene}`);

  const bgRef = sceneBackground(definition, args.atmosphere);
  const bgPath = path.join(STORY_ROOT, bgRef);
  const bgBytes = await fs.readFile(bgPath).catch((error) => {
    if (error?.code === "ENOENT") {
      throw new Error(`BACKGROUND_MISSING:${bgPath}`);
    }
    throw error;
  });

  const { width, height } = readPngDimensions(bgBytes);

  const filledRoles = ["protagonist"];
  const helperSlot = (definition.slots || []).find((slot) => slot.role === "helper");
  const helperPath = args.helper
    ? path.join(REPO, "assets", "char", "paper", `${args.helper}_${helperSlot?.pose || "in_piedi"}.png`)
    : null;

  if (args.helper && helperSlot) filledRoles.push("helper");

  const rects = buildMaskRects(definition.slots || [], filledRoles);
  const mask = renderMaskPNG(rects, width, height);
  const protagonistSlot = (definition.slots || []).find((slot) => slot.role === "protagonist");

  const prompt = buildPrompt({
    identity: args.identity,
    protagonistPose: protagonistSlot?.pose || "in_piedi",
    helperIdentity: args.helper && helperSlot ? DEFAULT_HELPER_IDENTITY : "",
    helperPose: helperSlot?.pose || "in_piedi",
    atmosphere: args.atmosphere,
  });

  await fs.mkdir(args.out, { recursive: true });
  await fs.writeFile(path.join(args.out, "background.png"), bgBytes);
  await fs.writeFile(path.join(args.out, "mask.png"), mask);
  await fs.writeFile(
    path.join(args.out, "request.json"),
    JSON.stringify(
      {
        scene: args.scene,
        atmosphere: args.atmosphere,
        background: bgRef,
        width,
        height,
        filled_roles: filledRoles,
        mask_rects: rects,
        prompt,
      },
      null,
      2
    )
  );

  if (args.dryRun || !process.env.OPENAI_API_KEY) {
    console.log(`Dry run ready in ${args.out}`);
    console.log("Generated: background.png, mask.png, request.json");
    if (!process.env.OPENAI_API_KEY) {
      console.log("OPENAI_API_KEY is absent: no paid image request was made.");
    }
    return;
  }

  if (args.helper && helperSlot) {
    await fs.access(helperPath).catch(() => {
      throw new Error(`HELPER_ASSET_MISSING:${helperPath}`);
    });
  }

  const form = new FormData();
  form.append("model", "gpt-image-2");
  form.append("quality", args.quality);
  form.append("output_format", "png");
  form.append("size", `${width}x${height}`);
  form.append("prompt", prompt);

  // Official API behavior: mask applies to the first input image.
  form.append("image[]", await fileBlob(bgPath), "background.png");
  form.append("image[]", await fileBlob(args.protagonist), "protagonist.png");
  if (args.helper && helperSlot) {
    form.append("image[]", await fileBlob(helperPath), "helper.png");
  }
  form.append("mask", new Blob([mask], { type: "image/png" }), "mask.png");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `OPENAI_IMAGE_EDIT_${response.status}:${JSON.stringify(payload)}`
    );
  }

  const b64 = payload?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OPENAI_IMAGE_MISSING");

  await fs.writeFile(
    path.join(args.out, "result.png"),
    Buffer.from(b64, "base64")
  );

  console.log(`Gate result ready in ${args.out}`);
  console.log("Compare background.png, mask.png, and result.png visually before building the pipeline.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
