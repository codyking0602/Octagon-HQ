import { describe, expect, it } from "vitest";
import {
  FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCE,
  FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCES,
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
  return subjects.map((subject) => subject.name);
}

describe("Football Stage 12 recognizability universe", () => {
  it("uses pinned discovery plus independent row-level recognition authorities without turning any into factual providers", () => {
    expect(FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCE).toEqual(expect.objectContaining({
      provider: "ncaafb",
      repository: "lebebr01/ncaafb",
      commit: "21f8bf9070e95e6aa561d7b6d7d4a1c956f4cfd8",
      license: "CC0",
      role: expect.stringContaining("discovery only"),
    }));
    expect(FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCES.map(({ provider }) => provider))
      .toEqual(expect.arrayContaining(["ncaafb", "sports-reference", "official-cfb-awards", "nfl-honors"]));
    expect([...new Set(footballRecognitionEvidenceRecords.map(({ sourceProvider }) => sourceProvider))])
      .toEqual(expect.arrayContaining(["sports-reference", "official-cfb-awards", "nfl-honors", "octagon-hq"]));
    expect(footballRecognitionEvidenceRecords.every((record) => !("facts" in record))).toBe(true);
  });

  it("gives NFL and CFB the same ten real player-pool families", () => {
    const positions = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"] as const;
    for (const league of ["NFL", "CFB"] as const) {
      for (const position of positions) expect(playerPool(league, position).length).toBeGreaterThan(0);
    }
  });

  it("repairs the Stage 11 college identity holes instead of relying on NFL crossover", () => {
    expect(names(playerPool("CFB", "RB"))).toContain("Darren McFadden");
    expect(names(playerPool("CFB", "TE"))).toEqual(expect.arrayContaining(["Jermaine Gresham", "Mark Andrews", "Brock Bowers"]));
    expect(names(playerPool("CFB", "OL"))).toEqual(expect.arrayContaining(["Joe Thomas", "Barrett Jones", "Penei Sewell"]));
    expect(names(playerPool("CFB", "DL"))).toContain("Ndamukong Suh");
    expect(names(playerPool("CFB", "LB"))).toContain("Luke Kuechly");
    expect(names(playerPool("CFB", "DB"))).toContain("Eric Berry");
    expect(names([...playerPool("CFB", "K"), ...playerPool("CFB", "P")]))
      .toEqual(expect.arrayContaining(["Roberto Aguayo", "Michael Dickson"]));
  });

  it("protects the final CFB A-C universe with material position-level health floors instead of one arbitrary total quota", () => {
    expect(playerPool("CFB", "QB").length).toBeGreaterThanOrEqual(60);
    expect(playerPool("CFB", "RB").length).toBeGreaterThanOrEqual(70);
    expect(playerPool("CFB", "WR").length).toBeGreaterThanOrEqual(55);
    expect(playerPool("CFB", "TE").length).toBeGreaterThanOrEqual(30);
    expect(playerPool("CFB", "OL").length).toBeGreaterThanOrEqual(50);
    expect(playerPool("CFB", "DL").length).toBeGreaterThanOrEqual(45);
    expect(playerPool("CFB", "LB").length).toBeGreaterThanOrEqual(45);
    expect(playerPool("CFB", "DB").length).toBeGreaterThanOrEqual(45);
    expect(playerPool("CFB", "K").length + playerPool("CFB", "P").length).toBeGreaterThanOrEqual(25);
  });

  it("repairs NFL OL and specialist recognition instead of pretending production stats cover every position", () => {
    expect(names(playerPool("NFL", "OL"))).toEqual(expect.arrayContaining(["Joe Thomas", "Trent Williams", "Jason Kelce", "Zack Martin"]));
    expect(playerPool("NFL", "OL").length).toBeGreaterThanOrEqual(25);
    expect(names([...playerPool("NFL", "K"), ...playerPool("NFL", "P")]))
      .toEqual(expect.arrayContaining(["Adam Vinatieri", "Justin Tucker", "Shane Lechler", "Pat McAfee"]));
    expect(playerPool("NFL", "K").length + playerPool("NFL", "P").length).toBeGreaterThanOrEqual(14);
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
