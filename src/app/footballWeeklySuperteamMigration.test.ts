import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authority = readFileSync(
  "supabase/migrations/202612310193_cfb_superteam_authority.sql",
  "utf8",
);
const runtime = readFileSync(
  "supabase/migrations/202612310194_cfb_superteam_runtime.sql",
  "utf8",
);
const gate = readFileSync(
  "src/features/back-room/FootballWeeklySuperteamGate.tsx",
  "utf8",
);

describe("CFB Superteam Weekly Auction", () => {
  it("locks the seven-slot, $50, eight-card five-player calibration", () => {
    expect(authority).toContain("'cfb-superteam','CFB Superteam'");
    expect(authority).toContain("date '2026-09-29'");
    expect(authority).toContain("v_qb<>50 or v_rb<>50 or v_wr<>50 or v_te<>24");
    expect(authority).toContain("v_f7<>60 or v_secondary<>60 or v_coach<>35");
    expect(runtime).toContain("when 'cfb-superteam' then 8");
    expect(runtime).toContain("select 7-count(*)::integer");
    expect(runtime).toContain("select 50-coalesce(sum(roster.price_paid),0)::integer");
    expect(gate).toContain("7 spots. $50. 7 days.");
    expect(gate).toContain("Max 2 wins today");
  });

  it("keeps conditional overcommit, reserve, roster locks, and rotating waiver server-owned", () => {
    expect(runtime).toContain("football_weekly_superteam_claims");
    expect(runtime).toContain("claim.priority asc");
    expect(runtime).toContain("football_weekly_superteam_daily_waiver_rank");
    expect(runtime).toContain("p_day_index-1");
    expect(runtime).toContain("football_weekly_superteam_open_slots");
    expect(runtime).toContain("- greatest(");
    expect(runtime).toContain("roster.roster_slot=claim.roster_slot");
    expect(runtime).toContain(")<2");
  });

  it("burns candidates, materializes the need-responsive eighth card, and guarantees completion", () => {
    expect(runtime).toContain("not exists(\n        select 1\n        from private.football_weekly_auction_board used");
    expect(runtime).toContain("The eighth card is need-responsive");
    expect(runtime).toContain("football_weekly_superteam_autofill");
    expect(runtime).toContain("authority.hidden_grade asc");
    expect(runtime).toContain("price_paid,awarded_day,source");
    expect(runtime).toContain("v_cards<>8");
  });

  it("keeps the next-week preview Cody-only and nonparticipating", () => {
    expect(runtime).toContain("public.get_my_football_weekly_superteam_preview()");
    expect(runtime).toContain("public.is_pick_control_owner(v_profile)");
    expect(runtime).toContain("profile.normalized_name='CODY'");
    const previewSection = runtime.slice(runtime.indexOf("create or replace function public.get_my_football_weekly_superteam_preview"));
    expect(previewSection).not.toContain("perform private.maintain_football_weekly_auction");
    expect(previewSection).toContain("'claims','{}'::jsonb");
  });
});
