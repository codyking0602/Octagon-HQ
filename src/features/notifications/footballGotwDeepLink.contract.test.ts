import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310893_football_gotw_notification_deeplink.sql", "utf8",
);
const serviceWorker = readFileSync("public/push-readiness-sw.js", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const gotwPage = readFileSync("src/features/picks/FootballGotwPage.tsx", "utf8");

describe("Football GOTW notification breakdown deep links", () => {
  it("routes only published GOTW notifications with a verified source week and league", () => {
    expect(migration).toContain("new.kind = 'football_gotw_starting'");
    expect(migration).toContain("new.aggregation_key ~ '^football-gotw-starting:");
    expect(migration).toContain("split_part(new.aggregation_key, ':', 3)");
    expect(migration).toContain("split_part(new.aggregation_key, ':', 2)");
    expect(migration).toContain("before insert or update of route, aggregation_key, kind");
    expect(migration).toContain("where kind = 'football_gotw_starting'");
    expect(migration).not.toContain("delete from private.notification_groups");
  });

  it("supports a legacy push received before the database migration without rewriting other push kinds", () => {
    expect(serviceWorker).toContain('payload.kind === "football_gotw_starting"');
    expect(serviceWorker).toContain('route = "/football/gotw?league=" + league');
    expect(serviceWorker).toContain('route.startsWith("/football/gotw?")');
    expect(serviceWorker).toContain('new URL(route, self.location.origin)');
  });

  it("opens the existing published breakdown sheet without requiring a matching Picks slate", () => {
    expect(router).toContain('path: "football/gotw"');
    expect(gotwPage).toContain("usePublishedFootballWeek()");
    expect(gotwPage).toContain("publishedFootballMatchup(sport, item)");
    expect(gotwPage).toContain("requestedBreakdownId={breakdown.id}");
    expect(gotwPage).not.toContain("publishedFootballMatchupsForEvent");
    expect(gotwPage).toContain("item.week_of === weekOf");
  });
});
