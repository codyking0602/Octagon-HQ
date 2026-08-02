import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const foundationSql = readFileSync(
  "supabase/migrations/202608030001_reveal_resolved_group_picks.sql",
  "utf8",
);
const perFightSql = readFileSync(
  "supabase/migrations/202608280001_per_fight_pick_locks.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/picks_group_reveals.sql",
  "utf8",
);
const perFightIntegrationSql = readFileSync(
  "supabase/tests/per_fight_pick_locks.sql",
  "utf8",
);

describe("resolved Picks group reveal migration", () => {
  it("keeps anonymous and non-profile picks hidden in the backend", () => {
    expect(foundationSql).toContain("auth.uid() is null");
    expect(perFightSql).toContain("auth.uid() is null");
    expect(perFightSql).toContain(
      "select 1 from public.profiles viewer where viewer.id = auth.uid()",
    );
    expect(perFightSql).toContain("then '[]'::jsonb");
    expect(perFightSql).toContain(
      "revoke all on function public.resolved_bout_group_picks(text,text)",
    );
    expect(perFightSql).not.toContain("'profile_id', profile.id");
  });

  it("returns only event entrants and member-facing reveal fields", () => {
    expect(perFightSql).toContain("select distinct event_pick.profile_id");
    expect(perFightSql).toContain("'display_name', profile.display_name");
    expect(perFightSql).toContain("'picked_fighter_slug', pick.fighter_slug");
    expect(perFightSql).toContain(
      "'is_current_user', entrant.profile_id = auth.uid()",
    );
    expect(perFightIntegrationSql).toContain(
      "locked reveal did not preserve entrant-only ownership",
    );
  });

  it("reveals one locked bout without exposing an open sibling", () => {
    expect(perFightSql).toContain(
      "now() < coalesce(bout.locks_at, event.locks_at)",
    );
    expect(perFightSql).toContain(
      "private.pick_bout_is_locked(event, lock_bout)",
    );
    expect(perFightIntegrationSql).toContain(
      "locking one bout revealed a later open bout",
    );
    expect(perFightIntegrationSql).toContain(
      "later open bout revealed its Underdog Lock target",
    );
  });

  it("uses the existing current-event, progress, and completed-history owners", () => {
    expect(foundationSql).toContain(
      "create or replace function public.get_my_pick_history",
    );
    expect(perFightSql).toContain(
      "create function public.get_event_pick_progress(p_event_id text)",
    );
    expect(perFightSql).toContain(
      "create function public.get_current_pick_event()",
    );
    expect(perFightSql).toContain("notify pgrst, 'reload schema'");
  });

  it("keeps rollback coverage for master-lock and permanent recap behavior", () => {
    expect(integrationSql).toContain(
      "event-wide master lock did not reveal every bout",
    );
    expect(integrationSql).toContain(
      "event-wide master lock did not preserve sibling reveal",
    );
    expect(integrationSql).toContain(
      "anonymous viewer received revealed member picks",
    );
    expect(integrationSql).toContain(
      "completed recap did not preserve group pick reveals",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
    expect(perFightIntegrationSql).toContain("rollback;");
    expect(perFightIntegrationSql.trimEnd()).toMatch(/\\ir picks_group_reveals\.sql$/);
  });
});
