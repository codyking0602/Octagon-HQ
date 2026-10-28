import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type WebpInfo = { width: number; height: number; alpha: boolean };
function webpInfo(file: Buffer): WebpInfo {
  expect(file.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(file.subarray(8, 12).toString("ascii")).toBe("WEBP");
  let pos = 12;
  while (pos + 8 <= file.length) {
    const tag = file.subarray(pos, pos + 4).toString("ascii");
    const size = file.readUInt32LE(pos + 4);
    const off = pos + 8;
    if (tag === "VP8X") return {
      width: file.readUIntLE(off + 4, 3) + 1,
      height: file.readUIntLE(off + 7, 3) + 1,
      alpha: Boolean(file[off]! & 0x10),
    };
    if (tag === "VP8 " && file.subarray(off + 3, off + 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))) {
      return { width: file.readUInt16LE(off + 6) & 0x3fff, height: file.readUInt16LE(off + 8) & 0x3fff, alpha: false };
    }
    if (tag === "VP8L" && file[off] === 0x2f) {
      const a = file[off + 1]!, b = file[off + 2]!, c = file[off + 3]!, d = file[off + 4]!;
      return { width: 1 + a + ((b & 0x3f) << 8), height: 1 + (b >> 6) + (c << 2) + ((d & 0xf) << 10), alpha: Boolean(d & 0x10) };
    }
    pos = off + size + size % 2;
  }
  throw new Error("WebP dimensions could not be decoded.");
}

describe("Uploaded NBA Millionaire hosts", () => {
  it.each([1, 2, 3])("keeps the real NBA %i WebP image available", (number) => {
    const file = readFileSync(`public/assets/millionaire/NBA ${number}.webp`);
    expect(file.length).toBeGreaterThan(100_000);
    const info = webpInfo(file);
    expect(info.width).toBeGreaterThan(200);
    expect(info.height).toBeGreaterThan(200);
    console.info(`NBA Millionaire host ${number}: ${info.width}x${info.height}, alpha=${info.alpha}`);
  });
});
