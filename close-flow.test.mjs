import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const h=fs.readFileSync(new URL("./index.html",import.meta.url),"utf8");
test("snapshot",()=>assert.ok(h.includes("dtPersistContentSnapshot(dtComposedBook)")));
test("render",()=>assert.ok(h.includes('functions.invoke("render-book"')));
test("delivery",()=>assert.ok(h.includes("libro.html?slug=")));
test("library",()=>assert.ok(h.includes("FINAL_RENDER_NOT_FOUND")));
