import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310296_alice_pereira_contender_notification.sql",
  "utf8",
);
const model = readFileSync("src/features/notifications/notificationModel.ts", "utf8");

describe("Alice Pereira Contender Series in-app notice", () => {
  it("publishes once to existing profiles through the established notifier", () => {
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("where event.source_key = 'fighter-watchlist:alice-pereira:2026-10-11'");
    expect(migration).toContain("select private.publish_alice_pereira_contender_notification_20261011_once();");
  });

  it("remains an in-app Rankings notice, not a push", () => {
    expect(migration).toContain("private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'");
    expect(migration).toContain("private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'");
    expect(migration).toContain("'fighter_watchlist_added'");
    expect(model).toContain('"fighter_watchlist_added"');
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("announces Alice at #11 with a direct scouting report deep-link", () => {
    expect(migration).toContain("'Alice Pereira joins Shane’s Contender Series'");
    expect(migration).toContain("'At 20 years old and 8–1, Pereira enters Shane’s board at #11 after stopping UFC #15 Daria Zhelezniakova.'");
    expect(migration).toContain("'/fighters-to-watch#alice-pereira'");
    expect(migration).toContain("'VIEW BOARD'");
  });
});
