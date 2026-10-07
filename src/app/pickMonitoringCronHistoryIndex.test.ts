import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310277_pick_monitoring_cron_history_lookup_index.sql",
  "utf8",
);

describe("Pick monitoring cron history lookup", () => {
  it("uses pg_cron's indexed monotonic runid instead of sorting extension history by start_time", () => {
    expect(migration).toContain("order by detail.runid desc");
    expect(migration).not.toContain("order by detail.start_time desc");
    expect(migration).not.toContain("create index");
  });
});
