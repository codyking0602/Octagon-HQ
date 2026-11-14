import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

function dimensions(file: Buffer) {
  const type = file.toString("ascii", 12, 16);
  if (type === "VP8X") {
    return [
      1 + file.readUIntLE(24, 3),
      1 + file.readUIntLE(27, 3),
    ];
  }
  if (type === "VP8 ") {
    return [file.readUInt16LE(26) & 0x3fff, file.readUInt16LE(28) & 0x3fff];
  }
  if (type === "VP8L") {
    const encoded = file.readUInt32LE(21);
    return [1 + (encoded & 0x3fff), 1 + ((encoded >> 14) & 0x3fff)];
  }
  throw new Error("Unknown WebP codec " + type);
}

describe("UFC Home high-density portrait proofs", () => {
  it.each(["ciryl-gane", "kayla-harrison", "amanda-nunes"])(
    "%s ships a real 640x640 Home-only WebP and preserves the compact 160px thumbnail",
    (slug) => {
      const path = "public/assets/fighters/" + slug;
      const home = readFileSync(path + ".home.webp");
      const thumb = readFileSync(path + "-thumb.webp");
      for (const image of [home, thumb]) {
        expect(image.toString("ascii", 0, 4)).toBe("RIFF");
        expect(image.toString("ascii", 8, 12)).toBe("WEBP");
      }
      expect(dimensions(home)).toEqual([640, 640]);
      expect(dimensions(thumb)).toEqual([160, 160]);
      expect(home.byteLength).toBeGreaterThan(12000);
      expect(home.byteLength).toBeLessThan(250_000);
      expect(statSync(path + ".home.webp").size).toBe(home.byteLength);
    },
  );
});
