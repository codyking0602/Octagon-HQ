import { describe, expect, it } from "vitest";
import {
  FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE,
  footballFindLeaderSubjects,
  footballSubjects,
  getFootballSubject,
  queryFootballSubjects,
} from "./footballFactualStats";

describe("canonical Football subject registry", () => {
  it("registers every current factual comparison subject exactly once", () => {
    expect(footballSubjects.length).toBeGreaterThan(footballFindLeaderSubjects.length);
    expect(new Set(footballSubjects.map((subject) => subject.id)).size).toBe(footballSubjects.length);
    expect(footballFindLeaderSubjects).toHaveLength(FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE * 3);
  });

  it("normalizes the current NFL and CFB subject families for shared game queries", () => {
    expect(queryFootballSubjects({ league: "NFL", position: "QB" }).length).toBeGreaterThanOrEqual(
      FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE,
    );
    expect(queryFootballSubjects({ league: "NFL", position: "RB" }).length).toBeGreaterThanOrEqual(
      FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE,
    );
    expect(queryFootballSubjects({ league: "CFB", kind: "team-season" })).toHaveLength(
      FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE,
    );
  });

  it("provides one stable lookup surface for subject identity metadata", () => {
    expect(getFootballSubject("peyton-manning")).toMatchObject({
      id: "peyton-manning",
      name: "Peyton Manning",
      kind: "player-career",
      league: "NFL",
      position: "QB",
    });
    expect(getFootballSubject("2005-texas")).toMatchObject({
      id: "2005-texas",
      name: "2005 Texas",
      kind: "team-season",
      league: "CFB",
      season: 2005,
    });
    expect(getFootballSubject("missing-subject")).toBeNull();
  });
});
