import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310277_pick_monitoring_cron_history_lookup_index.sql",
  "utf8",
);

describe("Pick monitoring cron history lookup index", () => {
  it("covers the scheduler history predicate and newest-wake ordering used by Monitoring Inbox", () => {
    expect(migration).toContain("on cron.job_run_details (jobid, start_time desc)");
    expect(migration).toContain("create index if not exists");
  });
});
