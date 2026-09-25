import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const backoffice = await readFile(new URL("../backoffice.html", import.meta.url), "utf8");

test("auth redirects follow the current browser origin instead of a deployment host", () => {
  assert.match(html, /const redirect=new URL\(location\.href\)/);
  assert.match(html, /emailRedirectTo:redirect\.href/);
  assert.doesNotMatch(html, /emailRedirectTo:\s*["'`]https?:\/\//);
  assert.match(backoffice, /emailRedirectTo:location\.href\.split\('#'\)\[0\]\.split\('\?'\)\[0\]/);
});

test("final-book links are built from the current origin", () => {
  assert.match(html, /`\$\{location\.origin\}[\s\S]*libro\.html\?slug=/);
  assert.doesNotMatch(html, /https?:\/\/(?:[^/"'`]+)\/[^"'`]*libro\.html\?slug=/);
});

test("the production frontend contains no hard-coded preview hosting origin", () => {
  assert.doesNotMatch(html, /ale2588\.github\.io|localhost|127\.0\.0\.1|netlify\.app|vercel\.app|pages\.dev/);
});
