import { describe, expect, it } from "vitest";
import {
  footballCanonicalSubjects,
  footballFindLeaderSubjects,
  type FootballCanonicalSubject,
} from "./footballFactualStatsCatalog";
import {
  FOOTBALL_RECOGNITION_SUMMARY,
  footballProjectedPlayerSubjects,
  footballRecognitionProjectionSubjectIdFor,
} from "./footballRecognizabilityProjection";
import {
  footballSubjects,
  getFootballSubject,
  queryFootballSubjects,
} from "./footballSubjectRegistry";

describe("canonical Football universe", () => {
  it("preserves the factual catalog while enriching its canonical identity view", () => {
    expect(footballSubjects).toHaveLength(footballCanonicalSubjects.length);
    footballCanonicalSubjects.forEach((subject, index) => {
      expect(footballSubjects[index], subject.id).toMatchObject(subject);
    });
    expect(footballSubjects.length).toBeGreaterThanOrEqual(250);
    expect(new Set(footballSubjects.map(({ id }) => id)).size).toBe(footballSubjects.length);
    expect(queryFootballSubjects({ league: "NFL" }).length).toBeGreaterThanOrEqual(75);
    expect(queryFootballSubjects({ league: "CFB" }).length).toBeGreaterThanOrEqual(150);
    expect(footballProjectedPlayerSubjects.length).toBeGreaterThanOrEqual(FOOTBALL_RECOGNITION_SUMMARY.promotedByEntityKind["player-career"]);
  });

  it("keeps source reconciliation ids internal while resolving duplicate player names conservatively", () => {
    const peyton = footballCanonicalSubjects.find(({ id }) => id === "peyton-manning")!;
    const peytonProjectionId = footballRecognitionProjectionSubjectIdFor(peyton);
    expect(peytonProjectionId).not.toBeNull();
    expect(getFootballSubject(peytonProjectionId!)).toBe(getFootballSubject(peyton.id));
    expect(getFootballSubject(peyton.id)?.aliases ?? []).not.toContain(peytonProjectionId);

    const ambiguousAdrian = {
      id: "test-adrian-peterson",
      name: "Adrian Peterson",
      kind: "player-career",
      league: "NFL",
      position: "RB",
    } satisfies FootballCanonicalSubject;
    expect(footballRecognitionProjectionSubjectIdFor(ambiguousAdrian)).toBeNull();

    const adrianPeterson = getFootballSubject("nfl-adrian-peterson");
    expect(adrianPeterson?.name).toBe("Adrian Peterson");
    const adrianProjectionId = footballRecognitionProjectionSubjectIdFor(adrianPeterson as FootballCanonicalSubject);
    expect(adrianProjectionId).not.toBeNull();
    expect(getFootballSubject(adrianProjectionId!)).toBe(adrianPeterson);
    expect(adrianPeterson?.aliases ?? []).not.toContain(adrianProjectionId);
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

  it("lets one league career satisfy several filters without collapsing its college and NFL identities", () => {
    const mahomes = getFootballSubject("nfl-patrick-mahomes");
    expect(mahomes).toBe(queryFootballSubjects({ franchise: "Kansas City Chiefs" }).find(({ id }) => id === mahomes?.id));
    expect(mahomes).toBe(queryFootballSubjects({ draftRound: 1 }).find(({ id }) => id === mahomes?.id));
    expect(footballSubjects.filter(({ id }) => id === mahomes?.id)).toHaveLength(1);

    const cfbCam = getFootballSubject("cfb-cam-newton");
    const nflCam = getFootballSubject("cam-newton");
    expect(cfbCam).toMatchObject({ id: "cfb-cam-newton", name: "Cam Newton", league: "CFB", school: "Auburn" });
    expect(nflCam).toMatchObject({ id: "cam-newton", name: "Cam Newton", league: "NFL" });
    expect(cfbCam).not.toBe(nflCam);

    const projectedCfbCam = queryFootballSubjects({
      league: "CFB",
      kind: "player-career",
      position: "QB",
      includeProjectedSourceSubjects: true,
    }).filter(({ name }) => name === "Cam Newton");
    const projectedNflCam = queryFootballSubjects({
      league: "NFL",
      kind: "player-career",
      position: "QB",
      includeProjectedSourceSubjects: true,
    }).filter(({ name }) => name === "Cam Newton");
    expect(projectedCfbCam).toHaveLength(1);
    expect(projectedNflCam).toHaveLength(1);
    expect(projectedCfbCam[0]!.id).not.toBe(projectedNflCam[0]!.id);

    const cfbCarroll = getFootballSubject("pete-carroll-cfb");
    const nflCarroll = getFootballSubject("pete-carroll");
    expect(cfbCarroll).toMatchObject({ id: "pete-carroll-cfb", name: "Pete Carroll", kind: "coach", league: "CFB" });
    expect(nflCarroll).toMatchObject({ id: "pete-carroll", name: "Pete Carroll", kind: "coach", league: "NFL" });
    expect(cfbCarroll).not.toBe(nflCarroll);
    expect(queryFootballSubjects({ kind: "coach", league: "CFB" }).map(({ id }) => id)).toContain("pete-carroll-cfb");
    expect(queryFootballSubjects({ kind: "coach", league: "NFL" }).map(({ id }) => id)).toContain("pete-carroll");
  });

  it("retains every compatibility-game subject unchanged inside the larger ledger", () => {
    for (const subject of footballFindLeaderSubjects) {
      expect(getFootballSubject(subject.id)?.name).toBe(subject.name);
    }
  });
});