import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200018_notification_picks_repick_required.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_picks_repick_required.sql",
  "utf8",
);
const foundation = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);
const replacementOwner = readFileSync(
  "supabase/migrations/202608130001_approved_pick_fighter_replacements.sql",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-picks-repick-required.md",
  "utf8",
);

describe("Picks repick-required notifications", () => {
  it("keeps the existing fighter-replacement transition and audit ledger as owners", () => {
    expect(migration).toContain(
      "create or replace function public.approve_pick_fighter_replacement",
    );
    expect(migration).toContain("insert into public.pick_card_change_actions");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("create trigger");
    expect(migration).not.toContain("cron.schedule");
    expect(contract).toContain(
      "`approve_pick_fighter_replacement(...)` remains the only replacement transition",
    );
    expect(contract).toContain(
      "`pick_card_change_actions` remains the only card-change audit owner",
    );
    expect(replacementOwner).toContain("'invalidated_picks', v_affected_picks");
  });

  it("publishes only to profiles whose picks were invalidated", () => {
    expect(migration).toContain("jsonb_array_elements(v_affected_picks)");
    expect(migration).toContain("(v_invalidated_pick->>'profile_id')::uuid");
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(integrationSql).toContain(
      "A profile without an invalidated pick received repick noise",
    );
    expect(contract).toContain(
      "Members without a saved pick on that bout receive nothing",
    );
  });

  it("uses the actionable Picks contract and exact changed matchup", () => {
    expect(migration).toContain("'picks_repick_required'");
    expect(migration).toContain("'Repick required'");
    expect(migration).toContain("'/picks'");
    expect(migration).toContain("'REPICK'");
    expect(migration).toContain("Make a new pick before lock.");
    expect(foundation).toContain("'picks_repick_required'");
    expect(foundation).toContain("'picks_repick_required',\n      'picks_incomplete_near_lock'");
  });

  it("aggregates repeated repick requirements without replay noise", () => {
    expect(migration).toContain(
      "'pick-repick-required:' || v_action_id::text",
    );
    expect(migration).toContain(
      "'picks-repick-required:' || v_event_id",
    );
    expect(integrationSql).toContain(
      "Rejected replacement replay increased the notification count",
    );
    expect(integrationSql).toContain(
      "Repeated repick requirements did not aggregate to the latest matchup",
    );
    expect(contract).toContain("Repick required ×2");
  });

  it("keeps replacement, notification, and audit writes transactional", () => {
    expect(migration.indexOf("delete from public.profile_event_picks")).toBeLessThan(
      migration.indexOf("insert into public.pick_card_change_actions"),
    );
    expect(migration.indexOf("insert into public.pick_card_change_actions")).toBeLessThan(
      migration.indexOf("private.publish_notification_to_profile"),
    );
    expect(migration).toContain(
      "returning action_id, approved_at into v_action_id, v_approved_at",
    );
    expect(contract).toContain(
      "The replacement, audit row, pick invalidation, and notification delivery commit or roll back together",
    );
  });

  it("keeps private publishing and rollback proof", () => {
    expect(migration).not.toContain("public.publish_notification(");
    expect(integrationSql).toContain(
      "Authenticated Picks clients can bypass the canonical notification producer",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
    expect(contract).toContain(
      "No second inbox, provider, repository, scheduler, polling loop, or browser-storage fallback is added",
    );
  });
});
