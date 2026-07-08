/**
 * Converts icon.svg → icon.png (128×128).
 * Tries system tools first (rsvg-convert, Inkscape, ImageMagick).
 * Falls back to a pure Node.js PNG generator — zero dependencies required.
 *
 * Run once before packaging:  node generate-icon.js
 */

'use strict';

const { execSync } = require('child_process');
const zlib = require('zlib');
const path = require('path');
const fs = require('fs');

const SRC  = path.join(__dirname, 'icon.svg');
const OUT  = path.join(__dirname, 'icon.png');
const SIZE = 128;

// ─── 1. Try system converters ────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'rsvg-convert',
    cmd:  `rsvg-convert --width=${SIZE} --height=${SIZE} "${SRC}" -o "${OUT}"`
  },
  {
    name: 'Inkscape',
    cmd:  `inkscape --export-filename="${OUT}" --export-width=${SIZE} --export-height=${SIZE} "${SRC}"`
  },
  {
    name: 'ImageMagick',
    cmd:  `magick convert -background none -resize ${SIZE}x${SIZE} "${SRC}" "${OUT}"`
  }
];

for (const tool of TOOLS) {
  try {
    execSync(tool.cmd, { stdio: 'pipe' });
    console.log(`✓  icon.png created with ${tool.name}`);
    process.exit(0);
  } catch { /* not available */ }
}

// ─── 2. Pure-Node fallback ───────────────────────────────────────────────────

console.log('No SVG converter found — generating icon.png with built-in Node.js renderer.');

// CRC-32 (required by PNG spec)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const len  = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const tb   = Buffer.from(type);
  const crcB = Buffer.alloc(4); crcB.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([len, tb, data, crcB]);
}

// ─── Pixel buffer ────────────────────────────────────────────────────────────

const buf = new Uint8Array(SIZE * SIZE * 4); // RGBA, starts fully transparent

function px(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  const fa = a / 255;
  buf[i]     = Math.round(buf[i]     * (1 - fa) + r * fa);
  buf[i + 1] = Math.round(buf[i + 1] * (1 - fa) + g * fa);
  buf[i + 2] = Math.round(buf[i + 2] * (1 - fa) + b * fa);
  buf[i + 3] = 255;
}

function fillRect(x0, y0, w, h, r, g, b, a = 255) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      px(x0 + dx, y0 + dy, r, g, b, a);
}

function fillCircle(cx, cy, rad, r, g, b, aa = true) {
  const r2 = rad * rad;
  for (let dy = -rad - 1; dy <= rad + 1; dy++) {
    for (let dx = -rad - 1; dx <= rad + 1; dx++) {
      const d2 = dx * dx + dy * dy;
      if (!aa) {
        if (d2 <= r2) px(cx + dx, cy + dy, r, g, b);
      } else {
        const d = Math.sqrt(d2);
        const alpha = Math.max(0, Math.min(1, rad + 0.5 - d));
        if (alpha > 0) px(cx + dx, cy + dy, r, g, b, Math.round(alpha * 255));
      }
    }
  }
}

function strokeLine(x1, y1, x2, y2, thick, r, g, b) {
  const dx = x2 - x1, dy = y2 - y1;
  const steps = Math.ceil(Math.sqrt(dx * dx + dy * dy) * 2);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    fillCircle(Math.round(x1 + dx * t), Math.round(y1 + dy * t), thick / 2, r, g, b);
  }
}

// ─── Draw background (rounded square #1E1E3F → #0D0D2B gradient) ────────────

const CR = 20; // corner radius
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    // Rounded corners
    let inside = true;
    if (x < CR     && y < CR)           inside = (x - CR)       ** 2 + (y - CR)       ** 2 <= CR * CR;
    if (x >= SIZE-CR && y < CR)         inside = (x - (SIZE-CR-1))**2 + (y - CR)       ** 2 <= CR * CR;
    if (x < CR     && y >= SIZE-CR)     inside = (x - CR)       ** 2 + (y - (SIZE-CR-1))**2 <= CR * CR;
    if (x >= SIZE-CR && y >= SIZE-CR)   inside = (x - (SIZE-CR-1))**2 + (y - (SIZE-CR-1))**2 <= CR * CR;
    if (!inside) continue;

    const t = (x + y) / (SIZE * 2);
    px(x, y,
      Math.round(0x1E + (0x0D - 0x1E) * t),
      Math.round(0x1E + (0x0D - 0x1E) * t),
      Math.round(0x3F + (0x2B - 0x3F) * t)
    );
  }
}

// ─── Draw letter "N" (white, thick strokes) ──────────────────────────────────
// Bounding box: x 14–76, y 18–108

const T   = 9;     // stroke thickness (px)
const NX1 = 18, NX2 = 76;
const NY1 = 18, NY2 = 106;

strokeLine(NX1, NY1, NX1, NY2, T, 255, 255, 255);   // left vertical
strokeLine(NX2, NY1, NX2, NY2, T, 255, 255, 255);   // right vertical
strokeLine(NX1, NY1, NX2, NY2, T, 255, 255, 255);   // diagonal

// ─── Red badge circle top-right (#E63946) ───────────────────────────────────

const BCX = 95, BCY = 30, BR = 22;
fillCircle(BCX, BCY, BR, 0xE6, 0x39, 0x46, false);

// ─── Draw "10" inside badge (white pixel-art digits) ─────────────────────────

// "1" — a single vertical bar
const O1X = 84, D_TOP = 19, D_BOT = 41;
fillRect(O1X, D_TOP, 3, D_BOT - D_TOP, 255, 255, 255);

// "0" — a hollow oval drawn as thick ring
const O0CX = 100, O0CY = 30;
for (let angle = 0; angle < 360; angle += 2) {
  const rad = angle * Math.PI / 180;
  const ox = Math.round(O0CX + 6.5 * Math.cos(rad));
  const oy = Math.round(O0CY + 9.5 * Math.sin(rad));
  fillCircle(ox, oy, 2.5, 255, 255, 255, false);
}
// Punch hole inside the O
fillCircle(O0CX, O0CY, 4, 0xE6, 0x39, 0x46, false);

// ─── Encode as PNG ───────────────────────────────────────────────────────────

const rows = [];
for (let y = 0; y < SIZE; y++) {
  const row = Buffer.alloc(1 + SIZE * 4);
  row[0] = 0; // filter: None
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4;
    row[1 + x * 4]     = buf[i];
    row[1 + x * 4 + 1] = buf[i + 1];
    row[1 + x * 4 + 2] = buf[i + 2];
    row[1 + x * 4 + 3] = buf[i + 3];
  }
  rows.push(row);
}

const compressed = zlib.deflateSync(Buffer.concat(rows), { level: 9 });

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0))
]);

fs.writeFileSync(OUT, png);
console.log(`✓  icon.png created (${SIZE}×${SIZE}, ${png.length} bytes)`);
