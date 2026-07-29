import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../../../supabase/migrations/202608190001_find_leader_daily_leaderboard.sql", import.meta.url),
  "utf8",
);
const repository = readFileSync(
  new URL("./findLeaderHistoryRepository.ts", import.meta.url),
  "utf8",
);

describe("Find the Leader daily leaderboard privacy contract", () => {
  it("enforces completion before returning any other member scores", () => {
    expect(migration).toContain("history.profile_id = v_profile_id");
    expect(migration).toContain("'unlocked', false");
    expect(migration).toContain("'entries', '[]'::jsonb");
    expect(migration).toContain("grant execute on function public.get_find_leader_daily_leaderboard(date) to authenticated");
    expect(migration).toContain("revoke all on function public.get_find_leader_daily_leaderboard(date) from public, anon");
  });

  it("ranks only official first attempts and gives tied scores the same rank", () => {
    expect(migration).toContain("rank() over (order by history.official_score desc)");
    expect(migration).toContain("'official_score', ranked.official_score");
    expect(migration).not.toContain("'best_score'");
    expect(migration).not.toContain("'attempts'");
    expect(migration).not.toContain("'completed_at'");
    expect(migration).not.toMatch(/order by[^;]*completed_at/i);
  });

  it("uses the canonical Find Leader repository RPC instead of reading private tables in the browser", () => {
    expect(repository).toContain('client.rpc("get_find_leader_daily_leaderboard"');
    expect(repository).not.toContain('.from("find_leader_history")');
    expect(repository).not.toMatch(/localStorage|sessionStorage|profile_id|auth\.users/);
  });
});
