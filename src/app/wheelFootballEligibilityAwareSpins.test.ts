import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310256_wheel_football_eligibility_aware_spins.sql",
  "utf8",
);
const repository = readFileSync(
  "src/features/play/wheelFootballRepository.ts",
  "utf8",
);
const page = readFileSync(
  "src/features/back-room/FootballWheelPage.tsx",
  "utf8",
);

describe("Wheel of Football eligibility-aware spins", () => {
  it("filters NFL and CFB spins by open slots and already-drafted identities", () => {
    expect(migration).toContain("private.wheel_football_team_has_eligible_pick");
    expect(migration).toContain("private.wheel_football_eligible_team_codes");
    expect(migration).toContain("authority.position_group = 'QB'");
    expect(migration).toContain("authority.position_group = 'Head Coach'");
    expect(migration).toContain("drafted.challenge_id = p_challenge_id");
    expect(migration).toContain(
      "private.wheel_football_grade_base_name_key(drafted.display_name)",
    );
    expect(migration).toContain("upper(trim(coalesce(p_pool_scope, ''))) = 'CFB'");
    expect(migration).toContain("upper(trim(coalesce(p_pool_scope, ''))) = 'NFL'");
  });

  it("avoids the previous personal team unless it is the only eligible team", () => {
    expect(migration).toContain("cardinality(v_eligible_team_codes) > 1");
    expect(migration).toContain("eligible.code = v_last_team");
    expect(migration).not.toContain(
      "and (v_last_team is null or team.code <> v_last_team)",
    );
  });

  it("supports a free automatic re-spin only when a pending team is dead", () => {
    expect(migration).toContain("v_dead_pending := not private.wheel_football_team_has_eligible_pick");
    expect(migration).toContain("if v_match.phase <> 'spin' and not v_dead_pending then");
    expect(page).toContain("const pendingTeamEligible = !pendingTeam || eligibleTeamCodes.has(pendingTeam.code)");
    expect(page).toContain("(state.eligible_team_codes?.length ?? 0) === 0");
    expect(page).toContain("void spin();");
  });

  it("uses the server eligibility projection to remove dead teams from the visible wheel", () => {
    expect(repository).toContain(
      "eligible_team_codes: z.array(z.string().min(1).max(64)).nullable().optional().default(null)",
    );
    expect(page).toContain(
      "allPoolTeams.filter((team) => eligibleTeamCodes.has(team.code))",
    );
    expect(page).toContain(
      "dead spins auto-respin for free",
    );
  });
});
