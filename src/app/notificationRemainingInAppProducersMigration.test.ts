import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200021_notification_remaining_in_app_producers.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_remaining_in_app_producers.sql",
  "utf8",
);
const runner = readFileSync(
  "supabase/functions/run-pick-monitoring/index.ts",
  "utf8",
);
const foundation = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);
const correctionOwner = readFileSync(
  "supabase/migrations/202608160001_post_lock_result_corrections.sql",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-remaining-in-app-producers.md",
  "utf8",
);

describe("remaining in-app notification producers", () => {
  it("finishes the roadmap in three consolidated PRs", () => {
    expect(contract).toContain("Three-PR finish plan");
    expect(contract).toContain("Remaining in-app producers");
    expect(contract).toContain("Preferences and push readiness");
    expect(contract).toContain("Device push delivery");
    expect(contract).toContain(
      "Optional low-value notification placeholders do not each receive their own PR",
    );
  });

  it("reuses the one existing hourly scheduler and database timing owner", () => {
    expect(migration).toContain(
      "create or replace function public.dispatch_due_in_app_notifications",
    );
    expect(migration).not.toContain("cron.schedule");
    expect(migration).not.toContain("net.http_post");
    expect(runner).toContain(
      'admin.rpc("dispatch_due_in_app_notifications"',
    );
    expect(runner.indexOf('admin.rpc("dispatch_due_in_app_notifications"')).toBeLessThan(
      runner.indexOf('admin.rpc("get_pick_monitoring_event_state"'),
    );
    expect(runner).toContain("notification_dispatch: notificationDispatch");
    expect(contract).toContain(
      "The existing `octagon-hq-pick-monitoring` hourly wake-up remains the only scheduler",
    );
  });

  it("delivers mutually exclusive Picks lock and event-start timing", () => {
    expect(migration).toContain("'picks_incomplete_near_lock'");
    expect(migration).toContain("'ufc_event_starting'");
    expect(migration).toContain("v_event.locks_at <= p_now + interval '4 hours'");
    expect(migration).toContain("v_event.starts_at <= p_now + interval '1 hour'");
    expect(migration).toContain("'FINISH PICKS'");
    expect(migration).toContain("'VIEW PICKS'");
    expect(migration).toContain("not exists (\n            select 1\n            from public.pick_bouts required_bout");
    expect(foundation).toContain("'picks_incomplete_near_lock'");
    expect(foundation).toContain("'ufc_event_starting'");
    expect(integrationSql).toContain(
      "Incomplete Picks member did not receive the one correct lock reminder",
    );
    expect(integrationSql).toContain(
      "Complete Picks member did not receive the one event-starting reminder",
    );
  });

  it("sends only the useful Find the Leader reminder to claimed incomplete profiles", () => {
    expect(migration).toContain("'America/Chicago'");
    expect(migration).toContain("v_central_time >= time '20:00'");
    expect(migration).toContain("public.find_leader_history");
    expect(migration).toContain("private.profile_pin_credentials");
    expect(migration).toContain("'daily_challenge_four_hours'");
    expect(migration).toContain("'/play/find-leader'");
    expect(migration).not.toContain("'daily_streak_at_risk'");
    expect(migration).not.toContain("'daily_challenge_available'");
    expect(integrationSql).toContain(
      "An unclaimed historical profile received reminder noise",
    );
  });

  it("collapses owner operations into three clear review actions", () => {
    expect(migration).toContain("'event_draft_ready'");
    expect(migration).toContain("'monitoring_repeatedly_failed'");
    expect(migration).toContain("'event_ready_to_complete'");
    expect(migration).toContain("having count(*) = 3 and bool_and(status = 'failed')");
    expect(migration).toContain("'/picks/setup'");
    expect(migration).toContain("'/picks/monitoring'");
    expect(migration).toContain("'/picks/control'");
    expect(migration).not.toContain("'all_results_entered'");
    expect(migration).not.toContain("'picks_card_missing'");
    expect(integrationSql).toContain(
      "Three consecutive monitoring failures did not create the owner review action",
    );
    expect(integrationSql).toContain(
      "Resolved locked event did not create the one owner completion action",
    );
  });

  it("connects completed-event corrections to entrant recap updates", () => {
    expect(migration).toContain(
      "create or replace function public.correct_official_pick_bout_result",
    );
    expect(migration).toContain("insert into public.pick_result_corrections");
    expect(migration).toContain(
      "returning id, corrected_at into v_correction_id, v_corrected_at",
    );
    expect(migration).toContain("if v_event.status = 'complete' then");
    expect(migration).toContain("'picks_season_result_changed'");
    expect(migration).toContain("'VIEW UPDATED RECAP'");
    expect(correctionOwner).toContain(
      "create or replace function public.correct_official_pick_bout_result",
    );
    expect(integrationSql).toContain(
      "A non-entrant received completed-event correction noise",
    );
    expect(integrationSql).toContain(
      "Correction notification delivery replaced or duplicated the canonical audit owner",
    );
  });

  it("keeps source idempotency, private publication, and rollback proof", () => {
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).not.toContain("public.publish_notification(");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("create trigger");
    expect(integrationSql).toContain(
      "Hourly replay duplicated an incomplete-Picks reminder",
    );
    expect(integrationSql).toContain(
      "Authenticated clients can invoke the due-notification dispatcher",
    );
    expect(integrationSql).toContain(
      "Authenticated clients can bypass the canonical notification publisher",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
    expect(contract).toContain(
      "No second cron job, Edge Function, polling loop, browser timer, inbox, provider, or local-storage fallback is added",
    );
  });
});
