import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310004_member_reminder_push.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/member_reminder_push.sql",
  "utf8",
);

describe("member reminder push behavior", () => {
  it("keeps one scheduler and broadens the existing Picks reminder to zero-pick claimed members", () => {
    expect(migration).toContain(
      "create or replace function public.dispatch_due_in_app_notifications",
    );
    expect(migration).toContain("select profile.id as profile_id");
    expect(migration).toContain("join private.profile_pin_credentials credential");
    expect(migration).toContain("saved.profile_id = profile.id");
    expect(migration).toContain("'picks_incomplete_near_lock'");
    expect(migration).not.toContain("cron.schedule");
    expect(migration).not.toContain("net.http_post");
    expect(integrationSql).toContain(
      "Intentionally create zero saved Picks and zero official Daily Challenge attempts",
    );
    expect(integrationSql).toContain(
      "Zero-pick claimed member was not included in Finish your Picks dispatch",
    );
  });

  it("adds Daily Challenge push without demoting existing push candidates", () => {
    expect(migration).toContain(
      "create or replace function private.notification_priority_for_kind",
    );
    expect(migration).toContain("'daily_challenge_four_hours'");
    expect(migration).toContain("'new_game_available'");
    expect(migration).toContain("return 'push_candidate'");
    expect(integrationSql).toContain(
      "Daily Challenge reminder was not one push candidate",
    );
  });

  it("preserves the generalized official Daily Challenge owner", () => {
    expect(migration).toContain("private.daily_challenges");
    expect(migration).toContain("private.daily_challenge_attempts");
    expect(migration).toContain("attempt.attempt_kind = 'official_first'");
    expect(migration).not.toContain("public.find_leader_history");
    expect(migration).toContain("'/play/find-leader'");
    expect(migration).toContain("'/play/blind-resume?mode=daily'");
    expect(migration).toContain("'/play/wavelength?mode=daily'");
    expect(migration).toContain("'/play/blind-rank?mode=daily'");
    expect(migration).toContain("'/play/keep-cut?mode=daily'");
  });

  it("preserves truthful monitoring failure filtering", () => {
    expect(migration).toContain("run.trigger_kind = 'scheduled'");
    expect(migration).toContain("run.provider_called");
    expect(migration).toContain("run.decision_reason is null");
  });

  it("preserves source idempotency and the existing push delivery owner", () => {
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("create trigger");
    expect(migration).not.toContain("deliver-notification-push");
    expect(integrationSql).toContain(
      "Hourly replay duplicated member reminder source events",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
