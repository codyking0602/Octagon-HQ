import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310882_ufc_v2_oct27_alltime_notification.sql",
  "utf8",
);
const routes = readFileSync("src/app/router.tsx", "utf8");

describe("October 27 UFC V2 all-time in-app ranking notification", () => {
  it("uses the existing member-wide canonical publisher once, idempotently", () => {
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("where event.source_key = 'ranking-refresh:ufc-v2-alltime:2026-10-27'");
    expect(migration).toContain("select private.publish_ufc_v2_oct27_alltime_notification_once();");
    expect(migration).not.toMatch(/insert\s+into\s+private\.notification_(?:groups|events|push_)/i);
  });

  it("is strictly Rankings / in-app only; cannot produce a push", () => {
    expect(migration).toContain("private.notification_category_for_kind('ranking_refresh_available') <> 'rankings'");
    expect(migration).toContain("private.notification_priority_for_kind('ranking_refresh_available') <> 'in_app'");
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
    expect(migration).not.toContain("cron.schedule");
  });

  it("announces both additions and all five refreshed fighters with a valid destination", () => {
    for (const fighter of [
      "Ciryl Gane", "Natalia Silva", "Petr Yan", "Merab",
      "Volkanovski", "dos Anjos", "Figueiredo",
    ]) expect(migration).toContain(fighter);

    expect(migration).toContain("Petr Yan leaps to #24");
    expect(migration).toContain("Merab is #21");
    expect(migration).toContain("Volkanovski stays #6");
    expect(migration).toContain("dos Anjos is #30");
    expect(migration).toContain("'VIEW RANKINGS'");
    expect(migration).toContain("'/rankings'");
    expect(routes).toContain('{ path: "rankings", element: <RankingsPage /> }');
  });

  it("keeps privileged one-shot publishing inaccessible to members", () => {
    expect(migration).toContain("security definer\nset search_path = ''");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("to service_role;");
  });
});
