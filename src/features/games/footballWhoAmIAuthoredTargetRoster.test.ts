import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool } from "./footballWhoAmIAuthority";
import {
  FOOTBALL_WHO_AM_I_AUDITED_CUT_NAMES,
  FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS,
  FOOTBALL_WHO_AM_I_AUTHORED_COACH_ADDITIONS,
  FOOTBALL_WHO_AM_I_AUTHORED_COACH_CUT_NAMES,
  FOOTBALL_WHO_AM_I_AUTHORED_EXPLICIT_OUT,
  FOOTBALL_WHO_AM_I_AUTHORED_TARGET_IDENTITIES,
  footballWhoAmIAuthoredTargetRoster,
} from "./footballWhoAmIAuthoredTargetRoster";

const LEAGUES = ["NFL", "CFB"] as const;

function normalizedName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

describe("Football Who Am I authored target roster", () => {
  it("freezes the approved post-audit counts instead of restoring 200/200", () => {
    expect(footballWhoAmIAuthoredTargetRoster("NFL").players).toHaveLength(120);
    expect(footballWhoAmIAuthoredTargetRoster("NFL").coaches).toHaveLength(19);
    expect(footballWhoAmIAuthoredTargetRoster("NFL").subjects).toHaveLength(139);
    expect(footballWhoAmIAuthoredTargetRoster("CFB").players).toHaveLength(168);
    expect(footballWhoAmIAuthoredTargetRoster("CFB").coaches).toHaveLength(25);
    expect(footballWhoAmIAuthoredTargetRoster("CFB").subjects).toHaveLength(193);
  });

  it.each(LEAGUES)("keeps the frozen %s identities unique", (league) => {
    const subjects = FOOTBALL_WHO_AM_I_AUTHORED_TARGET_IDENTITIES[league];
    expect(new Set(subjects.map((subject) => subject.subjectId)).size).toBe(subjects.length);
    expect(new Set(subjects.map((subject) => `${subject.kind}:${normalizedName(subject.name)}`)).size).toBe(subjects.length);
  });

  it.each(LEAGUES)("reconstructs the frozen %s players from the reviewed old census plus approved additions", (league) => {
    const legacy = getFootballWhoAmILaunchPool(league);
    const cuts = new Set(FOOTBALL_WHO_AM_I_AUDITED_CUT_NAMES[league].map(normalizedName));
    expect(legacy.players.filter((subject) => cuts.has(normalizedName(subject.name)))).toHaveLength(cuts.size);

    const reconstructed = new Map(
      legacy.players
        .filter((subject) => !cuts.has(normalizedName(subject.name)))
        .map((subject) => [subject.id, subject.name] as const),
    );
    for (const addition of FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS[league]) {
      reconstructed.set(addition.subjectId, addition.name);
    }

    const frozen = footballWhoAmIAuthoredTargetRoster(league).players;
    expect([...reconstructed.entries()].sort()).toEqual(
      frozen.map((subject) => [subject.subjectId, subject.name] as const).sort(),
    );
  });

  it.each(LEAGUES)("reconstructs the frozen %s coaches from reviewed cuts plus approved additions", (league) => {
    const legacy = getFootballWhoAmILaunchPool(league);
    const cuts = new Set(FOOTBALL_WHO_AM_I_AUTHORED_COACH_CUT_NAMES[league].map(normalizedName));
    expect(legacy.coaches.filter((subject) => cuts.has(normalizedName(subject.name)))).toHaveLength(cuts.size);

    const reconstructed = new Map(
      legacy.coaches
        .filter((subject) => !cuts.has(normalizedName(subject.name)))
        .map((subject) => [subject.id, subject.name] as const),
    );
    for (const addition of FOOTBALL_WHO_AM_I_AUTHORED_COACH_ADDITIONS[league]) {
      reconstructed.set(addition.subjectId, addition.name);
    }

    const frozen = footballWhoAmIAuthoredTargetRoster(league).coaches;
    expect([...reconstructed.entries()].sort()).toEqual(
      frozen.map((subject) => [subject.subjectId, subject.name] as const).sort(),
    );
  });

  it("preserves every approved addition and every explicit CFB exclusion", () => {
    for (const league of LEAGUES) {
      const roster = footballWhoAmIAuthoredTargetRoster(league);
      for (const addition of FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS[league]) {
        expect(roster.players).toContainEqual({
          league,
          subjectId: addition.subjectId,
          name: addition.name,
          kind: "player",
        });
      }
      for (const name of FOOTBALL_WHO_AM_I_AUTHORED_EXPLICIT_OUT[league]) {
        expect(roster.players.some((subject) => normalizedName(subject.name) === normalizedName(name))).toBe(false);
      }
    }
  });
});
