import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const eventAssets = readFileSync("src/features/picks/picksEventAssets.ts", "utf8");
const croppedPoster = readFileSync("public/events/ufc-330-cropped.svg", "utf8");

describe("UFC 330 event poster", () => {
  it("uses the existing Picks event-poster owner for Makhachev vs. Machado Garry", () => {
    expect(eventAssets).toContain('"ian-machado-garry:islam-makhachev"');
    expect(eventAssets).toContain('src: "/events/ufc-330-cropped.svg"');
    expect(eventAssets).toContain('aspectRatio: "800 / 391"');
    expect(croppedPoster).toContain('viewBox="0 0 800 391"');
    expect(eventAssets.match(/const posterByMainEvent/g)).toHaveLength(1);
  });
});
