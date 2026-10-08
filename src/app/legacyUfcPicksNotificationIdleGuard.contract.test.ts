import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "ops/legacy-ufc-picks/20261008_skip_idle_notification_drain.sql",
  "utf8",
);

describe("legacy UFC Picks zero-egress idle notification drain", () => {
  it("keeps the cron queue and delivery behavior while avoiding idle HTTP calls", () => {
    expect(sql).toContain("Legacy UFC Picks project ONLY: hdkjwezaswhisxupxydc");
    const enqueue = sql.indexOf("v_queued := public.app_queue_picks_reminders()");
    const guard = sql.indexOf("if not exists (");
    const pending = sql.indexOf("where status <> 'sent'");
    const http = sql.indexOf("select net.http_post(");
    expect(enqueue).toBeGreaterThan(0);
    expect(guard).toBeGreaterThan(enqueue);
    expect(pending).toBeGreaterThan(guard);
    expect(http).toBeGreaterThan(pending);
    expect(sql).toContain("'idle', true");
    expect(sql).toContain("'mode', 'drain'");
    expect(sql).toContain("'internal_token', v_config.internal_token");
    expect(sql).toContain("timeout_milliseconds := 15000");
    expect(sql).not.toContain("cron.unschedule");
    expect(sql).not.toContain("delete from");
  });
});
