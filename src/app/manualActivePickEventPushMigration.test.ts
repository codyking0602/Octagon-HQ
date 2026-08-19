import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612310030_manual_active_pick_event_push.sql", "utf8");
const setup = readFileSync("src/features/picks-setup/pickSetupRepository.ts", "utf8");

describe("manual active Picks event push", () => {
  it("keeps the action owner-only and delegates creation to the canonical publisher", () => {
    expect(migration).toContain("public.is_pick_control_owner(auth.uid())");
    expect(migration).toContain("private.publish_notification_to_profile(");
    expect(migration).toContain("'ufc_event_starting'");
    expect(migration).not.toMatch(/insert\s+into\s+private\.notification_/i);
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("validates the exact published active event while staging and publishing remain silent", () => {
    expect(migration).toContain("event.event_id = p_event_id");
    expect(migration).toContain("v_event.name <> trim(p_event_title)");
    expect(migration).toContain("event.status in ('upcoming', 'locked')");
    expect(setup).not.toContain("send_active_pick_event_push");
    expect(setup).not.toContain("publish_notification");
  });
});
