import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_PLAYER_POOL,
  footballGmAddPick,
  footballGmAutoAddPick,
  footballGmCandidatesForTeam,
  footballGmOpenSlots,
  footballGmReflowRoster,
  type FootballGmRosterEntry,
} from "./footballGmEngine";

function player(name: string) {
  const match = FOOTBALL_GM_PLAYER_POOL.find((candidate) => candidate.name === name);
  if (!match) throw new Error(`Missing GM test player: ${name}`);
  return match;
}

describe("The GM automatic roster reflow", () => {
  it("moves an RB out of FLEX so a later TE remains draftable", () => {
    const runningBack = player("Chase Brown");
    const tightEnd = player("Brock Bowers");

    const roster = footballGmAddPick([], runningBack.id, "FLEX");
    expect(roster.find((entry) => entry.playerId === runningBack.id)?.slot).toBe("RB");
    expect(footballGmOpenSlots(roster)).toContain("FLEX");

    const raiders = footballGmCandidatesForTeam({
      team: tightEnd.team,
      roster,
      year: 1,
    });
    expect(raiders.find((candidate) => candidate.player.id === tightEnd.id)?.legalSlots).toContain("FLEX");

    const next = footballGmAutoAddPick(roster, tightEnd.id);
    expect(next.find((entry) => entry.playerId === runningBack.id)?.slot).toBe("RB");
    expect(next.find((entry) => entry.playerId === tightEnd.id)?.slot).toBe("FLEX");
  });

  it("still allows an intentional two-running-back build", () => {
    const first = player("Chase Brown");
    const second = player("Jacory Croskey-Merritt");

    const roster = footballGmAutoAddPick(
      footballGmAutoAddPick([], first.id),
      second.id,
    );
    const rbSlots = roster
      .filter((entry) => entry.playerId === first.id || entry.playerId === second.id)
      .map((entry) => entry.slot)
      .sort();

    expect(rbSlots).toEqual(["FLEX", "RB"]);
  });

  it("repairs legacy active runs that saved a movable skill player in FLEX", () => {
    const runningBack = player("Chase Brown");
    const legacy: FootballGmRosterEntry[] = [{
      slot: "FLEX",
      playerId: runningBack.id,
      acquired: "draft",
    }];

    const repaired = footballGmReflowRoster(legacy);
    expect(repaired).not.toBeNull();
    expect(repaired?.[0]?.slot).toBe("RB");
    expect(footballGmOpenSlots(legacy)).toContain("FLEX");
  });
});
