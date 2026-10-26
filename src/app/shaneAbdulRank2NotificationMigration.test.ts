import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310412_shane_abdul_rank2_notification.sql",
  "utf8",
);

describe("Abdul Yakhyaev Shane Contender Series #2 notification", () => {
  it("publishes once to existing profiles using the canonical private notifier", () => {
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("where event.source_key = 'fighter-watchlist:abdul-rank2:2026-10-26'");
    expect(migration).toContain("select private.publish_shane_abdul_rank2_20261026_once();");
  });

  it("uses Rankings in-app only, never device push", () => {
    expect(migration).toContain("private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'");
    expect(migration).toContain("private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'");
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("announces Abdul reaching #2 and deep-links to his updated profile", () => {
    expect(migration).toContain("'Abdul rises to #2 on Shane’s board'");
    expect(migration).toContain("'VIEW PROFILE'");
    expect(migration).toContain("'/fighters-to-watch#abdul-rakhman-yakhyaev'");
  });
});
