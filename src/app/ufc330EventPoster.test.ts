import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const eventAssets = readFileSync("src/features/picks/picksEventAssets.ts", "utf8");
const main = readFileSync("src/main.tsx", "utf8");
const fillStyles = readFileSync("src/styles/picks-ufc330-poster.css", "utf8");

describe("UFC 330 event poster", () => {
  it("uses the existing Picks event-poster owner and fills the hero with renderable art", () => {
    expect(eventAssets).toContain('"ian-machado-garry:islam-makhachev"');
    expect(eventAssets).toContain("https://www.xfinitymobilearena.com/assets/img/1440x535-be7725b165.png");
    expect(eventAssets).toContain('aspectRatio: "800 / 391"');
    expect(eventAssets.match(/const posterByMainEvent/g)).toHaveLength(1);
    expect(main).toContain('import "./styles/picks-ufc330-poster.css";');
    expect(fillStyles).toContain("background-size: cover, cover, cover");
  });
});
