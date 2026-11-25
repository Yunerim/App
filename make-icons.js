// Generates icon-192.png and icon-512.png (cookie icon) without dependencies.
const zlib = require("zlib");
const fs = require("fs");
const T = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc(b) { let t = 0xffffffff; for (const x of b) t = (t >>> 8) ^ T[(t ^ x) & 255]; return (t ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, cb]);
}
function png(size, path) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const cx = size / 2, cy = size / 2, r = size / 2 - 6;
  const chips = [[0.33, 0.35, 0.13], [0.60, 0.27, 0.10], [0.75, 0.52, 0.12], [0.47, 0.70, 0.11], [0.27, 0.57, 0.09], [0.65, 0.75, 0.08], [0.40, 0.22, 0.07]];
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4); row[0] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
      let R = 0, G = 0, B = 0, A = 0;
      if (d <= r) {
        const fx = dx / r, fy = dy / r;
        const l = Math.max(0, 1 - ((fx * 0.35 + fy * 0.3 + 1) / 2) * 0.35 + 0.1);
        R = Math.min(255, Math.round(201 * (0.72 + 0.4 * l)));
        G = Math.min(255, Math.round(138 * (0.72 + 0.4 * l)));
        B = Math.round(75 * (0.72 + 0.4 * l));
        for (const [px, py, pr] of chips) {
          const cdx = x - px * size, cdy = y - py * size;
          if (cdx * cdx + cdy * cdy < (pr * size) * (pr * size)) { R = 91; G = 58; B = 30; }
        }
        A = 255;
      }
      row[1 + x * 4] = R; row[2 + x * 4] = G; row[3 + x * 4] = B; row[4 + x * 4] = A;
    }
    rows.push(row);
  }
  const idat = zlib.deflateSync(Buffer.concat(rows));
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(path, Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]));
  console.log("wrote", path);
}
function maskable(size, path) {
  // Same cookie but smaller (icon fills only the middle 80% so the circle crop doesn't clip it)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const cx = size / 2, cy = size / 2, r = (size / 2 - 6) * 0.8;
  const chips = [[0.33,0.35,0.13],[0.60,0.27,0.10],[0.75,0.52,0.12],[0.47,0.70,0.11],[0.27,0.57,0.09],[0.65,0.75,0.08],[0.40,0.22,0.07]];
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4); row[0] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
      let R = 43, G = 29, B = 18, A = 255; // brown background fills the full square
      if (d <= r) {
        const fx = dx / r, fy = dy / r;
        const l = Math.max(0, 1 - ((fx * 0.35 + fy * 0.3 + 1) / 2) * 0.35 + 0.1);
        R = Math.min(255, Math.round(201 * (0.72 + 0.4 * l)));
        G = Math.min(255, Math.round(138 * (0.72 + 0.4 * l)));
        B = Math.round(75 * (0.72 + 0.4 * l));
        for (const [px, py, pr] of chips) {
          const cdx = x - px * size * 0.8 - cx * 0.2, cdy = y - py * size * 0.8 - cy * 0.2;
          if (cdx * cdx + cdy * cdy < (pr * size * 0.8) * (pr * size * 0.8)) { R = 91; G = 58; B = 30; }
        }
      }
      row[1 + x * 4] = R; row[2 + x * 4] = G; row[3 + x * 4] = B; row[4 + x * 4] = A;
    }
    rows.push(row);
  }
  const idat = zlib.deflateSync(Buffer.concat(rows));
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(path, Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]));
  console.log("wrote", path);
}
function monochrome(size, path) {
  // Single-color cookie silhouette on transparent bg (for Android 13+ themed icons)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const cx = size / 2, cy = size / 2, r = (size / 2 - 6) * 0.8;
  const chips = [[0.33,0.35,0.13],[0.60,0.27,0.10],[0.75,0.52,0.12],[0.47,0.70,0.11],[0.27,0.57,0.09],[0.65,0.75,0.08],[0.40,0.22,0.07]];
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4); row[0] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
      let R = 255, G = 255, B = 255, A = 0;
      if (d <= r) {
        A = 255;
        for (const [px, py, pr] of chips) {
          const cdx = x - px * size * 0.8 - cx * 0.2, cdy = y - py * size * 0.8 - cy * 0.2;
          if (cdx * cdx + cdy * cdy < (pr * size * 0.8) * (pr * size * 0.8)) A = 0; // chips punched out
        }
      }
      row[1 + x * 4] = R; row[2 + x * 4] = G; row[3 + x * 4] = B; row[4 + x * 4] = A;
    }
    rows.push(row);
  }
  const idat = zlib.deflateSync(Buffer.concat(rows));
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(path, Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]));
  console.log("wrote", path);
}
png(192, "icons/icon-192.png");
png(512, "icons/icon-512.png");
maskable(512, "icons/icon-maskable-512.png");
monochrome(512, "icons/icon-monochrome-512.png");
