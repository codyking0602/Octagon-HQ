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
});
