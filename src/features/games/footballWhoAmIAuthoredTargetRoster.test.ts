import { describe, expect, it } from "vitest";
import {
  FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS,
  FOOTBALL_WHO_AM_I_AUTHORED_EXPLICIT_OUT,
  footballWhoAmIAuthoredTargetAudit,
  footballWhoAmIAuthoredTargetRoster,
} from "./footballWhoAmIAuthoredTargetRoster";

describe("Football Who Am I authored target roster", () => {
  it("reconstructs the approved post-audit NFL roster instead of restoring 200", () => {
    const roster = footballWhoAmIAuthoredTargetRoster("NFL");
    console.log("AUTHORED_AUDIT_NFL", JSON.stringify(footballWhoAmIAuthoredTargetAudit("NFL")));
    console.log("AUTHORED_TARGET_NFL", JSON.stringify(roster.subjects.map((subject) => [subject.subjectId, subject.name])));
    expect(roster.players).toHaveLength(120);
    expect(roster.coaches).toHaveLength(20);
    expect(roster.subjects).toHaveLength(140);
    for (const addition of FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS.NFL) {
      expect(roster.players.some((subject) => subject.subjectId === addition.subjectId && subject.name === addition.name)).toBe(true);
    }
  });

  it("reconstructs the approved post-audit CFB roster instead of restoring 200", () => {
    const roster = footballWhoAmIAuthoredTargetRoster("CFB");
    console.log("AUTHORED_AUDIT_CFB", JSON.stringify(footballWhoAmIAuthoredTargetAudit("CFB")));
    console.log("AUTHORED_TARGET_CFB", JSON.stringify(roster.subjects.map((subject) => [subject.subjectId, subject.name])));
    expect(roster.players).toHaveLength(168);
    expect(roster.coaches).toHaveLength(20);
    expect(roster.subjects).toHaveLength(188);
    for (const addition of FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS.CFB) {
      expect(roster.players.some((subject) => subject.subjectId === addition.subjectId && subject.name === addition.name)).toBe(true);
    }
    for (const name of FOOTBALL_WHO_AM_I_AUTHORED_EXPLICIT_OUT.CFB) {
      expect(roster.players.some((subject) => subject.name === name)).toBe(false);
    }
  });
});
