import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310158_shane_contender_board_update_notification.sql",
  "utf8",
);

describe("Shane Contender Series board update notification", () => {
  it("publishes one idempotent campaign to existing profiles through the canonical publisher", () => {
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("where event.source_key = 'fighter-watchlist:board-update:2026-09-21'");
    expect(migration).toContain("select private.publish_shane_contender_board_update_20260921_once();");
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("stays in-app only and announces all three board changes", () => {
    expect(migration).toContain("private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'");
    expect(migration).toContain("private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'");
    expect(migration).toContain("'Shane’s Contender Series reshuffled'");
    expect(migration).toContain(
      "'Salkilld is the new #1, Raul Rosas Jr. joins at #4, and Gable Steveson drops to #8 after UFC 331.'",
    );
    expect(migration).toContain("'/fighters-to-watch'");
    expect(migration).toContain("'VIEW BOARD'");
  });
});
