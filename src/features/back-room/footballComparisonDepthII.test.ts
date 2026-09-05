import { describe, expect, it } from "vitest";
import { footballRankFivePacks } from "./footballRankFivePlayableModel";
import { footballComparisonEligibilityQuery } from "./footballComparisonAuthority";
import { getFootballRatingBand } from "./footballContentContract";
import { resolveFootballSubjectReference } from "./footballSubjectRegistry";

const CATEGORY_NAMES = [
  "NFL QB Careers", "NFL RB Careers", "NFL WR Careers", "NFL TE Careers",
  "NFL Front Seven Careers", "NFL Secondary Careers", "NFL Head Coaches", "NFL Team Eras",
  "College QBs", "College RB Careers", "CFB Head Coaches", "CFB Program Eras",
] as const;

function item(packId: (typeof footballRankFivePacks)[number]["id"], id: string) {
  return footballRankFivePacks.find((pack) => pack.id === packId)!.items.find((candidate) => candidate.id === id)!;
}

describe("Football greatness category expansion", () => {
  it("exposes exactly the twelve approved categories and removes the retired products", () => {
    expect(footballRankFivePacks.map((pack) => pack.name)).toEqual(CATEGORY_NAMES);
    expect(footballRankFivePacks.map((pack) => pack.id)).not.toEqual(expect.arrayContaining([
      "nfl-defensive-players", "nfl-qb-seasons", "nfl-team-seasons", "college-programs", "college-team-seasons",
    ]));
  });

  it("owns every playable identity once per category through the canonical positional query", () => {
    for (const pack of footballRankFivePacks) {
      expect(new Set(pack.items.map((candidate) => candidate.id)).size).toBe(pack.items.length);
      const query = footballComparisonEligibilityQuery(pack.id);
      for (const candidate of pack.items) {
        const subject = resolveFootballSubjectReference(candidate.id, candidate.name, query);
        expect(subject, `${pack.id}:${candidate.id}`).not.toBeNull();
      }
    }
    for (const candidate of footballRankFivePacks.find((pack) => pack.id === "nfl-front-seven")!.items) {
      expect(["DL", "LB"]).toContain(resolveFootballSubjectReference(candidate.id, candidate.name, footballComparisonEligibilityQuery("nfl-front-seven"))?.position);
    }
    for (const candidate of footballRankFivePacks.find((pack) => pack.id === "nfl-secondary")!.items) {
      expect(resolveFootballSubjectReference(candidate.id, candidate.name, footballComparisonEligibilityQuery("nfl-secondary"))?.position).toBe("DB");
    }
  });

  it("preserves representative locked anchors", () => {
    expect(getFootballRatingBand(item("nfl-quarterbacks", "tom-brady").rating)).toBe("elite");
    expect(getFootballRatingBand(item("nfl-running-backs", "derrick-henry").rating)).toBe("elite");
    expect(getFootballRatingBand(item("nfl-tight-ends", "shannon-sharpe").rating)).toBe("elite");
    expect(getFootballRatingBand(item("nfl-front-seven", "clay-matthews").rating)).toBe("good");
    expect(getFootballRatingBand(item("nfl-secondary", "morris-claiborne").rating)).toBe("below-average");
    expect(getFootballRatingBand(item("college-quarterbacks", "jake-fromm-career").rating)).toBe("good");
    expect(item("college-running-backs", "trent-richardson-cfb").rating).toBeGreaterThanOrEqual(70);
    expect(item("college-running-backs", "demarco-cobbs")).toBeUndefined();
    expect(getFootballRatingBand(footballRankFivePacks.find((pack) => pack.id === "college-program-eras")!.items.find((candidate) => candidate.name.includes("Boise State"))!.rating)).toBe("average");
  });
});
