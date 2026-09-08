import { describe, expect, it } from "vitest";
import { footballCareerAffiliationHistoryFor } from "./footballCareerAffiliationProjection";
import { queryFootballSubjects } from "./footballSubjectRegistry";

function eligiblePeople(league: "NFL" | "CFB") {
  return queryFootballSubjects({
    league,
    recognizabilityTiers: ["A", "B"],
    includeProjectedCanonicalRecognition: true,
    includeProjectedSourceSubjects: true,
  }).filter((subject) => subject.kind === "player-career" || subject.kind === "coach");
}

describe("footballCareerAffiliationProjection", () => {
  it("preserves all observed source-backed CFB programs instead of collapsing transfers to one representative school", () => {
    const histories = eligiblePeople("CFB")
      .filter((subject) => subject.kind === "player-career")
      .map((subject) => footballCareerAffiliationHistoryFor(subject))
      .filter((history) => history != null);

    expect(histories.length).toBeGreaterThan(0);
    expect(histories.some((history) => history.affiliations.length > 1)).toBe(true);
  });

  it("marks a career complete only when every season in the stated window is source-owned", () => {
    for (const league of ["NFL", "CFB"] as const) {
      for (const subject of eligiblePeople(league)) {
        const history = footballCareerAffiliationHistoryFor(subject);
        if (!history?.complete) continue;
        expect(subject.startSeason).not.toBeNull();
        expect(subject.endSeason).not.toBeNull();
        expect(subject.startSeason).not.toBeUndefined();
        expect(subject.endSeason).not.toBeUndefined();
        const observed = new Set(history.seasons.map((row) => row.season));
        for (let season = subject.startSeason!; season <= subject.endSeason!; season += 1) {
          expect(observed.has(season)).toBe(true);
        }
      }
    }
  });

  it("uses historical CFB team-season conference data for coach affiliations", () => {
    const histories = eligiblePeople("CFB")
      .filter((subject) => subject.kind === "coach")
      .map((subject) => footballCareerAffiliationHistoryFor(subject))
      .filter((history) => history != null);

    expect(histories.length).toBeGreaterThan(0);
    expect(histories.some((history) => history.seasons.some((row) => row.conference))).toBe(true);
  });

  it("projects an old single-school CFB career into era-correct conferences without claiming complete team history", () => {
    const history = footballCareerAffiliationHistoryFor({
      id: "historical-texas-player",
      kind: "player-career",
      league: "CFB",
      name: "Historical Texas Player",
      school: "Texas",
      startSeason: 1993,
      endSeason: 1995,
      sourceIdentityKeys: [],
    });

    expect(history?.conferences).toEqual(["SWC"]);
    expect(history?.conferenceComplete).toBe(true);
    expect(history?.complete).toBe(false);
  });

  it("tracks a career across realignment instead of applying the school's present conference", () => {
    const history = footballCareerAffiliationHistoryFor({
      id: "texas-realignment-player",
      kind: "player-career",
      league: "CFB",
      name: "Texas Realignment Player",
      school: "Texas",
      startSeason: 1995,
      endSeason: 1997,
      sourceIdentityKeys: [],
    });

    expect(history?.seasons.map((row) => [row.season, row.conference])).toEqual([
      [1995, "SWC"],
      [1996, "Big 12"],
      [1997, "Big 12"],
    ]);
    expect(history?.conferenceComplete).toBe(true);
    expect(history?.complete).toBe(false);
  });

  it("leaves unsupported history unknown instead of turning it into a negative", () => {
    expect(footballCareerAffiliationHistoryFor({
      id: "unknown-school-player",
      kind: "player-career",
      league: "CFB",
      name: "Unknown School Player",
      school: "Unknown Tech",
      startSeason: 1980,
      endSeason: 1983,
      sourceIdentityKeys: [],
    })).toBeNull();
  });
});
