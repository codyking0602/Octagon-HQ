// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, nflGmLongValidRoster, type NflGmLongPick } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID, NFL_GM_LONG_PLAYER_POOL } from "./footballGmLongCatalog";
import { NFL_GM_LONG_COACHES } from "./footballGmLongCoaches";
import { nflGmLongCreateMidseason, nflGmLongTradePartners, nflGmLongTradeTargets, type NflGmLongMidseason } from "./footballGmLongMidseason";
import { nflGmLongCreateYearOne, nflGmLongValidYearOne } from "./footballGmLongYearOne";
import { nflGmLongInitialSave, nflGmLongParseSave } from "./footballGmLongPersistence";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS, FOOTBALL_GM_TEAMS } from "./footballGmEngine";

const runId = "year-one-regression-locked-2026";
const profileId = "75a58cd2-4682-4ac2-8acc-8684ce0c02bc";
function legalPicks(): NflGmLongPick[] {
  const seen = new Set<string>();
  const picks = NFL_GM_LONG_SLOTS.map(slot => {
    const player = NFL_GM_LONG_PLAYER_POOL.filter(row => row.eligibleSlots.includes(slot) && !seen.has(row.id))
      .sort((a, b) => a.salaryWindow[0] - b.salaryWindow[0])[0]!;
    seen.add(player.id);
    return { slot, playerId: player.id };
  });
  expect(nflGmLongValidRoster(picks, NFL_GM_LONG_BY_ID)).toBe(true);
  return picks;
}
function deadline(picks: readonly NflGmLongPick[], seed = runId) {
  return { ...nflGmLongCreateMidseason(seed, picks, "Dan Campbell"), stage: "complete" as const };
}

describe("Long GM Year 1 Phase 3 — existing franchise preserved", () => {
  it("resolves 17 real games once without modifying a single saved halftime outcome", () => {
    const picks = legalPicks();
    const mid = deadline(picks);
    const year = nflGmLongCreateYearOne(runId, picks, "Dan Campbell", mid);
    expect(year.games).toHaveLength(17);
    expect(year.games.slice(0, 8)).toEqual(mid.games);
    expect(year.games.filter(game => game.won).length).toBe(year.wins);
    expect(year.wins + year.losses).toBe(17);
    expect(new Set(year.games.map(game => game.opponent)).size).toBe(17);
    expect(year.games.every(game => FOOTBALL_GM_TEAMS.includes(game.opponent))).toBe(true);
    expect(year).toEqual(nflGmLongCreateYearOne(runId, picks, "Dan Campbell", mid));
    expect(nflGmLongValidYearOne(year, picks, mid)).toBe(true);
  });

  it("plays the established seeded bracket with no impossible finishes or bye rounds", () => {
    const picks = legalPicks();
    for (let n = 0; n < 24; n++) {
      const seed = "long-year-one-bracket-" + n;
      const mid = deadline(picks, seed);
      const year = nflGmLongCreateYearOne(seed, picks, "Dan Campbell", mid);
      if (year.playoffSeed === null) {
        expect(year.finish).toBe("Missed Playoffs");
        expect(year.postseason).toHaveLength(0);
      } else {
        expect(year.postseason.length).toBeGreaterThan(0);
        expect(year.postseason.length).toBeLessThanOrEqual(4);
        if (year.playoffSeed === 1) expect(year.postseason[0]!.round).toBe("Divisional");
        else expect(year.postseason[0]!.round).toBe("Wild Card");
        if (year.finish === "Champion") {
          expect(year.postseason.at(-1)).toEqual(expect.objectContaining({ round: "Super Bowl", won: true }));
        } else {
          expect(year.postseason.at(-1)!.won).toBe(false);
        }
        expect(year.postseason.slice(0, -1).every(game => game.won)).toBe(true);
      }
    }
  });

  it("an accepted trade changes only the active second-half nine and development, never Games 1–8", () => {
    const picks = legalPicks();
    let target: { outgoingId: string; incomingId: string; partnerTeam: string } | null = null;
    for (const pick of picks) {
      for (const team of nflGmLongTradePartners(pick.playerId)) {
        const options = nflGmLongTradeTargets(picks, pick.playerId, team);
        const outgoing = NFL_GM_LONG_BY_ID.get(pick.playerId)!;
        const candidate = options.find(player => player.currentGrade !== outgoing.currentGrade);
        if (candidate) { target = { outgoingId: pick.playerId, incomingId: candidate.id, partnerTeam: team }; break; }
      }
      if (target) break;
    }
    expect(target).not.toBeNull();
    const original = deadline(picks);
    const traded: NflGmLongMidseason = { ...original, shoppedPlayerId: target!.outgoingId,
      partnerTeam: target!.partnerTeam, trade: target! };
    const before = nflGmLongCreateYearOne(runId, picks, "Dan Campbell", original);
    const after = nflGmLongCreateYearOne(runId, picks, "Dan Campbell", traded);
    expect(after.games.slice(0, 8)).toEqual(before.games.slice(0, 8));
    expect(after.development.some(row => row.playerId === target!.incomingId)).toBe(true);
    expect(after.development.some(row => row.playerId === target!.outgoingId)).toBe(false);
    expect(after.secondHalfStartGrade).not.toBe(before.secondHalfStartGrade);
    expect(nflGmLongValidYearOne(after, picks, traded)).toBe(true);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
  });

  it("keeps pre-Phase 3 owner saves and saves each reveal without rerolling", () => {
    const picks = legalPicks();
    const coach = NFL_GM_LONG_COACHES.find(row => row.name === "Dan Campbell")!;
    const mid = deadline(picks);
    const initial = nflGmLongInitialSave(profileId, runId);
    const old = { ...initial, phase: "midseason" as const, picks, midseason: mid,
      selectedCoachBucket: coach.bucket, selectedCoach: coach.name, coachWheelDraw: .32 };
    const legacy = { ...old } as Record<string, unknown>;
    delete legacy.yearOne;
    const parsed = nflGmLongParseSave(legacy, profileId, NFL_GM_LONG_BY_ID);
    expect(parsed?.phase).toBe("midseason");
    expect(parsed?.yearOne).toBeNull();
    const result = nflGmLongCreateYearOne(runId, picks, coach.name, mid);
    const progressed = { ...result, stage: "standings" as const, revealedGames: 9 };
    const newSave = { ...parsed!, phase: "year1" as const, yearOne: progressed };
    expect(nflGmLongParseSave(newSave, profileId, NFL_GM_LONG_BY_ID)?.yearOne).toEqual(progressed);
    expect(nflGmLongParseSave({ ...newSave, yearOne: { ...progressed, games: [] } },
      profileId, NFL_GM_LONG_BY_ID)).toBeNull();
    expect(nflGmLongParseSave({ ...newSave, yearOne: { ...progressed, revealedGames: 0 } },
      profileId, NFL_GM_LONG_BY_ID)).toBeNull();
  });

  it("keeps four scouting pills, qualitative-only development and narrow mobile schedule", () => {
    const ui = readFileSync("src/features/back-room/FootballGmLongYearOnePage.tsx", "utf8");
    const css = readFileSync("src/styles/football-gm-long.css", "utf8");
    expect(ui).toContain("<LongPlayerTags player={player} />");
    expect(ui).toContain("nflGmLongDevelopmentOutcome(delta)");
    expect(ui).not.toContain("${delta}");
    expect(css).toContain(".gm-long-y1__games");
    expect(css).toContain("@media(max-width:350px)");
    expect(ui).toContain("FIRST EIGHT · LOCKED");
  });
});
