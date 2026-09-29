import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310209_shane_rosas_rank2_notification.sql",
  "utf8",
);

describe("Shane Contender Series Rosas rank #2 notification", () => {
  it("publishes one idempotent campaign to existing profiles through the canonical publisher", () => {
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("where event.source_key = 'fighter-watchlist:rosas-rank2:2026-09-28'");
    expect(migration).toContain("select private.publish_shane_contender_rosas_rank2_20260928_once();");
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("stays in-app only and describes the exact board movement", () => {
    expect(migration).toContain("private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'");
    expect(migration).toContain("private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'");
    expect(migration).toContain("'Rosas jumps to #2 on Shane’s board'");
    expect(migration).toContain(
      "'Raul Rosas Jr. moves to #2, pushing Abdul Rakhman Yakhyaev to #3 and Bilal Hasan to #4.'",
    );
    expect(migration).toContain("'/fighters-to-watch'");
    expect(migration).toContain("'VIEW BOARD'");
  });
});
