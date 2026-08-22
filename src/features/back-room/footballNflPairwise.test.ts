import { describe, expect, it } from "vitest";
import { getFootballRankFivePack } from "./footballRankFiveModel";

function rating(packId: Parameters<typeof getFootballRankFivePack>[0], itemId: string) {
  const item = getFootballRankFivePack(packId).items.find((row) => row.id === itemId);
  if (!item) throw new Error(`Missing ${itemId} from ${packId}`);
  return item.rating;
}

describe("Football NFL reviewed pairwise anchors", () => {
  it("preserves defensible QB career ordering across rings, peak, efficiency and longevity", () => {
    expect(rating("nfl-quarterbacks", "peyton-manning")).toBeGreaterThan(rating("nfl-quarterbacks", "eli-manning"));
    expect(rating("nfl-quarterbacks", "aaron-rodgers")).toBeGreaterThan(rating("nfl-quarterbacks", "ben-roethlisberger"));
    expect(rating("nfl-quarterbacks", "dan-marino")).toBeGreaterThan(rating("nfl-quarterbacks", "troy-aikman"));
    expect(rating("nfl-quarterbacks", "matt-ryan")).toBeGreaterThan(rating("nfl-quarterbacks", "joe-flacco"));
  });

  it("preserves peak and longevity distinctions in RB and WR careers", () => {
    expect(rating("nfl-running-backs", "terrell-davis")).toBeGreaterThan(rating("nfl-running-backs", "demarco-murray"));
    expect(rating("nfl-running-backs", "jamaal-charles")).toBeGreaterThan(rating("nfl-running-backs", "reggie-bush"));
    expect(rating("nfl-wide-receivers", "calvin-johnson")).toBeGreaterThan(rating("nfl-wide-receivers", "mike-evans"));
    expect(rating("nfl-wide-receivers", "michael-thomas")).toBeGreaterThan(rating("nfl-wide-receivers", "josh-gordon"));
  });

  it("does not let one championship or one playoff run overwhelm the full coaching career", () => {
    expect(rating("nfl-head-coaches", "marty-schottenheimer")).toBeGreaterThan(rating("nfl-head-coaches", "doug-pederson"));
    expect(rating("nfl-head-coaches", "mike-tomlin")).toBeGreaterThan(rating("nfl-head-coaches", "ron-rivera"));
    expect(rating("nfl-head-coaches", "marvin-lewis")).toBeGreaterThan(rating("nfl-head-coaches", "adam-gase"));
  });
});
