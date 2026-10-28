import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310195_cfb_superteam_elastic_field.sql",
  "utf8",
);
const day1FieldFreeze = readFileSync(
  "supabase/migrations/202612310232_weekly_auction_day1_field_freeze.sql",
  "utf8",
);
const repository = readFileSync(
  "src/features/play/footballWeeklyAuctionRepository.ts",
  "utf8",
);
const gate = readFileSync(
  "src/features/back-room/FootballWeeklySuperteamGate.tsx",
  "utf8",
);

describe("CFB Superteam elastic weekly field", () => {
  it("prebuilds hidden reserve supply without rerolling the eight-card base", () => {
    expect(migration).toContain("v_existing not in (0,56)");
    expect(migration).toContain("launch_slot=8+v_pick");
    expect(migration).toContain("<>84");
    expect(migration).toContain("Slots 1-8 are never deleted or rerolled");
  });

  it("scales future boards from 8 through 12 while keeping the current day stable", () => {
    expect(migration).toContain("private.football_weekly_superteam_cards_for_field");
    expect(migration).toContain("when p_players<=7 then 9");
    expect(migration).toContain("when p_players=8 then 10");
    expect(migration).toContain("when p_players=9 then 11");
    expect(migration).toContain("else 12");
    expect(migration).toContain("participant.locked_at<v_day_start");
  });

  it("keeps reserve supply elastic while freezing the competitor field after Day 1", () => {
    expect(migration).toContain("private.football_weekly_superteam_join_capacity");
    expect(migration).toContain("coalesce(v_flex_pool,0)/3");
    expect(migration).toContain("award.profile_id is null");
    expect(day1FieldFreeze).toContain("board.day_index=1");
    expect(day1FieldFreeze).toContain("private.football_weekly_superteam_join_capacity");
    expect(day1FieldFreeze).toContain("if v_current>=v_capacity then return false");
    expect(day1FieldFreeze).toContain("'day_1_join'");
    expect(day1FieldFreeze).not.toContain("then 'elastic_join'");
    expect(day1FieldFreeze).toContain("Elastic CFB supply affects hidden future cards only");
  });

  it("widens Superteam slots and claim ranks to twelve end to end", () => {
    expect(migration).toContain("slot between 1 and 12");
    expect(migration).toContain("claim_rank between 1 and 12");
    expect(repository).toContain("teams: z.array(superteamCardSchema).min(8).max(12)");
    expect(repository).toContain("priority: z.coerce.number().int().min(1).max(12)");
    expect(gate).toContain("priorityCount={state.teams.length}");
    expect(gate).toContain("<strong>{state.teams.length}</strong><span>CANDIDATES</span>");
  });
});
