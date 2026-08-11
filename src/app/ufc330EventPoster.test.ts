import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const eventAssets = readFileSync("src/features/picks/picksEventAssets.ts", "utf8");
const main = readFileSync("src/main.tsx", "utf8");
const croppedPoster = readFileSync("public/events/ufc-330-cropped.webp");

describe("UFC 330 event poster", () => {
  it("uses the supplied crop at its native ratio through the existing Picks poster owner", () => {
    expect(eventAssets).toContain('"ian-machado-garry:islam-makhachev"');
    expect(eventAssets).toContain('src: "/events/ufc-330-cropped.webp"');
    expect(eventAssets).toContain('aspectRatio: "640 / 313"');
    expect(eventAssets.match(/const posterByMainEvent/g)).toHaveLength(1);
    expect(croppedPoster.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(croppedPoster.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(main).not.toContain('import "./styles/picks-ufc330-poster.css";');
    expect(existsSync("src/styles/picks-ufc330-poster.css")).toBe(false);
  });
});
