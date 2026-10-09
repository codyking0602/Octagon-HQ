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

  it("allows two-RB and two-WR builds while preserving the required native slot", () => {
    const firstRb = player("Chase Brown");
    const secondRb = player("Jacory Croskey-Merritt");
    const firstWr = FOOTBALL_GM_PLAYER_POOL.find((candidate) => candidate.family === "WR" && candidate.eligibleSlots.includes("WR") && candidate.eligibleSlots.includes("FLEX"));
    const secondWr = FOOTBALL_GM_PLAYER_POOL.find((candidate) => candidate.family === "WR" && candidate.id !== firstWr?.id && candidate.eligibleSlots.includes("WR") && candidate.eligibleSlots.includes("FLEX"));
    if (!firstWr || !secondWr) throw new Error("Missing GM WR test players.");

    const twoRb = footballGmAutoAddPick(
      footballGmAutoAddPick([], firstRb.id),
      secondRb.id,
    );
    expect(twoRb.filter((entry) => entry.playerId === firstRb.id || entry.playerId === secondRb.id).map((entry) => entry.slot).sort())
      .toEqual(["FLEX", "RB"]);

    const twoWr = footballGmAutoAddPick(
      footballGmAutoAddPick([], firstWr.id),
      secondWr.id,
    );
    expect(twoWr.filter((entry) => entry.playerId === firstWr.id || entry.playerId === secondWr.id).map((entry) => entry.slot).sort())
      .toEqual(["FLEX", "WR"]);
  });

  it("does not allow two tight ends or a roster that skips the required RB/WR slots", () => {
    const firstTe = player("Brock Bowers");
    const secondTe = FOOTBALL_GM_PLAYER_POOL.find((candidate) => (
      candidate.family === "TE"
      && candidate.id !== firstTe.id
      && candidate.eligibleSlots.length === 1
      && candidate.eligibleSlots[0] === "FLEX"
    ));
    if (!secondTe) throw new Error("Missing second GM TE test player.");

    const oneTe = footballGmAutoAddPick([], firstTe.id);
    expect(oneTe[0]?.slot).toBe("FLEX");
    expect(() => footballGmAutoAddPick(oneTe, secondTe.id)).toThrow();

    expect(footballGmOpenSlots(oneTe)).toContain("RB");
    expect(footballGmOpenSlots(oneTe)).toContain("WR");
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

describe("GM weighted-slot automatic assignment", () => {
  it("puts Jefferson in WR and Egbuka in FLEX regardless of pick order", () => {
    const egbuka = player("Emeka Egbuka");
    const jefferson = player("Justin Jefferson");
    for (const flipped of [false, true]) {
      const rows: FootballGmRosterEntry[] = flipped
        ? [{ slot: "WR", playerId: jefferson.id, acquired: "draft" }, { slot: "FLEX", playerId: egbuka.id, acquired: "draft" }]
        : [{ slot: "WR", playerId: egbuka.id, acquired: "draft" }, { slot: "FLEX", playerId: jefferson.id, acquired: "draft" }];
      const placed = footballGmReflowRoster(rows)!;
      expect(placed.find(x => x.slot === "WR")?.playerId).toBe(jefferson.id);
      expect(placed.find(x => x.slot === "FLEX")?.playerId).toBe(egbuka.id);
    }
  });

  it("recalculates optimal WR/FLEX positions using each season's seeded development", () => {
    const egbuka = player("Emeka Egbuka");
    const jefferson = player("Justin Jefferson");
    const rows: FootballGmRosterEntry[] = [
      { slot: "WR", playerId: egbuka.id, acquired: "draft" },
      { slot: "FLEX", playerId: jefferson.id, acquired: "draft" },
    ];
    for (const year of [1, 2, 3] as const) {
      const placed = footballGmReflowRoster(rows, year, "developed-slot-test:gmdev1")!;
      expect(placed).toHaveLength(2);
      expect(placed.find(x => x.slot === "WR")?.playerId).toBe(jefferson.id);
    }
  });
});
