import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202608140001_approved_live_fight_reorders.sql", "utf8");

describe("approved live fight reorder migration", () => {
  it("keeps one owner-only atomic reorder boundary and event-level audit action", () => {
    expect(sql).toContain("approve_pick_card_reorder");
    expect(sql).toContain("returns jsonb");
    expect(sql).toContain("is_pick_control_owner(auth.uid())");
    expect(sql).toContain("for update");
    expect(sql).toContain("'reorder_card'");
    expect(sql).toContain("pick_card_change_action_subject");
    expect(sql).toContain("pick_card_change_actions_event_id_fkey");
    expect(sql).toContain("'red_fighter_name'");
    expect(sql).toContain("'blue_fighter_name'");
    expect(sql).toContain("'can_reorder'");
    expect(sql).toContain("'has_reorder_history'");
    expect(sql).not.toMatch(/delete from public\.pick_bouts/i);
    expect(sql).not.toMatch(/profile_event_(picks|underdog_locks).*?(update|delete)/is);
  });
});