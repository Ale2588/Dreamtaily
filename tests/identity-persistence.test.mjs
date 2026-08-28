import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("saveCharacter imports canonical identity compiler", () => {
  assert.match(html, /import\("\.\/src\/identity-prompt\.js"\)/);
});

test("saveCharacter persists identity_prompt", () => {
  assert.match(html, /identity_prompt:identityPrompt/);
});

test("character library reads identity_prompt", () => {
  assert.match(
    html,
    /traits,\s*identity_prompt,\s*default_style,/
  );
});

test("story composer source is not embedded or modified here", () => {
  assert.doesNotMatch(html, /function buildIdentityPrompt\s*\(/);
});
