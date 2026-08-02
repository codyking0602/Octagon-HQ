import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202608280001_per_fight_pick_locks.sql", "utf8");
const repository = readFileSync("src/features/picks/picksRepository.ts", "utf8");
const provider = readFileSync("src/features/picks/PicksProvider.tsx", "utf8");

describe("per-fight Picks lock backend architecture", () => {
  it("evolves the canonical bout, submission, reveal, publication, and control owners", () => {
    expect(sql).toContain("alter table public.pick_bouts");
    expect(sql.match(/create or replace function public\.save_my_event_pick/g)).toHaveLength(1);
    expect(sql.match(/create or replace function public\.resolved_bout_group_picks/g)).toHaveLength(1);
    expect(sql).toContain("create or replace function public.publish_pick_event_draft");
    expect(sql).toContain("create function public.get_current_pick_event()");
    expect(sql).toContain("create function public.get_pick_control_event(p_event_id text default null)");
  });

  it("uses server time, stable bout identity, legacy fallback, and master states", () => {
    expect(sql).toContain("p_event.status in ('locked', 'complete')");
    expect(sql).toContain("coalesce(p_bout.locks_at, p_event.locks_at)");
    expect(sql).toContain("p_now >= coalesce");
    expect(sql).toContain("bout_id=lower(trim(p_bout_id))");
    expect(sql).not.toContain("card position");
  });

  it("projects later-UI fields without implementing browser authorization or a new provider", () => {
    expect(sql).toContain("'is_locked',private.pick_bout_is_locked");
    expect(sql).toContain("'locks_at',coalesce(bout.locks_at,event.locks_at)");
    expect(repository).toContain("is_locked: z.boolean().optional()");
    expect(repository).not.toContain("Date.now");
    expect(provider.match(/const PicksContext = createContext/g)).toHaveLength(1);
    expect(sql).not.toContain("pg_cron");
  });
});
