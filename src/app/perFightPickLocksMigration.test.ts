import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608280001_per_fight_pick_locks.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/per_fight_pick_locks.sql",
  "utf8",
);
const repository = readFileSync("src/features/picks/picksRepository.ts", "utf8");
const provider = readFileSync("src/features/picks/PicksProvider.tsx", "utf8");

describe("per-fight Picks lock backend architecture", () => {
  it("evolves the canonical bout, submission, bonus, reveal, publication, and control owners", () => {
    expect(sql).toContain("alter table public.pick_bouts");
    expect(sql.match(/create or replace function public\.save_my_event_pick/g)).toHaveLength(1);
    expect(sql.match(/create or replace function public\.set_my_event_underdog_lock/g)).toHaveLength(1);
    expect(sql.match(/create or replace function public\.clear_my_event_underdog_lock/g)).toHaveLength(1);
    expect(sql.match(/create or replace function public\.resolved_bout_group_picks/g)).toHaveLength(1);
    expect(sql).toContain("create or replace function public.publish_pick_event_draft");
    expect(sql).toContain("create function public.get_current_pick_event()");
    expect(sql).toContain(
      "create function public.get_pick_control_event(p_event_id text default null)",
    );
    expect(sql).not.toContain("create table public.profile_event_picks");
  });

  it("uses server time, stable bout identity, legacy fallback, and master states", () => {
    expect(sql).toContain("p_event.status in ('locked', 'complete')");
    expect(sql).toContain("coalesce(p_bout.locks_at, p_event.locks_at)");
    expect(sql).toContain("p_now >= coalesce(p_bout.locks_at, p_event.locks_at)");
    expect(sql).toContain("bout_id = lower(trim(p_bout_id))");
    expect(sql).toContain("event cannot be reopened");
    expect(sql).toContain("resulted bout cannot be reopened");
    expect(sql).toContain("locked bout cannot be reopened");
    expect(sql).not.toContain("card position");
  });

  it("preserves result/correction ownership and closes all member-side write paths", () => {
    expect(sql).toContain("v_event.status = 'upcoming'");
    expect(sql).toContain("and (new.result_status = 'cancelled' or old.result_status = 'cancelled')");
    expect(sql).toContain("private.pick_bout_is_locked(v_event, v_bout)");
    expect(sql).toContain("odds are locked for this fight");
    expect(sql).toContain("underdog lock is closed for this fight");
    expect(integrationSql).toContain("locked bout accepted a first pick");
    expect(integrationSql).toContain("locked bout accepted a changed pick");
    expect(integrationSql).toContain("locked bout accepted an Underdog Lock write");
    expect(integrationSql).toContain("completed result correction or history was damaged");
  });

  it("keeps entrant-only privacy and one group-progress owner", () => {
    expect(sql).toContain("select distinct event_pick.profile_id");
    expect(sql).toContain("create function public.get_event_pick_progress(p_event_id text)");
    expect(sql).toContain("private.pick_bout_is_locked(event, lock_bout)");
    expect(integrationSql).toContain("locking one bout revealed a later open bout");
    expect(integrationSql).toContain("locked reveal did not preserve entrant-only ownership");
    expect(integrationSql).toContain("anonymous viewer read private picks");
  });

  it("keeps event defaults synchronized without overwriting deliberate per-bout adjustments", () => {
    expect(sql).toContain("locks_at is not distinct from v_event.locks_at");
    expect(sql).toContain("set locks_at = p_locks_at");
    expect(sql).toContain("v_draft.locks_at");
    expect(integrationSql).toContain("event-wide deadline did not move a defaulted bout");
    expect(integrationSql).toContain(
      "event-wide deadline overwrote an explicitly adjusted bout",
    );
    expect(integrationSql).toContain(
      "published main event missed the latest initial deadline",
    );
    expect(integrationSql).toContain(
      "published preceding fight missed its 30-minute decrement",
    );
  });

  it("projects later-UI fields without browser authorization or a new provider", () => {
    expect(sql).toContain("'is_locked', private.pick_bout_is_locked");
    expect(sql).toContain("'locks_at', coalesce(bout.locks_at, event.locks_at)");
    expect(repository).toContain("is_locked: z.boolean().optional()");
    expect(repository).not.toContain("Date.now");
    expect(provider.match(/const PicksContext = createContext/g)).toHaveLength(1);
    expect(sql).not.toContain("pg_cron");
    expect(integrationSql).toContain("rollback;");
    expect(integrationSql.trimEnd()).toMatch(/\\ir picks_group_reveals\.sql$/);
  });
});
