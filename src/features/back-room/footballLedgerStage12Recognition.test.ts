import { describe, expect, it } from "vitest";
import {
  FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCE,
  footballRecognitionEvidenceRecords,
} from "./footballRecognitionEvidence";
import { queryFootballSubjects } from "./footballSubjectRegistry";

const ABC = ["A", "B", "C"] as const;
const projected = {
  recognizabilityTiers: ABC,
  casualEligible: true,
  includeProjectedSourceSubjects: true,
  includeProjectedCanonicalRecognition: true,
} as const;

function playerPool(league: "NFL" | "CFB", position: "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "DB" | "K" | "P") {
  return queryFootballSubjects({ kind: "player-career", league, position, ...projected });
}

function names(subjects: readonly { name: string }[]) {
  return new Set(subjects.map((subject) => subject.name));
}

describe("Football Stage 12 recognizability universe", () => {
  it("uses pinned independent recognition evidence without turning it into a factual provider", () => {
    expect(FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCE).toEqual(expect.objectContaining({
      repository: "lebebr01/ncaafb",
      commit: "21f8bf9070e95e6aa561d7b6d7d4a1c956f4cfd8",
      license: "CC0",
    }));
    expect(footballRecognitionEvidenceRecords.some((record) => record.sourceProvider === "ncaafb")).toBe(true);
    expect(footballRecognitionEvidenceRecords.every((record) => !("facts" in record))).toBe(true);
  });

  it("gives NFL and CFB the same nine real player-pool families", () => {
    const positions = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"] as const;
    for (const league of ["NFL", "CFB"] as const) {
      for (const position of positions) expect(playerPool(league, position).length).toBeGreaterThan(0);
    }
  });

  it("repairs the Stage 11 college identity holes instead of relying on NFL crossover", () => {
    expect(names(playerPool("CFB", "RB"))).toContain("Darren McFadden");
    expect(names(playerPool("CFB", "TE"))).toEqual(expect.setContaining(["Jermaine Gresham", "Mark Andrews", "Brock Bowers"]));
    expect(names(playerPool("CFB", "OL"))).toEqual(expect.setContaining(["Joe Thomas", "Barrett Jones", "Penei Sewell"]));
    expect(names(playerPool("CFB", "DL"))).toContain("Ndamukong Suh");
    expect(names(playerPool("CFB", "LB"))).toContain("Luke Kuechly");
    expect(names(playerPool("CFB", "DB"))).toContain("Eric Berry");
    expect(new Set([...playerPool("CFB", "K"), ...playerPool("CFB", "P")].map((subject) => subject.name)))
      .toEqual(expect.setContaining(["Roberto Aguayo", "Michael Dickson"]));
  });

  it("materially deepens the weakest CFB A-C pools without an arbitrary total-player quota", () => {
    expect(playerPool("CFB", "TE").length).toBeGreaterThanOrEqual(18);
    expect(playerPool("CFB", "OL").length).toBeGreaterThanOrEqual(12);
    expect(playerPool("CFB", "DL").length).toBeGreaterThanOrEqual(28);
    expect(playerPool("CFB", "LB").length).toBeGreaterThanOrEqual(27);
    expect(playerPool("CFB", "DB").length).toBeGreaterThanOrEqual(25);
    expect(playerPool("CFB", "K").length + playerPool("CFB", "P").length).toBeGreaterThanOrEqual(9);
  });

  it("repairs NFL OL and specialist recognition instead of pretending production stats cover every position", () => {
    expect(names(playerPool("NFL", "OL"))).toEqual(expect.setContaining(["Joe Thomas", "Trent Williams", "Jason Kelce", "Zack Martin"]));
    expect(playerPool("NFL", "OL").length).toBeGreaterThanOrEqual(10);
    expect(new Set([...playerPool("NFL", "K"), ...playerPool("NFL", "P")].map((subject) => subject.name)))
      .toEqual(expect.setContaining(["Adam Vinatieri", "Justin Tucker", "Shane Lechler", "Pat McAfee"]));
    expect(playerPool("NFL", "K").length + playerPool("NFL", "P").length).toBeGreaterThanOrEqual(10);
  });

  it("keeps NFL and CFB careers distinct even for the same person", () => {
    const cfbJoeThomas = playerPool("CFB", "OL").find((subject) => subject.name === "Joe Thomas");
    const nflJoeThomas = playerPool("NFL", "OL").find((subject) => subject.name === "Joe Thomas");
    expect(cfbJoeThomas?.id).toBe("cfb-joe-thomas");
    expect(nflJoeThomas?.id).toBe("nfl-joe-thomas");
    expect(cfbJoeThomas?.id).not.toBe(nflJoeThomas?.id);
  });

  it("makes franchises and notable games first-class query identities", () => {
    const franchises = queryFootballSubjects({ kind: "franchise", league: "NFL", ...projected });
    const nflGames = queryFootballSubjects({ kind: "game", league: "NFL", ...projected });
    const cfbGames = queryFootballSubjects({ kind: "game", league: "CFB", ...projected });
    expect(franchises.length).toBeGreaterThanOrEqual(32);
    expect(nflGames.length).toBeGreaterThan(0);
    expect(cfbGames.length).toBeGreaterThanOrEqual(10);
    expect(names(cfbGames)).toContain("2006 Rose Bowl — Texas vs USC");
  });

  it("never makes Tier D casual-eligible", () => {
    expect(queryFootballSubjects({
      recognizabilityTiers: ["D"],
      casualEligible: true,
      includeProjectedSourceSubjects: true,
      includeProjectedCanonicalRecognition: true,
    })).toHaveLength(0);
  });
});
