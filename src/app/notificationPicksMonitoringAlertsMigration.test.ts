import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200017_notification_pick_monitoring_alerts.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_pick_monitoring_alerts.sql",
  "utf8",
);
const foundation = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-picks-monitoring-alerts.md",
  "utf8",
);

describe("Cody-only Picks monitoring notifications", () => {
  it("reuses the existing monitoring ledger and notification owner", () => {
    expect(migration).toContain(
      "after insert on public.pick_monitoring_findings",
    );
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).toContain("private.notification_owner");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("cron.schedule");
    expect(contract).toContain(
      "`run-pick-monitoring` remains the only manual and scheduled execution owner",
    );
    expect(contract).toContain(
      "`record_pick_monitoring_run(...)` remains the evidence writer",
    );
  });

  it("classifies only meaningful review alerts", () => {
    expect(migration).toContain("'card_change_detected'");
    expect(migration).toContain("'fight_order_changed'");
    expect(migration).toContain("'fight_moved_off_card'");
    expect(migration).toContain("'odds_match_failed'");
    expect(migration).toContain("'provider_quota_low'");
    expect(foundation).toContain("'card_change_detected'");
    expect(foundation).toContain("'fight_order_changed'");
    expect(foundation).toContain("'fight_moved_off_card'");
    expect(foundation).toContain("'odds_match_failed'");
    expect(foundation).toContain("'provider_quota_low'");
  });

  it("keeps ordinary odds activity and unproven repeated failures quiet", () => {
    expect(migration).toContain(
      "new.finding_type in ('odds_change', 'odds_available')",
    );
    expect(migration).toContain(
      "Global provider failures need a proven repeated-failure rule",
    );
    expect(migration).not.toContain("'monitoring_repeatedly_failed'");
    expect(contract).toContain("ordinary American-odds movement");
    expect(contract).toContain(
      "This slice does not label one failure as repeated",
    );
  });

  it("deep-links every owner alert to the existing review screen", () => {
    expect(migration).toContain("'/picks/monitoring'");
    expect(migration).toContain("'REVIEW'");
    expect(contract).toContain(
      "It never stages, publishes, removes, reorders, replaces, cancels, restores, or otherwise applies a card change automatically",
    );
  });

  it("aggregates by event and kind without replay noise", () => {
    expect(migration).toContain(
      "'pick-monitoring-finding:' || new.finding_id::text",
    );
    expect(migration).toContain(
      "'pick-monitoring:' || v_kind || ':' || v_event_key",
    );
    expect(integrationSql).toContain(
      "Generic card findings did not aggregate into one owner row",
    );
    expect(integrationSql).toContain(
      "Matchup-specific odds failures did not aggregate into one owner row",
    );
    expect(contract).toContain("Card change detected ×3");
  });

  it("keeps owner isolation, private privileges, and rollback proof", () => {
    expect(migration).toContain(
      "revoke all on function private.publish_pick_monitoring_finding_notification()",
    );
    expect(integrationSql).toContain(
      "Operational monitoring notifications leaked to a non-owner profile",
    );
    expect(integrationSql).toContain(
      "Authenticated clients can invoke the private monitoring notification trigger",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
