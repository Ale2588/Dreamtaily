import test from "node:test";
import assert from "node:assert/strict";
import { buildImagePdf } from "../src/book/pdf-export.js";

test("image PDF has one fixed-size page per JPEG and a valid cross-reference", async () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]);
  const blob = buildImagePdf({
    jpegs: [jpeg, jpeg],
    width: 680.315,
    height: 510.24,
    imageWidth: 2835,
    imageHeight: 2126
  });
  assert.equal(blob.type, "application/pdf");
  const value = new TextDecoder("latin1").decode(await blob.arrayBuffer());
  assert.ok(value.startsWith("%PDF-1.4"));
  assert.match(value, /\/Count 2/);
  assert.equal((value.match(/\/MediaBox \[0 0 680\.315 510\.24\]/g) || []).length, 2);
  assert.equal((value.match(/\/Width 2835 \/Height 2126/g) || []).length, 2);
  const start = Number(value.match(/startxref\n(\d+)/)?.[1]);
  assert.equal(value.slice(start, start + 4), "xref");
  assert.ok(value.endsWith("%%EOF"));
});

test("image PDF refuses an empty book", () => {
  assert.throws(() => buildImagePdf({ jpegs: [], width: 1, height: 1, imageWidth: 1, imageHeight: 1 }), /PDF_PAGES_EMPTY/);
});
