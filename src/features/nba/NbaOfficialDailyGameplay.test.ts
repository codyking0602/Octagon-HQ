import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nbaOfficialActiveRound } from "./NbaOfficialDailyGameplay";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";

const source = (path: string) => readFileSync(path, "utf8");
const daily = source("src/features/nba/NbaOfficialTodayPage.tsx");
const route = source("src/app/router.tsx");
const hub = source("src/features/nba/NbaPlayPage.tsx");
const edge = source("supabase/functions/daily-challenge-runtime/index.ts");
const calendar = source("src/features/nba/nbaDailySchedule.ts");

function projection(complete = false): TodayChallengeProjection {
  return {
    available: true, sport: "nba", id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-11-13", scheduleVersion: "nba-daily-regular-v1",
    gameType: "wavelength", setupKey: "nba:wavelength", contentVersion: "nba-daily",
    scoringVersion: "official", fallbackReason: null, progressRevision: 9,
    publicSetup: {
      format_version: "daily-two-game-average-v1", rounds: [
        { league: "NBA", stat_label: "Scoring" },
        { league: "NBA", stat_label: "Playmaking" },
      ],
    },
    publicState: {
      round_index: 1, active_round: { guesses: [51, 76] }, round_scores: [90, 80],
    },
    revealSetup: { rounds: [{ target: 51 }, { target: 76 }] },
    officialAttempt: complete ? {
      nativeScore: 85, normalizedScore: 85, completedAt: "2026-11-13T20:00:00Z", publicResult: {},
    } : null,
    deploymentSha: "test",
  };
}
describe("NBA official Daily front-end safety", () => {
  it("never unlocks reveal evidence for an unfinished game", () => {
    expect(nbaOfficialActiveRound(projection(false))).toEqual({
      index: 1, setup: { league: "NBA", stat_label: "Playmaking" },
      state: { guesses: [51, 76] }, reveal: {}, score: null,
    });
    expect(nbaOfficialActiveRound(projection(true)).reveal).toEqual({ target: 76 });
    expect(nbaOfficialActiveRound(projection(true)).score).toBe(80);
  });

  it("routes official NBA game, standings, and private rehearsals independently", () => {
    expect(route).toContain('path: "nba/today"');
    expect(route).toContain('path: "nba/standings"');
    expect(hub).toContain('navigate(published ? "/nba/today" : previewRoute(featured))');
    expect(hub).toContain('navigate("/nba/standings")');
    expect(daily).toContain('sport: "nba"');
    expect(daily).toContain("enabled: released && signedIn");
    expect(daily).toContain("if (!released) return <NbaDailyGate />");
    expect(daily).toContain('<TodayChallengeHub sport="nba" />');
  });

  it("keeps both independent release gates closed until nine-game signoff", () => {
    expect(calendar).toContain("export const NBA_OFFICIAL_GAMES_RELEASE_READY = false;");
    expect(edge).toContain("const NBA_DAILY_EDGE_RELEASE_READY = false;");
    for (const game of [
      "average_fan", "sports_feud", "millionaire", "who_am_i",
      "bar_trivia", "find_leader", "wavelength", "hit_the_number", "higher_lower",
    ]) {
      expect(daily).toContain('case "' + game + '":');
    }
  });

  it("preserves server-owned scoring and separate NBA-only artwork", () => {
    const game = source("src/features/nba/NbaOfficialDailyGameplay.tsx");
    expect(game).toContain("projection.officialAttempt");
    expect(game).toContain("nbaHitHeadshot");
    expect(game).toContain("nbaFindLeaderHeadshot");
    expect(game).toContain("onAdvance({ eliminated_id: id })");
    expect(game).toContain("onAdvance({ fighter_id: id })");
    expect(game).toContain("onAdvance({ lock: true })");
    expect(game).toContain("onAdvance({ guess })");
    expect(game).toContain('onAdvance({ choice: "higher" })');
    expect(game).not.toContain("createNbaWavelengthDailyPreview");
    expect(game).not.toContain("createNbaHitTheNumberPlan");
    expect(game).not.toContain("createNbaFindLeaderDailyPreview");
  });
});
