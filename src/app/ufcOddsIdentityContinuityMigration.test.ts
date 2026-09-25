import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202612310180_ufc_odds_identity_continuity.sql",
  "utf8",
);

describe("UFC odds identity continuity migration", () => {
  it("separates same-person corrections from true opponent replacements", () => {
    expect(sql).toContain("private.ufc_fighter_identity_aliases");
    expect(sql).toContain("private.pick_fighter_person_key");
    expect(sql).toContain("'correct_fighter_identity'");
    expect(sql).toContain("fighter identity correction must resolve to the same person");
    expect(sql).toContain("p_payload->>'identity_correction'");
    expect(sql).toContain("private.apply_pick_fighter_identity_correction");
  });

  it("uses the stable UFC athlete slug before requiring a pre-registered name alias", () => {
    expect(sql).toContain("A stable UFC athlete profile slug is the strongest same-person evidence");
    expect(sql).toContain("v_replacement_slug is distinct from v_old_slug");
    expect(sql).toContain("private.pick_fighter_person_key(v_old_name)");
    expect(sql).toContain("private.pick_fighter_person_key(v_replacement_name)");
  });

  it("preserves picks, locks, and odds for identity corrections", () => {
    expect(sql).toContain("update public.profile_event_picks");
    expect(sql).toContain("update public.profile_event_underdog_locks");
    expect(sql).not.toMatch(/apply_pick_fighter_identity_correction[\s\S]*red_american_odds\s*=\s*null/i);
    expect(sql).toContain("'picks_invalidated', 0");
    expect(sql).toContain("'repicks_required', false");
    expect(sql).toContain("'notification_recorded', false");
  });

  it("restores only missing Sep 26 picks and null odds from preserved audit evidence", () => {
    expect(sql).toContain("before_state->'invalidated_picks'");
    expect(sql).toContain("bout.red_american_odds is null");
    expect(sql).toContain("bout.blue_american_odds is null");
    expect(sql).toContain("where not exists");
    expect(sql).toContain("current_pick.profile_id");
    expect(sql).toContain("main-melissa-amaya-valesca-machado");
    expect(sql).toContain("main-mehemmedeli-osmanli-ilimbek-akylbek");
  });

  it("suppresses owner alerts for auto-applied same-person corrections only", () => {
    expect(sql).toContain("new.finding_type = 'card_change'");
    expect(sql).toContain("new.source_details->'approval_proposal'->>'identity_correction'");
    expect(sql).toContain("return new;");
    expect(sql).toContain("new.finding_type = 'unmatched_fight'");
  });
});
