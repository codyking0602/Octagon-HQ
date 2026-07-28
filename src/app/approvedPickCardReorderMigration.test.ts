import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202608140001_approved_live_fight_reorders.sql", "utf8");

describe("approved live fight reorder migration", () => {
  it("keeps one owner-only atomic reorder boundary and event-level audit action", () => {
    expect(sql).toContain("approve_pick_card_reorder");
    expect(sql).toContain("is_pick_control_owner(auth.uid())");
    expect(sql).toContain("for update");
    expect(sql).toContain("'reorder_card'");
    expect(sql).not.toMatch(/delete from public\.pick_bouts/i);
    expect(sql).not.toMatch(/profile_event_(picks|underdog_locks).*?(update|delete)/is);
  });
});
