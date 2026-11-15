import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612311535_ufc_explicit_nonwinner_result_settlement.sql",
  "utf8",
);
const adapter = readFileSync(
  "src/features/picks-monitoring/espnLiveFightState.ts",
  "utf8",
);

describe("UFC explicitly verified draw and no-contest settlement", () => {
  it("recognizes only explicit source verdicts; generic winnerless finals stay pending", () => {
    expect(adapter).toContain("function explicitNonWinnerVerdict(");
    expect(adapter).toContain('const verdict = state === "final" && winner === null');
    expect(adapter).toContain("...(verdict ? { explicit_result_status: verdict } : {})");
    expect(adapter).toContain('return "draw"');
    expect(adapter).toContain('return "no_contest"');
    expect(adapter).toContain("return null;");
  });

  it("reuses the trusted original live-state owner and canonical official result recorder", () => {
    expect(migration).toContain("private.record_pick_bout_live_states_ufc_recap_core");
    expect(migration).toContain("public.record_official_pick_bout_result(");
    expect(migration).toContain("public.transition_pick_event(v_event.event_id, 'locked')");
    expect(migration).toContain("v_explicit_status not in ('draw', 'no_contest')");
    expect(migration).toContain("v_observation->>'state' <> 'final'");
    expect(migration).toContain("v_observation->>'provider' <> 'espn'");
    expect(migration).toContain("bout.live_status = 'final'");
    expect(migration).toContain("bout.live_source_competition_id = v_observation->>'source_competition_id'");
    expect(migration).toContain("bout.live_detected_winner_fighter_slug is null");
    expect(migration).toContain("bout.result_status = 'pending'");
  });

  it("never directly changes official results, guesses winners, or bypasses result-correction rules", () => {
    expect(migration).not.toContain("update public.pick_bouts");
    expect(migration).not.toContain("update public.pick_events");
    expect(migration).not.toContain("set winner_fighter_slug");
    expect(migration).not.toContain("create or replace function public.record_official_pick_bout_result");
    expect(migration).toContain("grant execute on function public.record_pick_bout_live_states(text, jsonb)");
  });
});
