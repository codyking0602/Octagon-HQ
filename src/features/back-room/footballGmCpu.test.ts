import { describe, expect, it } from "vitest";
import type { FootballGmRosterEntry } from "./footballGmEngine";
import { footballGmCpuDraftChoice, footballGmCpuOffseason } from "./footballGmCpu";

function buildCpuRoster(
  seed: string,
  excluded: () => readonly string[],
) {
  let roster: FootballGmRosterEntry[] = [];
  let previousTeam: string | null = null;

  for (let spinIndex = 0; spinIndex < 7; spinIndex += 1) {
    const choice = footballGmCpuDraftChoice({
      roster,
      seed,
      spinIndex,
      previousTeam,
      excludedPlayerIds: excluded(),
    });
    expect(choice).not.toBeNull();
    roster = [
      ...roster,
      {
        slot: choice!.slot,
        playerId: choice!.playerId,
        acquired: "draft" as const,
      },
    ];
    previousTeam = choice!.team;
  }

  return roster;
}

describe("Football GM CPU opponent", () => {
  it("builds disjoint seven-player rosters and finishes both shared-market offseasons under the cap", () => {
    for (let match = 0; match < 12; match += 1) {
      let left: FootballGmRosterEntry[] = [];
      let right: FootballGmRosterEntry[] = [];
      let leftTeam: string | null = null;
      let rightTeam: string | null = null;

      for (let spinIndex = 0; spinIndex < 7; spinIndex += 1) {
        const leftChoice = footballGmCpuDraftChoice({
          roster: left,
          seed: `cpu-left-${match}`,
          spinIndex,
          previousTeam: leftTeam,
          excludedPlayerIds: right.map((entry) => entry.playerId),
        });
        expect(leftChoice).not.toBeNull();
        left = [...left, {
          slot: leftChoice!.slot,
          playerId: leftChoice!.playerId,
          acquired: "draft" as const,
        }];
        leftTeam = leftChoice!.team;

        const rightChoice = footballGmCpuDraftChoice({
          roster: right,
          seed: `cpu-right-${match}`,
          spinIndex,
          previousTeam: rightTeam,
          excludedPlayerIds: left.map((entry) => entry.playerId),
        });
        expect(rightChoice).not.toBeNull();
        right = [...right, {
          slot: rightChoice!.slot,
          playerId: rightChoice!.playerId,
          acquired: "draft" as const,
        }];
        rightTeam = rightChoice!.team;
      }

      expect(new Set([...left, ...right].map((entry) => entry.playerId)).size).toBe(14);

      const first = footballGmCpuOffseason({
        yearOneRoster: left,
        seed: `cpu-left-${match}`,
        excludedPlayerIds: right.map((entry) => entry.playerId),
      });
      expect(first.compliant).toBe(true);

      const second = footballGmCpuOffseason({
        yearOneRoster: right,
        seed: `cpu-right-${match}`,
        excludedPlayerIds: first.roster.map((entry) => entry.playerId),
      });
      expect(second.compliant).toBe(true);
      expect(new Set([...first.roster, ...second.roster].map((entry) => entry.playerId)).size).toBe(14);
    }
  });

  it("respects an explicit shared-player exclusion during a CPU draft", () => {
    const blocker = buildCpuRoster("cpu-blocker", () => []);
    const blockedIds = blocker.map((entry) => entry.playerId);
    const roster = buildCpuRoster("cpu-excluded", () => blockedIds);
    expect(roster.every((entry) => !blockedIds.includes(entry.playerId))).toBe(true);
  });
});
