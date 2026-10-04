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
  it("owns one server-side eligibility rule for both NFL and CFB pool scopes", () => {
    expect(migration).toContain("private.wheel_football_team_has_open_candidate");
    expect(migration).toContain("private.wheel_football_eligible_team_codes");
    expect(migration).toContain("match.pool_scope = 'NFL'");
    expect(migration).toContain("match.pool_scope = 'CFB'");
    expect(migration).toContain("match.pool_scope = 'AP_TOP_25'");
    expect(migration).toContain("match.pool_scope = 'SEC'");
    expect(migration).toContain("match.pool_scope = 'BIG_TEN'");
    expect(migration).toContain("match.pool_scope = 'BIG_12'");
    expect(migration).toContain("match.pool_scope = 'ACC'");
  });

  it("covers the quarterback and head-coach dead-roll examples without backup-QB logic", () => {
    expect(migration).toContain("('DAL','QB','QB','Dak Prescott')");
    expect(migration).toContain("('DAL','Head Coach','Head Coach','Brian Schottenheimer')");
    expect(migration).toContain("('CHI','QB','QB','Caleb Williams')");
    expect(migration).toContain("('CHI','Head Coach','Head Coach','Ben Johnson')");
    expect(migration).not.toContain("Backup Quarterback");
  });

  it("filters the visible wheel to the same eligible-team projection returned by the server", () => {
    expect(repository).toContain("eligible_team_codes:");
    expect(page).toContain("const eligibleTeamCodeSet = new Set(eligibleTeamCodes ?? [])");
    expect(page).toContain("fullPoolTeams.filter((team) => eligibleTeamCodeSet.has(team.code))");
    expect(page).toContain('state.phase === "spin" && poolTeams.length > 0');
  });

  it("avoids the last team when possible but permits it as the only legal outcome", () => {
    expect(migration).toContain("case when eligible.code = v_last_team then 1 else 0 end");
    expect(migration).not.toContain("team.code <> v_last_team");
    expect(page).toContain("repeat teams are avoided whenever another eligible team is available");
  });

  it("returns any already-dead pending rollout spin to the same player's wheel for a free retry", () => {
    expect(migration).toContain("where match.phase = 'pick'");
    expect(migration).toContain("set phase = 'spin'");
    expect(migration).toContain("and not private.wheel_football_team_has_open_candidate");
  });

  it("requires an open slot, an undrafted identity, and a locked grade before a team stays on the wheel", () => {
    expect(migration).toContain("own_pick.roster_slot = candidate.roster_slot");
    expect(migration).toContain("used_pick.challenge_id = p_challenge_id");
    expect(migration).toContain("private.wheel_football_grade_authority grade");
    expect(migration).toContain("grade.position_group = candidate.position_group");
  });
});
