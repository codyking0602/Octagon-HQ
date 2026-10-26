import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310412_shane_abdul_rank2_notification.sql",
  "utf8",
);

describe("Shane Contender Series Abdul rank #2 in-app notification", () => {
  it("publishes exactly once to existing profiles with the canonical notifier", () => {
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("where event.source_key = 'fighter-watchlist:abdul-rank2:2026-10-26'");
    expect(migration).toContain("select private.publish_shane_abdul_rank2_notification_20261026_once();");
  });

  it("stays rankings/in-app without scheduling a device push", () => {
    expect(migration).toContain("private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'");
    expect(migration).toContain("private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'");
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("announces Abdul at #2 with Raul at #3 and deep-links to Abdul's profile", () => {
    expect(migration).toContain("'Abdul Yakhyaev rises to #2 on Shane’s board'");
    expect(migration).toContain("'Three first-round UFC finishes lift Abdul Rakhman Yakhyaev to #2, with Raul Rosas Jr. now #3. See his updated highlight.'");
    expect(migration).toContain("'/fighters-to-watch#abdul-rakhman-yakhyaev'");
    expect(migration).toContain("'VIEW PROFILE'");
  });
});
