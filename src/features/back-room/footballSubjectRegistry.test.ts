import { describe, expect, it } from "vitest";
import {
  FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE,
  footballFindLeaderSubjects,
  footballSubjects,
  getFootballSubject,
  queryFootballSubjects,
} from "./footballFactualStats";

describe("canonical Football subject registry", () => {
  it("registers every current factual/comparison subject exactly once", () => {
    expect(footballSubjects.length).toBeGreaterThan(footballFindLeaderSubjects.length * 3);
    expect(new Set(footballSubjects.map((subject) => subject.id)).size).toBe(footballSubjects.length);
    expect(footballFindLeaderSubjects).toHaveLength(FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE * 3);
  });

  it("normalizes broad NFL and CFB subject families for shared game queries", () => {
    expect(queryFootballSubjects({ league: "NFL", position: "QB" }).length).toBeGreaterThanOrEqual(FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE);
    expect(queryFootballSubjects({ league: "NFL", position: "RB" }).length).toBeGreaterThanOrEqual(FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE);
    expect(queryFootballSubjects({ league: "NFL", position: "TE" }).length).toBeGreaterThanOrEqual(15);
    expect(queryFootballSubjects({ league: "NFL", position: "DL" }).length).toBeGreaterThanOrEqual(10);
    expect(queryFootballSubjects({ league: "NFL", position: "LB" }).length).toBeGreaterThanOrEqual(10);
    expect(queryFootballSubjects({ league: "NFL", position: "DB" }).length).toBeGreaterThanOrEqual(10);
    expect(queryFootballSubjects({ league: "NFL", kind: "player-season" }).length).toBeGreaterThanOrEqual(15);
    expect(queryFootballSubjects({ league: "NFL", kind: "team-season" }).length).toBeGreaterThanOrEqual(15);
    expect(queryFootballSubjects({ league: "CFB", kind: "team-season" }).length).toBeGreaterThan(FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE);
    expect(queryFootballSubjects({ league: "CFB", kind: "coach" }).length).toBeGreaterThanOrEqual(15);
    expect(queryFootballSubjects({ league: "CFB", kind: "program-era" }).length).toBeGreaterThanOrEqual(15);
  });

  it("keeps one player identity while resolving legacy comparison ids as aliases", () => {
    const canonicalTony = getFootballSubject("nfl-tony-gonzalez");
    const comparisonTony = getFootballSubject("tony-gonzalez");
    expect(canonicalTony).not.toBeNull();
    expect(comparisonTony).toBe(canonicalTony);
    const canonicalWatt = getFootballSubject("nfl-j-j-watt");
    const comparisonWatt = getFootballSubject("jj-watt");
    expect(canonicalWatt).not.toBeNull();
    expect(comparisonWatt).toBe(canonicalWatt);
  });

  it("provides stable lookup metadata for seasons, coaches and dynasties", () => {
    expect(getFootballSubject("peyton-manning")).toMatchObject({ id: "peyton-manning", name: "Peyton Manning", kind: "player-career", league: "NFL", position: "QB" });
    expect(getFootballSubject("2005-texas")).toMatchObject({ id: "2005-texas", name: "2005 Texas", kind: "team-season", league: "CFB", season: 2005 });
    expect(getFootballSubject("tom-brady-2007")).toMatchObject({ kind: "player-season", league: "NFL", position: "QB", season: 2007 });
    expect(getFootballSubject("nick-saban-cfb")).toMatchObject({ kind: "coach", league: "CFB", school: "Alabama" });
    expect(getFootballSubject("alabama-2009-2020")).toMatchObject({ kind: "program-era", league: "CFB", school: "Alabama", startSeason: 2009, endSeason: 2020 });
    expect(getFootballSubject("missing-subject")).toBeNull();
  });

  it("keeps factual depth separate from normal casual queries while allowing explicit PR6 depth review", () => {
    const peyton = getFootballSubject("peyton-manning");
    expect(peyton).toMatchObject({ recognizabilityTier: "A", casualEligible: true });
    expect(peyton?.sourceIdentityKeys).toContainEqual({ provider: "octagon-hq", id: "peyton-manning" });
    expect(peyton?.sourceIdentityKeys).toContainEqual({ provider: "nflverse", id: "00-0010346" });
    expect(queryFootballSubjects({ casualEligible: true }).length).toBeLessThan(footballSubjects.length);
    expect(queryFootballSubjects({ recognizabilityTiers: ["D"] }).every((subject) => !subject.casualEligible)).toBe(true);
    expect(queryFootballSubjects({ sourceProvider: "octagon-hq" })).toHaveLength(footballSubjects.length);
    expect(queryFootballSubjects({ sourceProvider: "cfbfastR" })).toHaveLength(0);
    expect(queryFootballSubjects({ sourceProvider: "nflverse" })).toHaveLength(0);
    expect(queryFootballSubjects({ sourceProvider: "cfbfastR", includeProjectedSourceSubjects: true }).length).toBeGreaterThan(0);
    expect(queryFootballSubjects({ sourceProvider: "nflverse", includeProjectedSourceSubjects: true }).length).toBeGreaterThan(0);
  });
});
