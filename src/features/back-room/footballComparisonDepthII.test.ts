import { describe, expect, it } from "vitest";
import { getFootballRatingBand } from "./footballContentContract";
import { footballKeepCutPacks } from "./footballKeepCutModel";
import { footballRankFivePacks, getFootballRankFivePack } from "./footballRankFiveModel";

function rating(packId: Parameters<typeof getFootballRankFivePack>[0], itemId: string) {
  const item = getFootballRankFivePack(packId).items.find((candidate) => candidate.id === itemId);
  expect(item, `${packId}/${itemId}`).toBeDefined();
  return item!.rating;
}

describe("Football comparison depth II", () => {
  it("lands on the approved mature comparison-universe target without duplicating subjects", () => {
    expect(footballRankFivePacks).toHaveLength(13);
    expect(footballRankFivePacks.filter((pack) => pack.items.every((item) => item.league === "NFL"))).toHaveLength(8);
    expect(footballRankFivePacks.filter((pack) => pack.items.every((item) => item.league === "CFB"))).toHaveLength(5);

    expect(getFootballRankFivePack("nfl-tight-ends").items).toHaveLength(18);
    expect(getFootballRankFivePack("nfl-defensive-players").items).toHaveLength(32);
    expect(getFootballRankFivePack("nfl-qb-seasons").items).toHaveLength(18);
    expect(getFootballRankFivePack("nfl-team-seasons").items).toHaveLength(18);
    expect(getFootballRankFivePack("college-quarterbacks").items).toHaveLength(20);
    expect(getFootballRankFivePack("college-head-coaches").items).toHaveLength(20);
    expect(getFootballRankFivePack("college-programs").items).toHaveLength(20);
    expect(getFootballRankFivePack("college-program-eras").items).toHaveLength(15);
    expect(getFootballRankFivePack("college-team-seasons").items).toHaveLength(21);

    const ids = footballRankFivePacks.flatMap((pack) => pack.items.map((item) => item.id));
    expect(ids).toHaveLength(350);
    expect(new Set(ids).size).toBe(350);
    expect(footballKeepCutPacks.map((pack) => pack.id)).toEqual(footballRankFivePacks.map((pack) => pack.id));
  });

  it("gives the new universe real elite, middle, below-average, and bad depth", () => {
    const newPackIds = [
      "nfl-tight-ends",
      "nfl-defensive-players",
      "nfl-qb-seasons",
      "nfl-team-seasons",
      "college-head-coaches",
      "college-program-eras",
    ] as const;
    const bands = new Set(
      newPackIds.flatMap((packId) => getFootballRankFivePack(packId).items.map((item) => getFootballRatingBand(item.rating))),
    );
    expect(bands).toEqual(new Set(["elite", "great", "good", "average", "below-average", "bad"]));

    expect(getFootballRatingBand(rating("nfl-defensive-players", "lawrence-taylor"))).toBe("elite");
    expect(getFootballRatingBand(rating("nfl-defensive-players", "clay-matthews"))).toBe("good");
    expect(getFootballRatingBand(rating("nfl-defensive-players", "jadeveon-clowney"))).toBe("average");
    expect(getFootballRatingBand(rating("nfl-defensive-players", "morris-claiborne"))).toBe("below-average");
    expect(getFootballRatingBand(rating("nfl-defensive-players", "vernon-gholston"))).toBe("bad");
  });

  it("locks defensive and tight-end pairwise calibration anchors", () => {
    expect(rating("nfl-defensive-players", "lawrence-taylor")).toBeGreaterThan(rating("nfl-defensive-players", "aaron-donald"));
    expect(rating("nfl-defensive-players", "myles-garrett")).toBeGreaterThan(rating("nfl-defensive-players", "luke-kuechly"));
    expect(rating("nfl-defensive-players", "jadeveon-clowney")).toBeGreaterThan(rating("nfl-defensive-players", "morris-claiborne"));
    expect(rating("nfl-defensive-players", "morris-claiborne")).toBeGreaterThan(rating("nfl-defensive-players", "dion-jordan"));
    expect(rating("nfl-defensive-players", "dion-jordan")).toBeGreaterThan(rating("nfl-defensive-players", "vernon-gholston"));

    expect(rating("nfl-tight-ends", "tony-gonzalez")).toBeGreaterThan(rating("nfl-tight-ends", "travis-kelce"));
    expect(rating("nfl-tight-ends", "travis-kelce")).toBeGreaterThan(rating("nfl-tight-ends", "jason-witten"));
    expect(rating("nfl-tight-ends", "jason-witten")).toBeGreaterThan(rating("nfl-tight-ends", "eric-ebron"));
    expect(rating("nfl-tight-ends", "eric-ebron")).toBeGreaterThan(rating("nfl-tight-ends", "oj-howard"));
  });

  it("locks season and team-season calibration anchors instead of grading reputation", () => {
    expect(rating("nfl-qb-seasons", "tom-brady-2007")).toBeGreaterThan(rating("nfl-qb-seasons", "lamar-jackson-2019"));
    expect(rating("nfl-qb-seasons", "lamar-jackson-2019")).toBeGreaterThan(rating("nfl-qb-seasons", "carson-wentz-2017"));
    expect(rating("nfl-qb-seasons", "carson-wentz-2017")).toBeGreaterThan(rating("nfl-qb-seasons", "jameis-winston-2019"));
    expect(rating("nfl-qb-seasons", "jameis-winston-2019")).toBeGreaterThan(rating("nfl-qb-seasons", "zach-wilson-2022"));
    expect(rating("nfl-qb-seasons", "zach-wilson-2022")).toBeGreaterThan(rating("nfl-qb-seasons", "jamarcus-russell-2009"));

    expect(rating("nfl-team-seasons", "2007-new-england-patriots")).toBeGreaterThan(rating("nfl-team-seasons", "2015-carolina-panthers"));
    expect(rating("nfl-team-seasons", "2015-carolina-panthers")).toBeGreaterThan(rating("nfl-team-seasons", "2011-philadelphia-eagles"));
    expect(rating("nfl-team-seasons", "2011-philadelphia-eagles")).toBeGreaterThan(rating("nfl-team-seasons", "2022-denver-broncos"));
    expect(rating("nfl-team-seasons", "2022-denver-broncos")).toBeGreaterThan(rating("nfl-team-seasons", "2020-jacksonville-jaguars"));
    expect(rating("nfl-team-seasons", "2020-jacksonville-jaguars")).toBeGreaterThan(rating("nfl-team-seasons", "2017-cleveland-browns"));
  });

  it("locks CFB coaching, era, and team-season anchors across the full scale", () => {
    expect(rating("college-head-coaches", "nick-saban-cfb")).toBeGreaterThan(rating("college-head-coaches", "curt-cignetti-cfb"));
    expect(rating("college-head-coaches", "curt-cignetti-cfb")).toBeGreaterThan(rating("college-head-coaches", "tom-herman-cfb"));
    expect(rating("college-head-coaches", "tom-herman-cfb")).toBeGreaterThan(rating("college-head-coaches", "chad-morris-cfb"));

    expect(rating("college-program-eras", "alabama-2009-2020")).toBeGreaterThan(rating("college-program-eras", "texas-2010-2016"));
    expect(rating("college-program-eras", "texas-2010-2016")).toBeGreaterThan(rating("college-program-eras", "nebraska-2015-2022"));

    expect(rating("college-team-seasons", "2025-indiana")).toBeGreaterThan(rating("college-team-seasons", "2022-tcu"));
    expect(rating("college-team-seasons", "2022-tcu")).toBeGreaterThan(rating("college-team-seasons", "2012-usc"));
    expect(rating("college-team-seasons", "2012-usc")).toBeGreaterThan(rating("college-team-seasons", "2022-texas-am"));
  });
});
