import { describe, expect, it } from "vitest";
import { footballRankFivePacks } from "./footballRankFivePlayableModel";
import { footballComparisonEligibilityQuery } from "./footballComparisonAuthority";
import { footballGreatnessTierForItem } from "./footballGreatnessTier";
import { resolveFootballSubjectReference } from "./footballSubjectRegistry";

const CATEGORY_NAMES = [
  "NFL QB Careers", "NFL RB Careers", "NFL WR Careers", "NFL TE Careers",
  "NFL Front Seven Careers", "NFL Secondary Careers", "NFL Head Coaches", "NFL Team Eras",
  "College QBs", "College RB Careers", "CFB Head Coaches", "CFB Program Eras",
] as const;

function item(packId: (typeof footballRankFivePacks)[number]["id"], id: string) {
  return footballRankFivePacks.find((pack) => pack.id === packId)!.items.find((candidate) => candidate.id === id)!;
}

function tier(packId: (typeof footballRankFivePacks)[number]["id"], id: string) {
  return footballGreatnessTierForItem(item(packId, id));
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

  it("preserves the approved tier anchors through the canonical greatness-tier owner", () => {
    expect(tier("nfl-quarterbacks", "tom-brady")).toBe("goat");
    expect(tier("nfl-quarterbacks", "drew-brees")).toBe("great");
    expect(tier("nfl-quarterbacks", "eli-manning")).toBe("good");

    expect(tier("nfl-running-backs", "jim-brown")).toBe("elite");
    expect(tier("nfl-running-backs", "derrick-henry")).toBe("great");
    expect(tier("nfl-running-backs", "frank-gore")).toBe("good");

    expect(tier("nfl-wide-receivers", "jerry-rice")).toBe("goat");
    expect(tier("nfl-wide-receivers", "randy-moss")).toBe("legendary");
    expect(tier("nfl-wide-receivers", "antonio-brown")).toBe("elite");
    expect(tier("nfl-wide-receivers", "julio-jones")).toBe("elite");

    expect(tier("nfl-tight-ends", "tony-gonzalez")).toBe("elite");
    expect(tier("nfl-tight-ends", "shannon-sharpe")).toBe("near-elite");
    expect(tier("nfl-tight-ends", "jason-witten")).toBe("near-elite");

    expect(tier("nfl-front-seven", "clay-matthews")).toBe("good");
    expect(tier("nfl-secondary", "morris-claiborne")).toBe("below-average");

    expect(tier("nfl-team-eras", "nfl-era-patriots-belichick-brady")).toBe("goat");
    expect(tier("nfl-team-eras", "nfl-era-seahawks-legion-of-boom")).toBe("great");

    expect(tier("college-quarterbacks", "lamar-jackson-2016")).toBe("great");
    expect(tier("college-quarterbacks", "trevor-lawrence-2018")).toBe("good");
    expect(tier("college-quarterbacks", "jake-fromm-career")).toBe("average");

    expect(tier("college-running-backs", "bijan-robinson-cfb")).toBe("great");
    expect(tier("college-running-backs", "trent-richardson-cfb")).toBe("good");
    expect(item("college-running-backs", "demarco-cobbs")).toBeUndefined();

    const boise = footballRankFivePacks.find((pack) => pack.id === "college-program-eras")!.items
      .find((candidate) => candidate.name.includes("Boise State"))!;
    expect(footballGreatnessTierForItem(boise)).toBe("average");
  });
});
