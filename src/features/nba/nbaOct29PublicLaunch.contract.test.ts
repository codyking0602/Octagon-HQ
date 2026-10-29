import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { nbaDailyGameAppearance } from "./nbaDailyPublicationIdentity";
import { nbaCanAccessReleasedGames, nbaRegularSeasonDaily } from "./nbaDailySchedule";

const migration = readFileSync("supabase/migrations/202612310890_nba_oct29_bar_trivia_public_launch.sql","utf8");
const home = readFileSync("src/features/nba/NbaOwnerHomeHq.tsx","utf8");
const play = readFileSync("src/features/nba/NbaPlayPage.tsx","utf8");
const dailyPage = readFileSync("src/features/nba/NbaOfficialDailyPage.tsx","utf8");

describe("October 29 first PUBLIC NBA Bar Trivia cutover", () => {
  it("reuses the exact immutable reviewed board and server-graded 81/100", () => {
    expect(migration).toContain("AND d.schedule_version='nba-daily-owner-prelaunch-v1'");
    expect(migration).toContain("AND normalized_score=81 AND native_score=81");
    expect(migration).toContain("SELECT gen_random_uuid(),central_day,'nba-daily-public-opening-bar-trivia-oct29'");
    expect(migration).toContain("game_type,setup_id,content_version,scoring_version,NULL,published_at");
    expect(migration).toContain("attempt.submission_evidence,attempt.grading_evidence_snapshot");
    expect(migration).toContain("progress.public_state,progress.started_at,progress.updated_at");
    expect(migration).toContain("Public NBA Daily already published; refuse replacement");
    expect(migration).not.toContain("DELETE FROM private.daily_challenges");
    expect(migration).not.toContain("UPDATE private.daily_challenge_attempts");
  });
  it("serves one board Oct 29–31, then regular odd-day cadence opposite UFC", () => {
    for (const day of ["2026-10-29","2026-10-30","2026-10-31"]) {
      expect(nbaRegularSeasonDaily(day)).toMatchObject({day:"2026-10-29",nextDay:"2026-11-01",gameType:"bar_trivia"});
      expect(nbaCanAccessReleasedGames(day)).toBe(true);
    }
    for (const [day,game] of [
      ["2026-11-01","average_fan"],["2026-11-03","sports_feud"],["2026-11-05","who_am_i"],
    ]) expect(nbaRegularSeasonDaily(day)?.gameType).toBe(game);
    expect(nbaDailyGameAppearance("2026-10-29","bar_trivia")).toBe(0);
    expect(nbaDailyGameAppearance("2026-11-21","bar_trivia")).toBe(1);
    expect(migration).toContain("date '2026-10-29'");
    expect(migration).toContain("nba-daily-regular-v4-nov01-public");
    expect(migration).toContain("v_nba_start_day := case when v_day = date ''2026-10-31''");
    expect(migration).toContain("v_start := case when v_day = date ''2026-10-31''");
    expect(migration).toContain("if false and v_day = date ''2026-10-30''");
  });
  it("keeps Home and Play official after Oct 29, not owner-only preview", () => {
    expect(home).toContain('enabled: signedIn && dailyEnabled, sport: "nba"');
    expect(home).toContain('rank != null ? `#${rank} today` : "Official score locked"');
    expect(play).toContain('const ownerTest = owner && !published && ownerPreview != null;');
    expect(play).toContain('owner && !published ? <section className="nba-games-hub__owner-tools"');
    expect(dailyPage).toContain("&& !nbaCanAccessReleasedGames(nbaCentralDay())");
    expect(migration).toContain("No UFC/Football changes");
  });
});
