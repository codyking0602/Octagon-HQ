import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath = "supabase/migrations/202612310023_rankings_refresh_notification.sql";
const migration = readFileSync(migrationPath, "utf8");
const model = readFileSync("src/features/notifications/notificationModel.ts", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");

describe("one-time rankings refresh notification", () => {
  it("delegates the member-wide campaign to the canonical notification publisher", () => {
    expect(migration).toContain("perform private.publish_notification_to_profile(");
    expect(migration).toContain("from public.profiles profile");
    expect(migration).not.toMatch(/insert\s+into\s+private\.notification_(?:groups|events|push_)/i);
    expect(migration).not.toContain("net.http_post");
    expect(migration).not.toContain("deliver-notification-push");
    expect(migration).not.toContain("cron.schedule");
  });

  it("publishes exactly one stable 8/16/26 rankings campaign", () => {
    expect(migration).toContain("private.publish_rankings_refresh_notification_once");
    expect(migration).toContain("where event.source_key = 'ranking-refresh:2026-08-16'");
    expect(migration).toContain("'ranking-refresh:2026-08-16'");
    expect(migration).toContain("'ranking_refresh_available'");
    expect(migration).toContain("'Rankings refreshed through 8/16/26'");
    expect(migration).toContain(
      "'Islam, Dern, Dricus, Whittaker, Max and every current ranked fighter are now up to date. See what moved.'",
    );
    expect(migration).toContain("'/rankings'");
    expect(migration).toContain("'VIEW RANKINGS'");
    expect(migration).toContain("select private.publish_rankings_refresh_notification_once();");
  });

  it("uses a dedicated Rankings category and the existing push-candidate path", () => {
    expect(migration).toContain("category in ('social', 'picks', 'games', 'rankings', 'operations')");
    expect(migration).toContain("if v_kind = 'ranking_refresh_available' then\n    return 'rankings';");
    expect(migration).toContain("'ranking_refresh_available'\n    )");
    expect(migration).toContain("return 'push_candidate'");
    expect(model).toContain('"ranking_refresh_available"');
    expect(model).toContain('"rankings"');
    expect(model).toContain('rankings: "Rankings"');
    expect(router).toContain('{ path: "rankings", element: <RankingsPage /> }');
  });

  it("keeps reruns idempotent and future profiles outside the completed campaign", () => {
    expect(migration).toMatch(/if exists \([\s\S]*event\.source_key = 'ranking-refresh:2026-08-16'[\s\S]*return 0;/);
    expect(migration).toContain("The migration transaction is all-or-nothing");
    expect(migration).toContain("later profiles are excluded");
    expect(migration).toContain("grant execute on function private.publish_rankings_refresh_notification_once()\n  to service_role;");
    expect(migration).toContain("revoke all on function private.publish_rankings_refresh_notification_once()");
  });
});
