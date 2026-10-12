import { describe, expect, it } from "vitest";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS, FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_TEAMS } from "./footballGmEngine";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, nflGmLongOverall, nflGmLongSpend, nflGmLongValidRoster, nflGmLongOlAuditErrors } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID, NFL_GM_LONG_PLAYER_POOL, NFL_GM_LONG_OL_PLAYERS, nflGmLongEligibleTeams, nflGmLongTeamCandidates } from "./footballGmLongCatalog";
import { NFL_GM_LONG_COACHES, NFL_GM_LONG_COACH_BUCKETS, nflGmLongCoachesInBucket, nflGmLongSpinCoach, nflGmLongCoachEffects } from "./footballGmLongCoaches";
import { nflGmLongInitialSave, nflGmLongParseSave } from "./footballGmLongPersistence";

describe("NFL GM Long Phase 1 integrated roster", () => {
  it("integrates all 179 audited OL identities with salaries, researched grades, and contracts", () => {
    expect(NFL_GM_LONG_OL_PLAYERS).toHaveLength(179);
    expect(nflGmLongOlAuditErrors(NFL_GM_LONG_OL_PLAYERS, FOOTBALL_GM_TEAMS)).toEqual([]);
    expect(NFL_GM_LONG_PLAYER_POOL).toHaveLength(FOOTBALL_GM_PLAYER_POOL.length + 179);
    expect(new Set(NFL_GM_LONG_OL_PLAYERS.map(p => p.team))).toEqual(new Set(FOOTBALL_GM_TEAMS));
    expect(NFL_GM_LONG_OL_PLAYERS.every(p => p.sourceUrls.length >= 2 && p.salaryApy > 500_000)).toBe(true);
    expect(NFL_GM_LONG_OL_PLAYERS.some(p => p.role === "C")).toBe(true);
    expect(NFL_GM_LONG_OL_PLAYERS.some(p => p.role === "G")).toBe(true);
    expect(NFL_GM_LONG_OL_PLAYERS.some(p => p.role === "T")).toBe(true);
    const line = NFL_GM_LONG_PLAYER_POOL.filter(p => p.family === "OL");
    expect(line.every(p => p.eligibleSlots.length === 1 && p.eligibleSlots[0] === "OL")).toBe(true);
    expect(line.every(p => p.salaryWindow[0] <= NFL_GM_LONG_CAP && p.salaryWindow[1] > 0)).toBe(true);
    expect(line.every(p => p.age === null)).toBe(true); // No invented ages in research CSV.
  });

  it("preserves exact Short GM authority and separate identity namespace", () => {
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    expect(NFL_GM_LONG_SLOTS).toHaveLength(9);
    expect(FOOTBALL_GM_PLAYER_POOL.every(p => String(p.family) !== "OL")).toBe(true);
  });

  it("offers every team an OL option, and never duplicates a roster name or slot", () => {
    for (const team of FOOTBALL_GM_TEAMS) {
      expect(nflGmLongTeamCandidates(team, []).some(c => c.player.family === "OL")).toBe(true);
    }
    expect(nflGmLongEligibleTeams([], null)).toHaveLength(32);
    // Pick a valid QB to exercise duplicate slots and later-player restrictions.
    const first = NFL_GM_LONG_PLAYER_POOL.find(p => p.eligibleSlots.includes("QB"))!;
    const pick = [{ slot: "QB" as const, playerId: first.id }];
    expect(nflGmLongValidRoster(pick, NFL_GM_LONG_BY_ID)).toBe(true);
    expect(nflGmLongValidRoster([...pick, ...pick], NFL_GM_LONG_BY_ID)).toBe(false);
    expect(nflGmLongTeamCandidates(first.team, pick).some(c => c.player.id === first.id)).toBe(false);
    expect(nflGmLongSpend(pick, NFL_GM_LONG_BY_ID, 1)).toBe(first.salaryWindow[0]);
  });

  it("can construct complete legal rosters with seeded full NFL team wheels", () => {
    let successful = 0;
    for (let seed = 1; seed <= 150; seed++) {
      let state = seed * 1273;
      const random = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
      const picks: { slot: typeof NFL_GM_LONG_SLOTS[number]; playerId: string }[] = [];
      let previous: string | null = null;
      for (let i = 0; i < 9; i++) {
        const teams = nflGmLongEligibleTeams(picks, previous);
        if (!teams.length) break;
        const team = teams[Math.floor(random() * teams.length)]!;
        const options = nflGmLongTeamCandidates(team, picks);
        const selected = options.reduce((best, row) => row.player.currentGrade > best.player.currentGrade ? row : best);
        const slot = selected.slots[0]!;
        picks.push({ slot, playerId: selected.player.id });
        previous = team;
      }
      if (picks.length === 9) {
        successful++;
        expect(nflGmLongValidRoster(picks, NFL_GM_LONG_BY_ID)).toBe(true);
        expect(nflGmLongOverall(picks, NFL_GM_LONG_BY_ID)).not.toBeNull();
        const owner = nflGmLongInitialSave("01234567-89ab-cdef-0123-456789abcdef", "long-seed-" + seed);
        const hydrated = nflGmLongParseSave({ ...owner, phase: "coach-bucket", picks }, owner.profileId, NFL_GM_LONG_BY_ID);
        expect(hydrated?.phase).toBe("coach-bucket");
      }
    }
    expect(successful).toBeGreaterThanOrEqual(148);
  });

  it("retains all 32 coach identities and individual context differences", () => {
    expect(NFL_GM_LONG_COACHES).toHaveLength(32);
    expect(NFL_GM_LONG_COACH_BUCKETS.map(b => nflGmLongCoachesInBucket(b).length)).toEqual([12, 7, 5, 8]);
    for (const bucket of NFL_GM_LONG_COACH_BUCKETS) {
      const group = nflGmLongCoachesInBucket(bucket);
      for (let i = 0; i < group.length; i++) {
        const draw = (i + 0.5) / group.length;
        expect(nflGmLongSpinCoach(bucket, draw).name).toBe(group[i]!.name);
      }
    }
    const team = NFL_GM_LONG_SLOTS.map(slot => ({ slot, age: slot === "OL" ? null : 25, grade: 88 }));
    const outcome = NFL_GM_LONG_COACHES.map(coach => ({ coach, effects: nflGmLongCoachEffects(coach, team) }));
    expect(new Set(outcome.map(x => JSON.stringify(x.effects))).size).toBeGreaterThan(15);
    expect(outcome.every(x => Object.values(x.effects).every(v => Number.isFinite(v) && v >= 0))).toBe(true);
  });
});
