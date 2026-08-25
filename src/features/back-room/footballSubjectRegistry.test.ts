import { describe, expect, it } from "vitest";
import {
  FOOTBALL_FACTUAL_CATALOG_SUBJECT_COUNT,
  FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE,
  footballFactualCatalogSubjects,
  footballFindLeaderSubjects,
  footballSubjects,
  getFootballSubject,
  queryFootballSubjects,
} from "./footballFactualStats";

describe("canonical Football subject registry", () => {
  it("registers every canonical factual subject exactly once", () => {
    expect(footballSubjects).toHaveLength(FOOTBALL_FACTUAL_CATALOG_SUBJECT_COUNT);
    expect(footballSubjects).toHaveLength(footballFactualCatalogSubjects.length);
    expect(new Set(footballSubjects.map((subject) => subject.id)).size).toBe(footballSubjects.length);
    expect(footballSubjects).toHaveLength(FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE * 3);
  });

  it("keeps Find the Leader as a consumer of the canonical factual catalog", () => {
    expect(footballFindLeaderSubjects.map(({ id, name, domainId }) => ({ id, name, domainId }))).toEqual(
      footballFactualCatalogSubjects,
    );
  });

  it("normalizes the current NFL and CFB subject families for shared game queries", () => {
    expect(queryFootballSubjects({ league: "NFL", position: "QB" })).toHaveLength(
      FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE,
    );
    expect(queryFootballSubjects({ league: "NFL", position: "RB" })).toHaveLength(
      FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE,
    );
    expect(queryFootballSubjects({ league: "CFB", kind: "team-season" })).toHaveLength(
      FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE,
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
