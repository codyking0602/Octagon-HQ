import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310127_ty_miller_contender_in_app_notification.sql",
  "utf8",
);
const model = readFileSync("src/features/notifications/notificationModel.ts", "utf8");

describe("Ty Miller Contender Series notification", () => {
  it("uses the canonical notification publisher for one existing-profile campaign", () => {
    expect(migration).toContain("revoke insert, update, delete on table public.pick_bouts from anon, authenticated;");
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("where event.source_key = 'fighter-watchlist:ty-miller:2026-09-14'");
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
  });

  it("is explicitly in-app only and categorized as UFC rankings content", () => {
    expect(migration).toContain("private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'");
    expect(migration).toContain("private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'");
    expect(migration).toContain("'fighter_watchlist_added'");
    expect(model).toContain('"fighter_watchlist_added"');
  });

  it("deep-links the announcement to Ty Miller's scouting profile", () => {
    expect(migration).toContain("'Ty Miller joins Shane’s Contender Series'");
    expect(migration).toContain("'The unbeaten welterweight enters Shane King’s board at #7 after back-to-back UFC knockouts.'");
    expect(migration).toContain("'/fighters-to-watch#ty-miller'");
    expect(migration).toContain("'VIEW BOARD'");
  });
});
