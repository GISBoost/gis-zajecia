// Intrinsic size of a JPEG, PNG or MP4 in public/, read at build time. Width/height attributes
// let the browser reserve space before lazy media loads, so the page (and the journey lines
// aligned to it) does not shift while scrolling.
import { readFileSync } from 'node:fs';

export function mediaSize(src: string): { width: number; height: number } | undefined {
  const b = readFileSync(new URL(`../../public/${src}`, import.meta.url));
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9; ) {
      const m = b[i + 1];
      // SOF0..SOF15 except DHT (C4), JPG (C8) and DAC (CC) carry the frame size.
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  // MP4: the track header (tkhd) ends with width and height as 16.16 fixed point.
  for (let i = b.indexOf('tkhd'); i > 0; i = b.indexOf('tkhd', i + 4)) {
    const end = i - 4 + b.readUInt32BE(i - 4);
    const width = b.readUInt32BE(end - 8) >>> 16;
    const height = b.readUInt32BE(end - 4) >>> 16;
    if (width && height) return { width, height };
  }
  return undefined;
}
