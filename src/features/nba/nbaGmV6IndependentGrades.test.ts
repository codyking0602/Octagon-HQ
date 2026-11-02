import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202612310913_nba_gm_v6_independent_skills_historical_grades.sql", "utf8");
const page = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const finalPage = readFileSync("src/features/nba/NbaGmFinalExperience.tsx", "utf8");
const repo = readFileSync("src/features/nba/nbaGmDevRepository.ts", "utf8");
const tests = readFileSync("supabase/tests/nba_gm_v6_independent_skills_historical_grades.sql", "utf8");

describe("NBA GM V6 independent two-sided model and historical grading", () => {
  it("does not assign offensive or defensive impact by overall prestige", () => {
    expect(sql).not.toContain("v_base");
    expect(sql).not.toContain("v_base*.38");
    expect(sql).toContain("v_o:=greatest(-5.0,least(8.0,.45*(v_off_index-75)))");
    expect(sql).toContain("v_d:=greatest(-4.0,least(6.5,.23*(v_def_index-74.5)))");
    expect(sql).toContain("v_def:=greatest(-9.0,least(6.25,v_def))");
    expect(sql).toContain("v_weight:=case when v_slot in ('GUARD','BIG') then .50 else .63 end");
    expect(tests).toContain("Overall grade still boosts simulated side impact");
    expect(tests).toContain("Luka perimeter defense change did not independently affect defense");
  });

  it("grounds the 60–99 OFF and DEF grades to all 150 historical NBA teams", () => {
    expect(sql).toContain("count(*) filter(where t.offensive_rating - base.avg_off <= v_off)");
    expect(sql).toContain("count(*) filter(where base.avg_def - t.defensive_rating <= v_def)");
    expect(sql).toContain("group by season_end");
    expect(sql).toContain("v_off_grade:=greatest(60,least(99");
    expect(sql).toContain("v_def_grade:=greatest(60,least(99");
    expect(sql).toContain("'offense',v_off_grade,'defense',v_def_grade");
    expect(tests).toContain("v_count<>600");
    expect(tests).toContain("v_result->>'offense'");
  });

  it("retains old V5 router and saved snapshots while creating V6 only for new runs", () => {
    expect(sql).toContain("v_new:=E'begin");
    expect(sql).toContain("private.nba_gm_v6_season(p_state,p_year)");
    expect(sql).toContain("''simulationModelVersion''=''5'' then");
    expect(sql).toContain("''simulationModelVersion'',6");
    expect(tests).toContain("V5 saved run changed under V6 router");
    expect(repo).toContain("simulationModelVersion:z.union([z.literal(5),z.literal(6)]).optional()");
  });

  it("labels V6 percentage-relative grades without relabeling legacy 86.8 / 82.7 as grades", () => {
    expect(page).toContain('graded={run.simulationModelVersion===6||run.simulationModelVersion===7}');
    expect(page).toContain("OFFENSE GRADE");
    expect(page).toContain("DEFENSE GRADE");
    expect(page).toContain("season.offense.toFixed(1)");
    expect(finalPage).toContain('run.simulationModelVersion===7?"OVR":run.simulationModelVersion===6?"GRD":"SIM"');
    expect(finalPage).toContain("compared with 150 NBA team-seasons");
  });
});
