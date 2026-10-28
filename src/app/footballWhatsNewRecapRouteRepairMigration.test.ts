import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const completionMigration = () => readFileSync("supabase/migrations/202612310087_football_pick_week_recaps.sql", "utf8");
const repairMigration = () => readFileSync("supabase/migrations/202612310089_repair_football_whats_new_recap_route.sql", "utf8");

describe("Football Picks recap What's New routing", () => {
  it("keeps future completion publishing on the exact Football week recap", () => {
    const sql = completionMigration();
    expect(sql).toContain("case when v_event.sport = 'football'");
    expect(sql).toContain("'/football/picks?event=' || v_event.event_id || '&view=recap'");
    expect(sql).toContain("'picks:recap:' || v_event.event_id");
  });

  it("repairs already-published Football recap items in place instead of creating another feed path", () => {
    const sql = repairMigration();
    expect(sql).toContain("update private.whats_new_items item");
    expect(sql).toContain("from public.pick_events event");
    expect(sql).toContain("event.sport = 'football'");
    expect(sql).toContain("item.source_key = 'picks:recap:' || event.event_id");
    expect(sql).toContain("'/football/picks?event=' || event.event_id || '&view=recap'");
    expect(sql).not.toMatch(/insert\s+into\s+private\.whats_new_items/i);
  });
});
