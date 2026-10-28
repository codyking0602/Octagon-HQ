import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200019_notification_picks_fight_cancelled.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_picks_fight_cancelled.sql",
  "utf8",
);
const foundation = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);
const cancellationOwner = readFileSync(
  "supabase/migrations/202608120001_approved_pick_bout_cancellations.sql",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-picks-fight-cancelled.md",
  "utf8",
);

describe("Picks fight-cancelled notifications", () => {
  it("keeps the existing cancellation transition, result state, and audit ledger as owners", () => {
    expect(migration).toContain(
      "create or replace function public.approve_pick_bout_cancellation",
    );
    expect(migration).toContain("insert into public.pick_card_change_actions");
    expect(migration).toContain("result_status = case when p_cancelled then 'cancelled' else 'pending' end");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("create trigger");
    expect(migration).not.toContain("cron.schedule");
    expect(cancellationOwner).toContain("approve_pick_bout_cancellation");
    expect(contract).toContain(
      "`approve_pick_bout_cancellation(...)` remains the only owner-approved cancellation and restoration transition",
    );
    expect(contract).toContain(
      "`pick_card_change_actions` remains the sole private card-change audit owner",
    );
  });

  it("publishes only to profiles with preserved picks on the cancelled bout", () => {
    expect(migration).toContain("jsonb_array_elements(v_affected_picks)");
    expect(migration).toContain("(v_affected_pick->>'profile_id')::uuid");
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(integrationSql).toContain(
      "A profile without a pick on the cancelled bout received notification noise",
    );
    expect(contract).toContain(
      "Members without a saved pick on the cancelled bout receive nothing",
    );
  });

  it("uses one informational Picks notification without exposing the private reason", () => {
    expect(migration).toContain("'picks_fight_cancelled'");
    expect(migration).toContain("'Fight cancelled'");
    expect(migration).toContain("'/picks'");
    expect(migration).toContain("'VIEW PICKS'");
    expect(migration).toContain("Your pick is preserved and this fight is excluded from scoring.");
    expect(foundation).toContain("'picks_fight_cancelled'");
    expect(integrationSql).toContain(
      "Member cancellation copy exposed the private owner reason",
    );
  });

  it("aggregates multiple cancellations and keeps replay and restoration quiet", () => {
    expect(migration).toContain(
      "'pick-fight-cancelled:' || v_action_id::text",
    );
    expect(migration).toContain(
      "'picks-fight-cancelled:' || v_event_id",
    );
    expect(migration).toContain("if p_cancelled then");
    expect(integrationSql).toContain(
      "Repeated cancellation replay increased the notification count",
    );
    expect(integrationSql).toContain(
      "Multiple cancellations did not aggregate to the latest matchup",
    );
    expect(integrationSql).toContain(
      "Restoring a bout created cancellation notification noise",
    );
    expect(contract).toContain("Fight cancelled ×2");
  });

  it("keeps cancellation, lock cleanup, audit, and notification delivery transactional", () => {
    expect(migration.indexOf("update public.pick_bouts")).toBeLessThan(
      migration.indexOf("delete from public.profile_event_underdog_locks"),
    );
    expect(migration.indexOf("delete from public.profile_event_underdog_locks")).toBeLessThan(
      migration.indexOf("insert into public.pick_card_change_actions"),
    );
    expect(migration.indexOf("insert into public.pick_card_change_actions")).toBeLessThan(
      migration.indexOf("private.publish_notification_to_profile"),
    );
    expect(migration).toContain(
      "returning action_id, approved_at into v_action_id, v_approved_at",
    );
    expect(contract).toContain(
      "The cancellation state change, mutable Underdog Lock cleanup, audit action, and notification delivery commit or roll back together",
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
