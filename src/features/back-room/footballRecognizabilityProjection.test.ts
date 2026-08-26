import { createHash } from "node:crypto";
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import projection from "../../../data/generated/football/recognizability-projection.json";
import { footballRecognizabilitySubjects, footballSubjects, getFootballSubject } from "./footballSubjectRegistry";
import { buildFootballSubjectKnowledgeMetadata } from "./footballSubjectEligibility";

describe("Football recognizability projection", () => {
  it("keeps database-only identities out of casual play", () => {
    expect(footballSubjects.filter((subject) => subject.recognizabilityTier === "D").every((subject) => !subject.casualEligible)).toBe(true);
    expect(() => buildFootballSubjectKnowledgeMetadata({ id: "low-volume", name: "Low Volume", kind: "player-career", league: "CFB", school: "Alabama" }, { recognizabilityTier: "D", casualEligible: true })).toThrow();
  });

  it("requires explicit approval for every projected A", () => {
    const approved = new Set(projection.manualApprovals);
    expect(projection.records.filter((record) => record.tier === "A").every((record) => approved.has(record.name))).toBe(true);
  });

  it("is position aware and does not promote meaningless major-program rows", () => {
    const c = projection.records.filter((record) => record.tier === "C");
    expect(new Set(c.map((record) => record.position)).size).toBeGreaterThan(5);
    const lowVolume = projection.records.filter((record) => record.league === "CFB" && record.school === "Alabama" && record.score < 4);
    expect(lowVolume.every((record) => record.tier === "D")).toBe(true);
  });

  it("keeps ordinary team seasons and eras conservative", () => {
    const seasons = footballSubjects.filter((subject) => subject.kind === "team-season");
    expect(seasons.some((subject) => subject.recognizabilityTier === "D")).toBe(true);
    expect(seasons.filter((subject) => !subject.nationalChampion).every((subject) => subject.recognizabilityTier === "D" || subject.recognizabilityTier === "A")).toBe(true);
    expect(footballSubjects.filter((subject) => subject.kind === "program-era").every((subject) => subject.recognizabilityTier === "D")).toBe(true);
  });

  it("preserves aliases and source reconciliation while providing healthy depth", () => {
    expect(getFootballSubject("peyton-manning")?.id).toBe("peyton-manning");
    expect(getFootballSubject("program-texas")?.aliases).toContain("texas-program");
    // Reconciliation safely collapses same-person aliases, leaving a documented small NFL shortfall.
    expect(footballRecognizabilitySubjects.filter((subject) => subject.league === "NFL" && subject.casualEligible).length).toBeGreaterThanOrEqual(1500);
    expect(footballRecognizabilitySubjects.filter((subject) => subject.league === "CFB" && subject.casualEligible).length).toBeGreaterThanOrEqual(2000);
  });

  it("checks in a reproducible generated audit and projection", () => {
    const stable = JSON.stringify(projection);
    expect(createHash("sha256").update(stable).digest("hex")).toHaveLength(64);
    const audit = fs.readFileSync("docs/football-recognizability-audit.md", "utf8");
    expect((audit.match(/^### (NFL|CFB) tier C \(50\)$/gm) ?? [])).toHaveLength(2);
  });
});
