import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Daily Challenge Standings backend contract", () => {
  const migration = readFileSync(
    "supabase/migrations/202609100001_daily_challenge_standings.sql",
    "utf8",
  );
  const sqlTest = readFileSync(
    "supabase/tests/daily_challenge_standings.sql",
    "utf8",
  );
  const generalizedSuite = readFileSync(
    "supabase/tests/generalized_todays_challenge_backend.sql",
    "utf8",
  );
  const hub = readFileSync("src/features/play/TodayChallengeHub.tsx", "utf8");
  const component = readFileSync(
    "src/features/play/DailyChallengeStandings.tsx",
    "utf8",
  );

  it("uses one authenticated cumulative projection over official daily history", () => {
    expect(migration).toContain("create or replace function public.get_daily_challenge_standings()");
    expect(migration).toContain("from private.daily_challenge_history");
    expect(migration).toContain("security definer");
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("revoke all on function public.get_daily_challenge_standings()");
    expect(migration).toContain("from public, anon");
    expect(migration).toContain("to authenticated");
  });

  it("ranks by wins and preserves the approved score, participation, streak, and game breakdowns", () => {
    expect(migration).toContain("max(normalized_score) as winning_score");
    expect(migration).toContain("history.normalized_score = daily_winners.winning_score");
    expect(migration).toContain("member.wins desc");
    expect(migration).toContain("member.average_score desc");
    expect(migration).toContain("member.played desc");
    expect(migration).toContain("'current_streak'");
    expect(migration).toContain("'best_streak'");
    for (const game of [
      "find_leader",
      "wavelength",
      "blind_resume",
      "blind_rank_5",
      "keep_4_cut_4",
    ]) {
      expect(migration).toContain(`'${game}'`);
    }
  });

  it("proves tied wins, zero-play members, current streak semantics, game averages, and anonymous denial", () => {
    expect(sqlTest).toContain("tied daily wins or yesterday-current streak were calculated incorrectly");
    expect(sqlTest).toContain("members without an official play were omitted or misrepresented");
    expect(sqlTest).toContain("current member standings or game averages are incorrect");
    expect(sqlTest).toContain("anonymous role can read Daily Challenge Standings");
    expect(generalizedSuite).toContain("\\ir daily_challenge_standings.sql");
    expect(generalizedSuite.match(/202609100001_daily_challenge_standings\.sql/g)).toHaveLength(2);
  });

  it("replaces the old history accordion with only the approved collapsed standings and member detail", () => {
    expect(hub).toContain("<DailyChallengeStandings");
    expect(hub).not.toContain("Official challenge record");
    expect(hub).not.toContain("today-hub-history");
    expect(component).toContain("Daily Challenge Standings");
    expect(component).toContain("Current");
    expect(component).toContain("Longest");
    expect(component).toContain("Average Score by Game");
    expect(component).not.toContain("Average Finish");
    expect(component).not.toContain("Podium");
    expect(component).not.toContain("Records");
  });
});
