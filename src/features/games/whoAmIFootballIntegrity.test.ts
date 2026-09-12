import { describe, expect, it } from "vitest";
import { footballCfbPlayerSeasonRecognitionRecords } from "../back-room/footballCfbPlayerSeasonRecognition";
import { getFootballFactualRecord } from "../back-room/footballFactualStatsCore";
import { getFootballPersonIdentityKnowledgeForPerson } from "../back-room/footballPersonIdentityKnowledge";
import {
  footballPlayerCareerSubjectsForPerson,
  getFootballSubject,
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "../back-room/footballSubjectRegistry";
import {
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
} from "./footballWhoAmIAuthority";
import { whoAmISlug } from "./whoAmIAuthorityShared";

const seasonRecognitionBySourceId = new Map<string, typeof footballCfbPlayerSeasonRecognitionRecords[number][]>();
for (const row of footballCfbPlayerSeasonRecognitionRecords) {
  const rows = seasonRecognitionBySourceId.get(row.sourceId) ?? [];
  rows.push(row);
  seasonRecognitionBySourceId.set(row.sourceId, rows);
}

function cfbSourceId(subject: FootballSubjectProfile) {
  return subject.sourceIdentityKeys.find((key) => key.provider === "cfbfastR")?.id ?? null;
}

function recognizedCareerSchools(subject: FootballSubjectProfile) {
  const sourceId = cfbSourceId(subject);
  if (!sourceId) return [];
  return [...new Set(
    (seasonRecognitionBySourceId.get(String(sourceId)) ?? [])
      .filter((row) => (
        (subject.startSeason == null || row.season >= subject.startSeason)
        && (subject.endSeason == null || row.season <= subject.endSeason)
      ))
      .map((row) => row.school),
  )];
}

function factValue(subjectId: string, metricId: string) {
  return getFootballFactualRecord(subjectId)?.facts.find((fact) => fact.metricId === metricId)?.value ?? null;
}

describe("Who Am I Football factual and identity integrity", () => {
  it("keeps every source-backed CFB A/B school inside authoritative season evidence", () => {
    const subjects = queryFootballSubjects({
      kind: "player-career",
      league: "CFB",
      recognizabilityTiers: ["A", "B"],
      includeProjectedCanonicalRecognition: true,
      includeProjectedSourceSubjects: true,
    });

    let checked = 0;
    for (const subject of subjects) {
      const schools = recognizedCareerSchools(subject);
      if (!schools.length || !subject.school) continue;
      checked += 1;
      expect(
        schools.map(whoAmISlug),
        `${subject.id} projected ${subject.school} outside authoritative CFB season evidence`,
      ).toContain(whoAmISlug(subject.school));
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("never emits a CFB school-affiliation clue outside the authoritative career schools", () => {
    const pool = getFootballWhoAmILaunchPool("CFB");
    const universe = getFootballWhoAmIUniverse("CFB");
    const candidates = new Map(universe.candidates.map((candidate) => [candidate.id, candidate]));

    let checked = 0;
    for (const subject of pool.players) {
      const schools = recognizedCareerSchools(subject);
      if (!schools.length) continue;
      checked += 1;
      const allowed = new Set(schools.map(whoAmISlug));
      const candidate = candidates.get(subject.id);
      expect(candidate, subject.id).toBeTruthy();

      for (const clue of candidate!.clues.filter((entry) => entry.id.startsWith("affiliation:"))) {
        expect(
          allowed,
          `${subject.id} surfaced unsupported affiliation clue ${clue.id}`,
        ).toContain(clue.id.slice("affiliation:".length));
      }

      const schoolClue = candidate!.clues.find((clue) => clue.id === "school");
      if (schools.length === 1) {
        expect(schoolClue?.text, subject.id).toContain(schools[0]!);
      }
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("keeps source-backed CFB career production internally plausible for the player's role", () => {
    const pool = getFootballWhoAmILaunchPool("CFB");
    let checked = 0;

    for (const subject of pool.players) {
      if (!cfbSourceId(subject) || subject.startSeason == null || subject.endSeason == null) continue;
      const seasons = Math.max(1, subject.endSeason - subject.startSeason + 1);
      const games = factValue(subject.id, "cfb-career-games");
      if (games != null) expect(games, `${subject.id} college games`).toBeGreaterThanOrEqual(seasons * 3);

      const primary = subject.position === "QB"
        ? ["cfb-career-passing-attempts", "cfb-career-passing-yards", "cfb-best-season-passing-yards"] as const
        : subject.position === "RB"
          ? ["cfb-career-rushing-attempts", "cfb-career-rushing-yards", "cfb-best-season-rushing-yards"] as const
          : subject.position === "WR" || subject.position === "TE"
            ? ["cfb-career-receptions", "cfb-career-receiving-yards", "cfb-best-season-receiving-yards"] as const
            : null;
      if (!primary) continue;

      const [volumeMetric, careerMetric, bestMetric] = primary;
      const volume = factValue(subject.id, volumeMetric);
      const career = factValue(subject.id, careerMetric);
      const best = factValue(subject.id, bestMetric);
      if (volume == null || career == null || best == null) continue;
      checked += 1;

      if (subject.position === "QB") {
        expect(volume, `${subject.id} pass attempts`).toBeGreaterThanOrEqual(seasons * 20);
        expect(career, `${subject.id} passing yards`).toBeGreaterThanOrEqual(seasons * 100);
        expect(best, `${subject.id} best passing season`).toBeGreaterThanOrEqual(250);
      } else if (subject.position === "RB") {
        expect(volume, `${subject.id} rushing attempts`).toBeGreaterThanOrEqual(seasons * 20);
        expect(career, `${subject.id} rushing yards`).toBeGreaterThanOrEqual(seasons * 75);
        expect(best, `${subject.id} best rushing season`).toBeGreaterThanOrEqual(100);
      } else {
        expect(volume, `${subject.id} receptions`).toBeGreaterThanOrEqual(seasons * 5);
        expect(career, `${subject.id} receiving yards`).toBeGreaterThanOrEqual(seasons * 50);
        expect(best, `${subject.id} best receiving season`).toBeGreaterThanOrEqual(100);
      }
      expect(career, `${subject.id} career production must cover its best season`).toBeGreaterThanOrEqual(best);
    }

    expect(checked).toBeGreaterThan(40);
  });

  it("keeps same-name NFL source identities distinct and never uses name-only person recovery", () => {
    const promoted = queryFootballSubjects({
      kind: "player-career",
      league: "NFL",
      recognizabilityTiers: ["A", "B", "C"],
      includeProjectedCanonicalRecognition: true,
      includeProjectedSourceSubjects: true,
    });

    for (const subject of promoted) {
      const related = footballPlayerCareerSubjectsForPerson(subject);
      expect(
        related.filter((candidate) => candidate.league === subject.league && candidate.id !== subject.id),
        `${subject.id} merged a same-stage same-name athlete`,
      ).toEqual([]);
    }

    const collisionCases = [
      ["Adrian Peterson", "nflverse-player-00-0025394", "nflverse-player-00-0021306"],
      ["Cam Newton", "nflverse-player-00-0027939", "nflverse-player-00-0023382"],
      ["Lamar Jackson", "nflverse-player-00-0034796", "nflverse-player-00-0036152"],
    ] as const;

    for (const [name, correctSourceId, otherSourceId] of collisionCases) {
      const correct = getFootballSubject(correctSourceId);
      expect(correct?.name, correctSourceId).toBe(name);
      expect(getFootballSubject(otherSourceId), otherSourceId).toBeNull();

      const relatedIds = new Set(footballPlayerCareerSubjectsForPerson(correct!).map((subject) => subject.id));
      for (const knowledge of getFootballPersonIdentityKnowledgeForPerson(correct!)) {
        expect(
          relatedIds,
          `${name} identity knowledge rebound through display-name grouping: ${knowledge.subjectId}`,
        ).toContain(knowledge.subjectId);
      }
    }
  });
});
