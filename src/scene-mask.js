/**
 * DreamTaily scene mask generator.
 *
 * Pure contracts:
 * buildMaskRects(slots, filledRoles) -> normalized rects
 * renderMaskPNG(rects, width, height) -> Uint8Array PNG
 *
 * Coordinate system: normalized 0..1, anchor = feet_center.
 *
 * Internal convention follows the authoring brief:
 *   white RGB = editable region
 *   black RGB = protected region
 *
 * OpenAI Image API additionally requires an alpha channel. For the API mask:
 *   editable region alpha = 0 (transparent)
 *   protected region alpha = 255 (opaque)
 *
 * No network, DOM, Canvas, Node built-ins, or external dependencies.
 */

const FIGURE_WIDTH_RATIO = 0.52;
const PADDING_RATIO = 0.12;
const TEXT_SAFE_Y = 0.34;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function normaliseRoles(filledRoles) {
  if (filledRoles instanceof Set) return filledRoles;
  if (Array.isArray(filledRoles)) return new Set(filledRoles);
  if (filledRoles && typeof filledRoles === "object") {
    return new Set(
      Object.entries(filledRoles)
        .filter(([, filled]) => Boolean(filled))
        .map(([role]) => role)
    );
  }
  return new Set();
}

function intersects(a, b) {
  return !(
    a.x1 < b.x0 ||
    b.x1 < a.x0 ||
    a.y1 < b.y0 ||
    b.y1 < a.y0
  );
}

function mergePair(a, b) {
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
  };
}

function mergeRects(rects) {
  const result = rects.map((rect) => ({ ...rect }));
  let changed = true;

  while (changed) {
    changed = false;
    outer: for (let i = 0; i < result.length; i += 1) {
      for (let j = i + 1; j < result.length; j += 1) {
        if (!intersects(result[i], result[j])) continue;
        result[i] = mergePair(result[i], result[j]);
        result.splice(j, 1);
        changed = true;
        break outer;
      }
    }
  }

  return result;
}

function expandRect(rect) {
  const width = rect.x1 - rect.x0;
  const height = rect.y1 - rect.y0;
  const dx = width * PADDING_RATIO;
  const dy = height * PADDING_RATIO;

  return {
    x0: clamp(rect.x0 - dx),
    y0: clamp(rect.y0 - dy, TEXT_SAFE_Y, 1),
    x1: clamp(rect.x1 + dx),
    y1: clamp(rect.y1 + dy),
  };
}

export function buildMaskRects(slots = [], filledRoles = []) {
  const roles = normaliseRoles(filledRoles);

  const raw = (Array.isArray(slots) ? slots : [])
    .filter((slot) => slot && roles.has(slot.role))
    .map((slot) => {
      const h = Number(slot.scale);
      const x = Number(slot.x);
      const y = Number(slot.y);

      if (![h, x, y].every(Number.isFinite) || h <= 0) return null;

      const w = h * FIGURE_WIDTH_RATIO;
      return {
        x0: clamp(x - w / 2),
        y0: clamp(y - h),
        x1: clamp(x + w / 2),
        y1: clamp(y),
      };
    })
    .filter(Boolean);

  if (!raw.length) return [];

  const merged = mergeRects(raw)
    .map(expandRect)
    .filter((rect) => rect.x1 > rect.x0 && rect.y1 > rect.y0);

  return mergeRects(merged).map((rect) => ({
    x0: clamp(rect.x0),
    y0: clamp(rect.y0, TEXT_SAFE_Y, 1),
    x1: clamp(rect.x1),
    y1: clamp(rect.y1),
  }));
}

export function renderMaskRGBA(rects = [], width, height) {
  width = Number(width);
  height = Number(height);
  if (!Number.isInteger(width) || width <= 0) {
    throw new TypeError("width must be a positive integer");
  }
  if (!Number.isInteger(height) || height <= 0) {
    throw new TypeError("height must be a positive integer");
  }

  const pixels = new Uint8Array(width * height * 4);

  // Protected region: black + fully opaque.
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 0;
    pixels[i + 1] = 0;
    pixels[i + 2] = 0;
    pixels[i + 3] = 255;
  }

  for (const rect of rects) {
    const x0 = Math.max(0, Math.floor(clamp(rect.x0) * width));
    const y0 = Math.max(0, Math.floor(clamp(rect.y0) * height));
    const x1 = Math.min(width, Math.ceil(clamp(rect.x1) * width));
    const y1 = Math.min(height, Math.ceil(clamp(rect.y1) * height));

    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const offset = (y * width + x) * 4;
        pixels[offset] = 255;
        pixels[offset + 1] = 255;
        pixels[offset + 2] = 255;
        pixels[offset + 3] = 0; // transparent = editable in Image API mask
      }
    }
  }

  return pixels;
}

function writeU32BE(target, offset, value) {
  target[offset] = (value >>> 24) & 0xff;
  target[offset + 1] = (value >>> 16) & 0xff;
  target[offset + 2] = (value >>> 8) & 0xff;
  target[offset + 3] = value & 0xff;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(bytes) {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  for (const byte of bytes) {
    a = (a + byte) % MOD;
    b = (b + a) % MOD;
  }
  return ((b << 16) | a) >>> 0;
}

function zlibStore(bytes) {
  const chunks = [Uint8Array.of(0x78, 0x01)];
  let offset = 0;

  while (offset < bytes.length) {
    const remaining = bytes.length - offset;
    const length = Math.min(65535, remaining);
    const final = offset + length >= bytes.length ? 1 : 0;
    const block = new Uint8Array(5 + length);

    block[0] = final; // BFINAL + BTYPE=00, aligned to byte boundary
    block[1] = length & 0xff;
    block[2] = (length >>> 8) & 0xff;
    const nlen = (~length) & 0xffff;
    block[3] = nlen & 0xff;
    block[4] = (nlen >>> 8) & 0xff;
    block.set(bytes.subarray(offset, offset + length), 5);

    chunks.push(block);
    offset += length;
  }

  const checksum = new Uint8Array(4);
  writeU32BE(checksum, 0, adler32(bytes));
  chunks.push(checksum);

  return concatBytes(chunks);
}

function concatBytes(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function pngChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  writeU32BE(chunk, 0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  writeU32BE(chunk, 8 + data.length, crc32(concatBytes([typeBytes, data])));
  return chunk;
}

export function renderMaskPNG(rects = [], width, height) {
  const rgba = renderMaskRGBA(rects, width, height);
  const scanlines = new Uint8Array(height * (1 + width * 4));

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // PNG filter: None
    scanlines.set(
      rgba.subarray(y * width * 4, (y + 1) * width * 4),
      rowOffset + 1
    );
  }

  const ihdr = new Uint8Array(13);
  writeU32BE(ihdr, 0, width);
  writeU32BE(ihdr, 4, height);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return concatBytes([
    Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlibStore(scanlines)),
    pngChunk("IEND", new Uint8Array()),
  ]);
}

export const MASK_CONSTANTS = Object.freeze({
  FIGURE_WIDTH_RATIO,
  PADDING_RATIO,
  TEXT_SAFE_Y,
});
