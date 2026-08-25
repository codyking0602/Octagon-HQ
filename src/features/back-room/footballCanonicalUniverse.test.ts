import { describe, expect, it } from "vitest";
import {
  footballCanonicalSubjects,
  footballFindLeaderSubjects,
} from "./footballFactualStatsCatalog";
import {
  footballSubjects,
  getFootballSubject,
  queryFootballSubjects,
} from "./footballSubjectRegistry";

describe("canonical Football universe", () => {
  it("owns hundreds of unique NFL and CFB subjects in the factual catalog", () => {
    expect(footballSubjects).toBe(footballCanonicalSubjects);
    expect(footballSubjects.length).toBeGreaterThanOrEqual(250);
    expect(new Set(footballSubjects.map(({ id }) => id)).size).toBe(footballSubjects.length);
    expect(queryFootballSubjects({ league: "NFL" }).length).toBeGreaterThanOrEqual(75);
    expect(queryFootballSubjects({ league: "CFB" }).length).toBeGreaterThanOrEqual(150);
  });

  it("keeps modern CFB metadata at least half of modern reusable coverage", () => {
    for (const decade of [2000, 2010, 2020]) {
      const modern = queryFootballSubjects({ decade });
      const college = modern.filter(({ league, leagues }) => (leagues ?? [league]).includes("CFB"));
      expect(college.length).toBeGreaterThanOrEqual(modern.length / 2);
    }
  });

  it("queries normalized position, school, franchise, conference, and draft facts", () => {
    expect(queryFootballSubjects({ position: "QB", school: "LSU", heismanWinner: true }))
      .toContainEqual(expect.objectContaining({ name: "Joe Burrow", league: "CFB" }));
    expect(queryFootballSubjects({ franchise: "Kansas City Chiefs", firstRoundPick: true }))
      .toContainEqual(expect.objectContaining({ name: "Patrick Mahomes", draftYear: 2017, draftPick: 10 }));
    expect(queryFootballSubjects({ conference: "SEC" }).length).toBeGreaterThanOrEqual(16);
    expect(queryFootballSubjects({ firstOverallPick: true }).map(({ name }) => name))
      .toEqual(expect.arrayContaining(["Peyton Manning", "Matthew Stafford", "Joe Burrow"]));
  });

  it("lets one identity satisfy several filters without duplicate entries", () => {
    const mahomes = getFootballSubject("nfl-patrick-mahomes");
    expect(mahomes).toBe(queryFootballSubjects({ franchise: "Kansas City Chiefs" }).find(({ id }) => id === mahomes?.id));
    expect(mahomes).toBe(queryFootballSubjects({ draftRound: 1 }).find(({ id }) => id === mahomes?.id));
    expect(footballSubjects.filter(({ id }) => id === mahomes?.id)).toHaveLength(1);
    const burrow = queryFootballSubjects({ school: "LSU", heismanWinner: true }).find(({ name }) => name === "Joe Burrow");
    expect(burrow?.leagues).toEqual(["CFB", "NFL"]);
    expect(footballSubjects.filter(({ name }) => name === "Joe Burrow")).toHaveLength(1);
  });

  it("retains every compatibility-game subject unchanged inside the larger ledger", () => {
    for (const subject of footballFindLeaderSubjects) {
      expect(getFootballSubject(subject.id)?.name).toBe(subject.name);
    }
  });
});
