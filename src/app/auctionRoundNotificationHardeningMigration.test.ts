import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608220003_auction_round_notification_hardening.sql",
  "utf8",
);

describe("Auction round notification hardening", () => {
  it("publishes next-round notifications only after a persisted award", () => {
    const awardCheck = sql.indexOf("select exists (");
    const notificationGuard = sql.indexOf(
      "if v_round_resolved\n    and v_game.lifecycle_state = 'active'",
    );
    const roundNotification = sql.indexOf("'auction:round:'");

    expect(awardCheck).toBeGreaterThanOrEqual(0);
    expect(sql).toContain("award.resolved_round = v_resolved_round");
    expect(notificationGuard).toBeGreaterThan(awardCheck);
    expect(roundNotification).toBeGreaterThan(notificationGuard);
    expect(sql).toContain(
      "opponent notifications require a persisted round award and never reveal a pending bid",
    );
  });
});
