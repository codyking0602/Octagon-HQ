import { describe, expect, it } from "vitest";

import {
  footballCfbPlayerSeasonRecognitionRecords,
} from "./footballCfbPlayerSeasonRecognition";
import { getFootballFactualRecord } from "./footballFactualStatsCore";
import { getFootballSubject, queryFootballSubjects } from "./footballSubjectRegistry";

const tierRank = { D: 0, C: 1, B: 2, A: 3 } as const;
const iconicSeasonIds = [
  "cfb-marcus-mariota-2014",
  "cfb-derrick-henry-2015",
  "cfb-lamar-jackson-2016",
  "cfb-baker-mayfield-2017",
  "cfb-kyler-murray-2018",
  "cfb-joe-burrow-2019",
  "cfb-devonta-smith-2020",
  "cfb-bryce-young-2021",
  "cfb-caleb-williams-2022",
  "cfb-jayden-daniels-2023",
  "cfb-travis-hunter-2024",
  "cfb-fernando-mendoza-2025",
] as const;

function careerIdForSeasonId(id: string) {
  return id.replace(/-\d{4}$/, "");
}

describe("Stage 13.5 CFB player-season recognition", () => {
  it("replaces the eleven-row compatibility seed with a source-backed multi-position universe", () => {
    expect(footballCfbPlayerSeasonRecognitionRecords.length).toBeGreaterThan(11);
    expect(new Set(footballCfbPlayerSeasonRecognitionRecords.map((record) => record.id)).size)
      .toBe(footballCfbPlayerSeasonRecognitionRecords.length);

    const positions = new Set(footballCfbPlayerSeasonRecognitionRecords.map((record) => record.position));
    expect(positions).toEqual(expect.objectContaining ? positions : positions);
    for (const position of ["QB", "RB", "WR", "TE"] as const) expect(positions.has(position)).toBe(true);
    expect(["DL", "LB", "DB"].some((position) => positions.has(position as typeof footballCfbPlayerSeasonRecognitionRecords[number]["position"]))).toBe(true);
  });

  it("preserves every reviewed iconic Heisman season as Tier A through 2025", () => {
    const byId = new Map(footballCfbPlayerSeasonRecognitionRecords.map((record) => [record.id, record]));
    for (const id of iconicSeasonIds) {
      expect(byId.get(id)?.tier, id).toBe("A");
    }
  });

  it("admits only exact 2014-2025 CFB seasons from already-recognized careers", () => {
    for (const record of footballCfbPlayerSeasonRecognitionRecords) {
      expect(record.kind).toBe("player-season");
      expect(record.league).toBe("CFB");
      expect(record.season).toBeGreaterThanOrEqual(2014);
      expect(record.season).toBeLessThanOrEqual(2025);
      expect(record.startSeason).toBe(record.season);
      expect(record.endSeason).toBe(record.season);
      expect(["A", "B", "C"]).toContain(record.tier);
      expect(record.school.length).toBeGreaterThan(0);
      expect(record.sourceId.length).toBeGreaterThan(0);

      const career = getFootballSubject(careerIdForSeasonId(record.id));
      expect(career, record.id).not.toBeNull();
      expect(career?.kind, record.id).toBe("player-career");
      expect(career?.league, record.id).toBe("CFB");
      expect(career?.recognizabilityTier, record.id).not.toBe("D");
    }
  });

  it("registers every generated season at or above its reviewed tier and hydrates it with exact-season facts", () => {
    const registered = new Map(queryFootballSubjects({
      kind: "player-season",
      league: "CFB",
      recognizabilityTiers: ["A", "B", "C"],
      includeProjectedCanonicalRecognition: true,
      includeProjectedSourceSubjects: true,
    }).map((subject) => [subject.id, subject]));

    for (const record of footballCfbPlayerSeasonRecognitionRecords) {
      const subject = registered.get(record.id);
      expect(subject, record.id).toBeDefined();
      expect(tierRank[subject!.recognizabilityTier], record.id).toBeGreaterThanOrEqual(tierRank[record.tier]);
      const factual = getFootballFactualRecord(record.id);
      expect(factual, record.id).not.toBeNull();
      expect(factual?.facts.length, record.id).toBeGreaterThan(0);
    }
  });
});
