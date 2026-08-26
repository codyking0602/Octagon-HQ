import fs from "node:fs";
import { describe, expect, it } from "vitest";
import projection from "../../../data/generated/football/recognizability-projection.json";
import { footballSubjects, getFootballSubject, queryFootballSubjects } from "./footballSubjectRegistry";
import { buildFootballSubjectKnowledgeMetadata } from "./footballSubjectEligibility";

describe("Football recognizability projection", () => {
  it("keeps database-only identities out of casual play", () => {
    expect(footballSubjects.filter((subject) => subject.recognizabilityTier === "D").every((subject) => !subject.casualEligible)).toBe(true);
    expect(() => buildFootballSubjectKnowledgeMetadata(
      { id: "low-volume", name: "Low Volume", kind: "player-career", league: "CFB", school: "Alabama" },
      { recognizabilityTier: "D", casualEligible: true },
    )).toThrow();
  });

  it("requires explicit approval for every projected A", () => {
    const approved = new Set(projection.manualApprovals);
    const playerAs = projection.records.filter((record) => record.kind === "player-career" && record.tier === "A");
    expect(playerAs.length).toBeGreaterThan(0);
    expect(playerAs.every((record) => approved.has(record.name))).toBe(true);
  });

  it("uses exact NFL positions and blocks the observed substring regressions", () => {
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "Adam Vinatieri")).toMatchObject({ position: "K" });
    expect(projection.records.find((record) => record.league === "NFL" && record.name === "AJ Cole")).toMatchObject({ position: "P" });
    const audit = fs.readFileSync("docs/football-recognizability-audit.md", "utf8");
    expect(audit).not.toContain("Adam Vinatieri (OL");
    expect(audit).not.toContain("AJ Cole (OL");
    expect(audit).not.toContain("A.J. Epenesa (DB");
  });

  it("does not turn ordinary CFB stat rows or kicker volume into casual filler", () => {
    const promotedCfbNames = new Set(projection.records.filter((record) => record.kind === "player-career" && record.league === "CFB").map((record) => record.name));
    for (const obscureKicker of ["Aaron Beckham", "Aaron Bickerton", "Aaron Blom"]) {
      expect(promotedCfbNames.has(obscureKicker)).toBe(false);
    }
  });

  it("projects every required PR6 entity family conservatively", () => {
    const byKind = projection.summary.tierByEntityKind;
    for (const kind of ["player-career", "program", "franchise", "coach-stop", "team-season", "era", "game"] as const) {
      expect(byKind[kind]).toBeDefined();
    }
    expect(byKind.game.D).toBeGreaterThan((byKind.game.A ?? 0) + (byKind.game.B ?? 0) + (byKind.game.C ?? 0));
    expect(byKind.program.C + byKind.program.B + byKind.program.A).toBeGreaterThan(100);
    expect(byKind.franchise.A + byKind.franchise.B).toBe(32);
    expect(byKind["coach-stop"].C + byKind["coach-stop"].B + byKind["coach-stop"].A).toBeGreaterThan(50);
    expect(byKind.era.B + byKind.era.A).toBeGreaterThanOrEqual(6);
  });

  it("keeps deep projected players opt-in on the existing canonical query path", () => {
    expect(queryFootballSubjects({ sourceProvider: "cfbfastR" })).toHaveLength(0);
    expect(queryFootballSubjects({ sourceProvider: "nflverse" })).toHaveLength(0);
    expect(queryFootballSubjects({ sourceProvider: "cfbfastR", includeProjectedSourceSubjects: true, casualEligible: true }).length).toBeGreaterThan(50);
    expect(queryFootballSubjects({ sourceProvider: "nflverse", includeProjectedSourceSubjects: true, casualEligible: true }).length).toBeGreaterThan(50);
    expect(getFootballSubject("peyton-manning")?.id).toBe("peyton-manning");
    expect(getFootballSubject("program-texas")?.aliases).toContain("texas-program");
  });

  it("checks in the required deterministic review audit without imposing one game-wide exposure mix", () => {
    const audit = fs.readFileSync("docs/football-recognizability-audit.md", "utf8");
    expect((audit.match(/^### (NFL|CFB) tier C \(50\)$/gm) ?? [])).toHaveLength(2);
    expect(audit).toContain("do **not** prescribe one universal exposure mix");
    expect(audit).toContain("### Programs");
    expect(audit).toContain("### Coach stops");
    expect(audit).toContain("### Team seasons");
    expect(audit).toContain("### Eras");
    expect(audit).toContain("### Games");
    const generator = fs.readFileSync("scripts/generate-football-recognizability.mjs", "utf8");
    expect(generator).not.toContain("Math.random");
  });
});
