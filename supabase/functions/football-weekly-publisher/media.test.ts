import { describe, expect, it } from "vitest";
import { footballWebpDimensions } from "./media";

function header(chunk: "VP8 " | "VP8X" | "VP8L") {
  const bytes = new Uint8Array(64);
  for (const [at, token] of [[0, "RIFF"], [8, "WEBP"], [12, chunk]] as const) {
    [...token].forEach((ch, i) => { bytes[at + i] = ch.charCodeAt(0); });
  }
  return bytes;
}

describe("private Football weekly publisher WebP verification", () => {
  it("checks true 720x900 lossy WebP geometry", () => {
    const buffer = header("VP8 ");
    buffer[23] = 0x9d; buffer[24] = 0x01; buffer[25] = 0x2a;
    buffer[26] = 0xd0; buffer[27] = 0x02;
    buffer[28] = 0x84; buffer[29] = 0x03;
    expect(footballWebpDimensions(buffer)).toEqual({ width: 720, height: 900 });
  });
  it("checks 1600x900 extended WebP geometry", () => {
    const buffer = header("VP8X");
    buffer[24] = 0x3f; buffer[25] = 0x06;
    buffer[27] = 0x83; buffer[28] = 0x03;
    expect(footballWebpDimensions(buffer)).toEqual({ width: 1600, height: 900 });
  });
  it("fails closed for corrupt/unrecognized image payloads", () => {
    const payload = header("VP8 ");
    expect(() => footballWebpDimensions(payload)).toThrow();
    expect(() => footballWebpDimensions(new Uint8Array(64))).toThrow();
  });
});
