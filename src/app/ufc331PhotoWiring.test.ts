import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const thumbnails = readFileSync("src/features/picks/FighterThumbnail.tsx", "utf8");
const spotlight = readFileSync("src/features/picks/MainEventSpotlight.tsx", "utf8");

describe("UFC 331 fight-week photo wiring", () => {
  it("wires Ryan Gandra and Ozzy Diaz into the Picks fighter thumbnails", () => {
    expect(thumbnails).toContain('["ryan-gandra", "https://a.espncdn.com/i/headshots/mma/players/full/5291085.png"]');
    expect(thumbnails).toContain('["ozzy-diaz", "https://a.espncdn.com/i/headshots/mma/players/full/4944080.png"]');
  });

  it("uses dedicated portrait assets for the Gable Steveson vs Sean Sharaf Spotlight", () => {
    expect(spotlight).toContain('["gable-steveson", "https://gidstats.com/img/fighters/0/0/1-3231.png"]');
    expect(spotlight).toContain('["sean-sharaf", "https://gidstats.com/img/fighters/0/0/1-2418.png"]');
    expect(spotlight).not.toContain('["gable-steveson", "https://a.espncdn.com/i/headshots/mma/players/full/5214652.png"]');
    expect(spotlight).not.toContain('["sean-sharaf", "https://a.espncdn.com/i/headshots/mma/players/full/5240957.png"]');
  });
});
