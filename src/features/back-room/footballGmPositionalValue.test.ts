import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_POSITION_WEIGHTS,
  FOOTBALL_GM_NEUTRAL_GRADE,
  footballGmActualRole,
  footballGmWeightedContribution,
} from "./footballGmPositionalValue";
import {
  FOOTBALL_GM_PLAYER_POOL,
  footballGmTeamGrade,
  type FootballGmRosterEntry,
} from "./footballGmEngine";
import { footballGmEffectiveTeamGrade } from "./footballGmStrategy";

const player = (name: string) => {
  const found = FOOTBALL_GM_PLAYER_POOL.find(row => row.name === name);
  if (!found) throw new Error("Missing player: " + name);
  return found;
};

describe("NFL GM role-sensitive valuation", () => {
  it("preserves seven-slot baseline at 100% with stable deterministic roles", () => {
    expect(Object.values(FOOTBALL_GM_POSITION_WEIGHTS).reduce((s, v) => s + v, 0)).toBeCloseTo(1);
    expect(footballGmActualRole(player("Will Anderson Jr."))).toBe("EDGE");
    expect(footballGmActualRole(player("Fred Warner"))).toBe("LB");
    expect(footballGmActualRole(player("Cameron Heyward"))).toBe("IDL");
    expect(footballGmActualRole(player("Kyle Hamilton"))).toBe("S");
    expect(footballGmActualRole(player("Travis Hunter"))).toBe("WR");
  });

  it("adjusts only the excess above neutral 80; both front-seven slots are equivalent", () => {
    const edge = player("Will Anderson Jr.");
    const linebacker = player("Fred Warner");
    expect(footballGmWeightedContribution(edge, "DL", FOOTBALL_GM_NEUTRAL_GRADE)).toBe(0);
    expect(footballGmWeightedContribution(linebacker, "LB", FOOTBALL_GM_NEUTRAL_GRADE)).toBe(0);
    const edgeValue = footballGmWeightedContribution(edge, "DL", 99);
    const lbValue = footballGmWeightedContribution(linebacker, "LB", 97);
    expect(edgeValue - lbValue).toBeCloseTo(0.7924, 4);
    expect(footballGmWeightedContribution(edge, "DL", 99)).toBeCloseTo(
      footballGmWeightedContribution(edge, "LB", 99),
    );
    expect(footballGmWeightedContribution(linebacker, "DL", 97)).toBeCloseTo(
      footballGmWeightedContribution(linebacker, "LB", 97),
    );
  });

  it("makes WR, RB and TE FLEX valuations distinct without altering mandatory WR/RB weights", () => {
    expect(footballGmWeightedContribution(player("Puka Nacua"), "FLEX", 90)).toBeCloseTo(0.84);
    expect(footballGmWeightedContribution(player("Bijan Robinson"), "FLEX", 90)).toBeCloseTo(0.768);
    expect(footballGmWeightedContribution(player("Brock Bowers"), "FLEX", 90)).toBeCloseTo(0.824);
    expect(footballGmWeightedContribution(player("Puka Nacua"), "WR", 90)).toBeCloseTo(1.4);
  });

  it("keeps solo and seeded shared scoring on one scoring authority", () => {
    const roster: FootballGmRosterEntry[] = [
      { slot: "QB", playerId: player("Josh Allen").id, acquired: "draft" },
      { slot: "RB", playerId: player("Bijan Robinson").id, acquired: "draft" },
      { slot: "WR", playerId: player("Puka Nacua").id, acquired: "draft" },
      { slot: "FLEX", playerId: player("Brock Bowers").id, acquired: "draft" },
      { slot: "DL", playerId: player("Will Anderson Jr.").id, acquired: "draft" },
      { slot: "LB", playerId: player("Fred Warner").id, acquired: "draft" },
      { slot: "DB", playerId: player("Kyle Hamilton").id, acquired: "draft" },
    ];
    const initial = footballGmTeamGrade(roster, 1);
    const seeded = footballGmEffectiveTeamGrade(roster, roster, 1, "valuation-regression");
    expect(seeded.rawTeamGrade).toBe(initial);
    expect(initial).toBeGreaterThan(95);
    const flipped = roster.map(entry =>
      entry.slot === "DL" ? { ...entry, slot: "LB" as const }
        : entry.slot === "LB" ? { ...entry, slot: "DL" as const } : entry,
    );
    expect(footballGmTeamGrade(flipped, 1)).toBe(initial);
  });
});
