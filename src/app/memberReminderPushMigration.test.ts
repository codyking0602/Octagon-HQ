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
      "Intentionally create zero saved picks for this claimed profile",
    );
    expect(integrationSql).toContain(
      "Zero-pick claimed member was not included in Finish your Picks dispatch",
    );
  });

  it("makes the existing Daily Challenge reminder a push candidate", () => {
    expect(migration).toContain(
      "create or replace function private.notification_priority_for_kind",
    );
    expect(migration).toContain("'daily_challenge_four_hours'");
    expect(migration).toContain("return 'push_candidate'");
    expect(integrationSql).toContain(
      "Daily Challenge reminder was not one push candidate",
    );
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
