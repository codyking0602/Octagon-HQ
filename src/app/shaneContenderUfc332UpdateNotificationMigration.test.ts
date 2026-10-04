import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310253_shane_contender_ufc332_update_notification.sql",
  "utf8",
);
const model = readFileSync("src/features/notifications/notificationModel.ts", "utf8");

describe("Shane Contender Series UFC 332 update notification", () => {
  it("publishes one idempotent campaign to existing profiles through the canonical publisher", () => {
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain(
      "where event.source_key = 'fighter-watchlist:ufc332-board-update:2026-10-04'",
    );
    expect(migration).toContain("select private.publish_shane_contender_ufc332_update_20261004_once();");
  });

  it("stays in-app only under the established Rankings notification kind", () => {
    expect(migration).toContain(
      "private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'",
    );
    expect(migration).toContain(
      "private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'",
    );
    expect(migration).toContain("'fighter_watchlist_added'");
    expect(model).toContain('"fighter_watchlist_added"');
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("announces Pinas at #7 and Gautier at #9 and links to the live board", () => {
    expect(migration).toContain("'Shane’s Contender Series updated'");
    expect(migration).toContain(
      "'Damian Pinas joins at #7 after another first-round KO. Ateba Gautier drops to #9 after UFC 332.'",
    );
    expect(migration).toContain("'/fighters-to-watch'");
    expect(migration).toContain("'VIEW BOARD'");
  });
});
