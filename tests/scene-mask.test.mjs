import test from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import {
  buildMaskRects,
  renderMaskPNG,
  renderMaskRGBA,
  MASK_CONSTANTS,
} from "../src/scene-mask.js";

function close(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
}

test("single filled slot produces one padded feet-anchored rect", () => {
  const rects = buildMaskRects(
    [{ role: "protagonist", x: 0.5, y: 0.9, scale: 0.4 }],
    ["protagonist"]
  );
  assert.equal(rects.length, 1);

  const baseW = 0.4 * MASK_CONSTANTS.FIGURE_WIDTH_RATIO;
  close(rects[0].x0, 0.5 - baseW / 2 - baseW * 0.12);
  close(rects[0].x1, 0.5 + baseW / 2 + baseW * 0.12);
  close(rects[0].y0, 0.5 - 0.4 * 0.12);
  close(rects[0].y1, 0.9 + 0.4 * 0.12);
});

test("overlapping slots are merged", () => {
  const rects = buildMaskRects(
    [
      { role: "protagonist", x: 0.5, y: 0.9, scale: 0.4 },
      { role: "helper", x: 0.54, y: 0.9, scale: 0.35 },
    ],
    ["protagonist", "helper"]
  );
  assert.equal(rects.length, 1);
});

test("top edge is clamped below text-safe third", () => {
  const rects = buildMaskRects(
    [{ role: "protagonist", x: 0.5, y: 0.5, scale: 0.4 }],
    ["protagonist"]
  );
  assert.equal(rects.length, 1);
  assert.equal(rects[0].y0, 0.34);
});

test("unfilled roles are excluded", () => {
  const rects = buildMaskRects(
    [
      { role: "protagonist", x: 0.4, y: 0.9, scale: 0.35 },
      { role: "helper", x: 0.7, y: 0.9, scale: 0.25 },
    ],
    ["protagonist"]
  );
  assert.equal(rects.length, 1);
  assert.ok(rects[0].x1 < 0.6);
});

test("RGBA uses transparent alpha in editable region and opaque alpha outside", () => {
  const rgba = renderMaskRGBA([{ x0: 0.25, y0: 0.25, x1: 0.75, y1: 0.75 }], 4, 4);
  const at = (x, y) => rgba[(y * 4 + x) * 4 + 3];
  assert.equal(at(0, 0), 255);
  assert.equal(at(1, 1), 0);
  assert.equal(at(2, 2), 0);
  assert.equal(at(3, 3), 255);
});

test("renderMaskPNG emits a valid RGBA PNG with alpha channel", () => {
  const png = renderMaskPNG([{ x0: 0.25, y0: 0.25, x1: 0.75, y1: 0.75 }], 16, 16);
  assert.deepEqual(
    [...png.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10]
  );

  // IHDR color type byte = 6 (RGBA)
  assert.equal(png[25], 6);

  // Smoke-decode IDAT: collect chunks and inflate.
  let offset = 8;
  const idat = [];
  while (offset < png.length) {
    const length =
      (png[offset] << 24) |
      (png[offset + 1] << 16) |
      (png[offset + 2] << 8) |
      png[offset + 3];
    const type = new TextDecoder().decode(png.subarray(offset + 4, offset + 8));
    if (type === "IDAT") {
      idat.push(png.subarray(offset + 8, offset + 8 + length));
    }
    offset += 12 + length;
  }
  const joined = Buffer.concat(idat.map((part) => Buffer.from(part)));
  const decoded = inflateSync(joined);
  assert.equal(decoded.length, 16 * (1 + 16 * 4));
});
