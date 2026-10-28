import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmAutoAddPick,
  footballGmCandidatesForTeam,
  footballGmEligibleTeams,
  footballGmOpenSlots,
  footballGmPlayerById,
  footballGmRosterCap,
  footballGmSpinTeam,
} from "./footballGmEngine";
import { FOOTBALL_GM_SOLO_QUARTERBACKS, footballGmSoloOpeningQuarterback } from "./footballGmSoloStart";

describe("Solo GM choose your QB", () => {
  it("offers canonical quarterbacks only, with their unchanged contracts and development", () => {
    expect(FOOTBALL_GM_SOLO_QUARTERBACKS).toHaveLength(
      FOOTBALL_GM_PLAYER_POOL.filter((player) => player.family === "QB").length,
    );
    expect(new Set(FOOTBALL_GM_SOLO_QUARTERBACKS.map((player) => player.id)).size)
      .toBe(FOOTBALL_GM_SOLO_QUARTERBACKS.length);
    expect(FOOTBALL_GM_SOLO_QUARTERBACKS.every((player) => player.eligibleSlots.includes("QB"))).toBe(true);

    for (const name of ["Dak Prescott", "Jaxson Dart", "Michael Penix Jr."]) {
      const player = FOOTBALL_GM_SOLO_QUARTERBACKS.find((qb) => qb.name === name)!;
      const opening = footballGmSoloOpeningQuarterback(player.id);
      expect(opening).toEqual([{ slot: "QB", playerId: player.id, acquired: "draft" }]);
      expect(footballGmRosterCap(opening!, 1)).toBe(player.salaryApy);
      expect(footballGmPlayerById(opening![0]!.playerId)).toBe(player);
      expect(footballGmOpenSlots(opening!)).not.toContain("QB");
      expect(opening).toHaveLength(1);
    }
  });

  it("rejects invalid, missing and non-quarterback selections", () => {
    const nonQb = FOOTBALL_GM_PLAYER_POOL.find((player) => player.family === "RB")!;
    expect(footballGmSoloOpeningQuarterback(null)).toBeNull();
    expect(footballGmSoloOpeningQuarterback("not-a-player")).toBeNull();
    expect(footballGmSoloOpeningQuarterback(nonQb.id)).toBeNull();
  });

  it.each(["Dak Prescott", "Jaxson Dart", "Michael Penix Jr."])(
    "fills six standard independent wheel turns around %s, without a second QB",
    (name) => {
      const qb = FOOTBALL_GM_SOLO_QUARTERBACKS.find((player) => player.name === name)!;
      let roster = footballGmSoloOpeningQuarterback(qb.id)!;
      let previousTeam: string | null = null;
      const seed = "choose-qb-solo-fixture:gmdev1";

      for (let spinIndex = 1; spinIndex <= 6; spinIndex += 1) {
        const teams = footballGmEligibleTeams({ roster, previousTeam, year: 1 });
        const team = footballGmSpinTeam(seed, spinIndex, teams);
        expect(team).not.toBeNull();
        const candidates = footballGmCandidatesForTeam({ team: team!, roster, year: 1 });
        expect(candidates.length).toBeGreaterThan(0);
        expect(candidates.every((candidate) => candidate.player.family !== "QB")).toBe(true);
        const cheapest = [...candidates].sort((a, b) => a.salary - b.salary)[0]!;
        roster = footballGmAutoAddPick(roster, cheapest.player.id);
        previousTeam = cheapest.player.team;
      }

      expect(roster).toHaveLength(FOOTBALL_GM_ROSTER_SLOTS.length);
      expect(new Set(roster.map((entry) => entry.slot)).size).toBe(7);
      expect(roster.filter((entry) => entry.slot === "QB")).toEqual([
        { slot: "QB", playerId: qb.id, acquired: "draft" },
      ]);
      expect(footballGmRosterCap(roster, 1)).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
    },
  );
});
