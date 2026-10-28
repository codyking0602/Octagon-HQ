import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310227_ateba_gautier_contender_notification.sql",
  "utf8",
);
const model = readFileSync("src/features/notifications/notificationModel.ts", "utf8");

describe("Ateba Gautier Contender Series notification", () => {
  it("publishes one canonical existing-profile campaign", () => {
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("where event.source_key = 'fighter-watchlist:ateba-gautier:2026-10-02'");
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("stays in-app only under the established Rankings notification kind", () => {
    expect(migration).toContain("private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'");
    expect(migration).toContain("private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'");
    expect(migration).toContain("'fighter_watchlist_added'");
    expect(model).toContain('"fighter_watchlist_added"');
  });

  it("deep-links directly to Gautier's #5 scouting profile", () => {
    expect(migration).toContain("'Ateba Gautier joins Shane’s Contender Series'");
    expect(migration).toContain("'The 5–0 UFC middleweight enters Shane King’s board at #5 ahead of UFC 332.'");
    expect(migration).toContain("'/fighters-to-watch#ateba-gautier'");
    expect(migration).toContain("'VIEW BOARD'");
  });
});
