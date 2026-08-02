import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608030001_reveal_resolved_group_picks.sql",
  "utf8",
);
const integrationSql = readFileSync("supabase/tests/picks_group_reveals.sql", "utf8");

describe("resolved Picks group reveal migration", () => {
  it("keeps anonymous and non-profile picks hidden in the backend", () => {
    expect(sql).toContain("auth.uid() is null");
    expect(sql).toContain("not exists (select 1 from public.profiles viewer where viewer.id = auth.uid())");
    expect(sql).toContain("bout.result_status = 'pending'");
    expect(sql).toContain("then '[]'::jsonb");
    expect(sql).toContain(
      "revoke all on function public.resolved_bout_group_picks(text,text) from public, anon, authenticated",
    );
    expect(sql).not.toContain("'profile_id'");
  });

  it("returns only event entrants and member-facing reveal fields", () => {
    expect(sql).toContain("select distinct event_pick.profile_id");
    expect(sql).toContain("'display_name', profile.display_name");
    expect(sql).toContain("'picked_fighter_slug', pick.fighter_slug");
    expect(sql).toContain("'is_current_user', entrant.profile_id = auth.uid()");
  });

  it("uses the existing current-event and completed-history projections", () => {
    expect(sql).toContain("create or replace function public.get_current_pick_event()");
    expect(sql).toContain("create or replace function public.get_my_pick_history");
    expect(sql.match(/'group_picks',public\.resolved_bout_group_picks/g)).toHaveLength(2);
    expect(sql).toContain("notify pgrst, 'reload schema'");
  });

  it("keeps rollback coverage for partial reveal and permanent recap behavior", () => {
    expect(integrationSql).toContain("event-wide master lock did not reveal every bout");
    expect(integrationSql).toContain("event-wide master lock did not preserve sibling reveal");
    expect(integrationSql).toContain("anonymous viewer received revealed member picks");
    expect(integrationSql).toContain("completed recap did not preserve group pick reveals");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
