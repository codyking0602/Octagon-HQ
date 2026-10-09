import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmPlayerById,
  footballGmReflowRoster,
  footballGmSlotLabel,
  footballGmTeamGrade,
  type FootballGmRosterEntry,
} from "./footballGmEngine";
import {
  FOOTBALL_GM_POSITION_WEIGHTS,
  footballGmEffectiveTeamGrade,
} from "./footballGmStrategy";

const acquired = "draft" as const;

describe("NFL GM double Front Seven positions", () => {
  it("keeps persisted slot keys and admits all 191 Front Seven players into either spot", () => {
    expect(FOOTBALL_GM_ROSTER_SLOTS).toEqual(["QB", "RB", "WR", "FLEX", "DL", "LB", "DB"]);
    expect(footballGmSlotLabel("DL")).toBe("F7-1");
    expect(footballGmSlotLabel("LB")).toBe("F7-2");
    const defenders = FOOTBALL_GM_PLAYER_POOL.filter((player) => player.family === "Front Seven");
    expect(defenders).toHaveLength(191);
    expect(defenders.every((player) => player.eligibleSlots.join(",") === "DL,LB")).toBe(true);
    expect(defenders.some((player) => player.marketPosition === "DL")).toBe(true);
    expect(defenders.some((player) => player.marketPosition === "LB")).toBe(true);
  });

  it("supports two DL or two LB market players on one roster without duplicating identities", () => {
    const defenders = FOOTBALL_GM_PLAYER_POOL.filter((player) => player.family === "Front Seven");
    for (const position of ["DL", "LB"] as const) {
      const [first, second] = defenders.filter((player) => player.marketPosition === position);
      expect(first).toBeDefined();
      expect(second).toBeDefined();
      const roster: FootballGmRosterEntry[] = [
        { slot: "DL", playerId: first!.id, acquired },
        { slot: "LB", playerId: second!.id, acquired },
      ];
      const normalized = footballGmReflowRoster(roster);
      expect(normalized?.map((entry) => entry.slot)).toEqual(["DL", "LB"]);
      expect(new Set(normalized?.map((entry) => entry.playerId)).size).toBe(2);
    }
  });

  it("keeps equal nominal 14% Front Seven slots but values actual roles in both scoring paths", () => {
    const pick = (family: string, skipId?: string) =>
      FOOTBALL_GM_PLAYER_POOL.find((player) => player.family === family && player.id !== skipId)!;
    const first = pick("Front Seven");
    const second = pick("Front Seven", first.id);
    const roster: FootballGmRosterEntry[] = [
      { slot: "QB", playerId: pick("QB").id, acquired },
      { slot: "RB", playerId: pick("RB").id, acquired },
      { slot: "WR", playerId: pick("WR").id, acquired },
      { slot: "FLEX", playerId: pick("TE").id, acquired },
      { slot: "DL", playerId: first.id, acquired },
      { slot: "LB", playerId: second.id, acquired },
      { slot: "DB", playerId: pick("Secondary").id, acquired },
    ];
    expect(FOOTBALL_GM_POSITION_WEIGHTS).toEqual({
      QB: 0.28, RB: 0.08, WR: 0.14, FLEX: 0.08,
      DL: 0.14, LB: 0.14, DB: 0.14,
    });
    expect(Object.values(FOOTBALL_GM_POSITION_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 9);
    const swapped = roster.map((entry) =>
      entry.slot === "DL" ? { ...entry, slot: "LB" as const }
        : entry.slot === "LB" ? { ...entry, slot: "DL" as const }
          : entry,
    );
    expect(footballGmTeamGrade(roster, 1)).toBe(footballGmTeamGrade(swapped, 1));
    expect(footballGmEffectiveTeamGrade(roster, roster, 1).rawTeamGrade)
      .toBe(footballGmEffectiveTeamGrade(swapped, swapped, 1).rawTeamGrade);
    expect(roster.every((entry) =>
      footballGmPlayerById(entry.playerId)?.eligibleSlots.includes(entry.slot))).toBe(true);
  });
});
