import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310228_nfl_team_season_wildcard_engine.sql",
  "utf8",
);
const formatAudit = readFileSync(
  "docs/weekly-auction-nfl-team-season-format-calibration.md",
  "utf8",
);

describe("NFL team-season Weekly Auction Day 7 Wildcard engine", () => {
  it("locks the four-card reveal-before-entry structure", () => {
    expect(migration).toContain("slot integer not null check (slot between 1 and 4)");
    expect(migration).toContain("v_targets numeric[]:=array[90.5,89.0,87.5,85.5]");
    expect(migration).toContain("football_weekly_nfl_team_season_wildcard_state");
    expect(migration).toContain("'teams',v_board");
    expect(migration).toContain("'my_entries',coalesce(v_my_entries,0)");
    expect(migration).not.toContain("'hidden_grade',item.hidden_grade");
  });

  it("treats entries as literal linear tickets on both separate wheels", () => {
    expect(migration).toContain("p_entries not between 0 and 5");
    expect(migration).toContain("submission.entry_count>0");
    expect(migration).toContain("football_weekly_auction_weighted_ticket_pick");
    expect(migration).toContain("Priority wheel: sequential weighted draws without replacement");
    expect(migration).toContain("Reaping wheel is separate from Priority and uses the same literal entry weights");
    expect(migration).not.toContain("n(n+1)/2");
    expect(migration).not.toContain("temporary -7");
  });

  it("keeps a zero-entry pass completely off Priority and Reaping", () => {
    const priorityStart = migration.indexOf("-- Priority wheel:");
    const reapingStart = migration.indexOf("-- Reaping wheel");
    expect(priorityStart).toBeGreaterThan(-1);
    expect(reapingStart).toBeGreaterThan(priorityStart);

    const priorityBlock = migration.slice(priorityStart, reapingStart);
    const reapingBlock = migration.slice(reapingStart, migration.indexOf("-- Completion happens"));
    expect(priorityBlock).toContain("submission.entry_count>0");
    expect(reapingBlock).toContain("submission.entry_count>0");
  });

  it("keeps entries editable until the Day 7 lock and then persists the wheel result", () => {
    expect(migration).toContain("if p_at<v_lock_at then");
    expect(migration).toContain("return;");
    expect(migration).toContain("Merely having");
    expect(migration).toContain("football_weekly_nfl_team_season_wildcard_priority_draws");
    expect(migration).toContain("football_weekly_nfl_team_season_wildcard_resolutions");
    expect(migration).toContain("if exists(");
    expect(migration).toContain("then\n    return;");
    expect(migration).toContain("primary key (week_start, draw_order)");
    expect(migration).toContain("unique (week_start, profile_id)");
  });

  it("caps each player at one Wildcard and resolves only a true scoring upgrade", () => {
    expect(migration).toContain("primary key (week_start, profile_id)");
    expect(migration).toContain("unique (week_start, item_reference)");
    expect(migration).toContain("where scored.scoring_order=4");
    expect(migration).toContain("if v_candidate_grade>v_replaced_grade then");
    expect(migration).toContain("replaced_item_reference");
  });

  it("reaps from all entrants, not only players who won a Wildcard", () => {
    const reapingStart = migration.indexOf("-- Reaping wheel");
    const completionStart = migration.indexOf("-- Completion happens");
    const reapingBlock = migration.slice(reapingStart, completionStart);

    expect(reapingBlock).toContain("football_weekly_nfl_team_season_wildcard_submissions");
    expect(reapingBlock).not.toContain("from private.football_weekly_nfl_team_season_wildcard_claims");
  });

  it("carries exactly one minus-five bankroll adjustment into the next calendar auction week", () => {
    expect(migration).toContain("bankroll_delta integer not null default -5");
    expect(migration).toContain("p_week_start+7,v_pick,'wildcard_reaping',-5");
    expect(migration).toContain("on conflict(week_start,profile_id,adjustment_kind)");
    expect(migration).toContain("amount_delta=-5");
    expect(migration).toContain("football_weekly_auction_starting_bankroll");
  });

  it("autofills only after Wildcard from the worst unclaimed normal cards that actually appeared", () => {
    const completionStart = migration.indexOf("-- Completion happens");
    const completionBlock = migration.slice(completionStart);

    expect(completionBlock).toContain("board.day_index between 1 and 6");
    expect(completionBlock).toContain("award.profile_id is null");
    expect(completionBlock).toContain("order by item.hidden_grade asc,board.season_reference");
    expect(completionBlock).toContain("completion capacity exhausted");
  });

  it("keeps other players' ticket counts sealed until resolution", () => {
    expect(migration).toContain("Other players' ticket counts remain sealed until resolution");
    expect(migration).toContain("'priority_draws',case when v_resolved then v_priority else '[]'::jsonb end");
  });

  it("documents the approved four-Wildcard and next-week bankroll rules", () => {
    expect(formatAudit).toContain("4 Wildcard");
    expect(formatAudit).toContain("$45");
    expect(formatAudit).toContain("0 entries");
    expect(formatAudit).not.toContain("2 Wildcard team-seasons");
    expect(formatAudit).not.toContain("temporary **-7");
  });
});
