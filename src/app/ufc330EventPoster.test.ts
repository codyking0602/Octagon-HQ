import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const eventAssets = readFileSync("src/features/picks/picksEventAssets.ts", "utf8");

describe("UFC 330 event poster", () => {
  it("uses the existing Picks event-poster owner for Makhachev vs. Machado Garry", () => {
    expect(eventAssets).toContain('"ian-machado-garry:islam-makhachev"');
    expect(eventAssets).toContain("https://www.xfinitymobilearena.com/assets/img/1440x535-be7725b165.png");
    expect(eventAssets.match(/const posterByMainEvent/g)).toHaveLength(1);
  });
});
