import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballGmPlayerById, footballGmProjectedGradeForPlayer } from "../features/back-room/footballGmEngine";
import { FOOTBALL_GM_SCORE_WEIGHTS, footballGmScoreFromComponents } from "../features/back-room/footballGmStrategy";

const backend = readFileSync("supabase/migrations/202612310292_weekly_nfl_gm_championship.sql","utf8");
const integration = readFileSync("supabase/migrations/202612310293_weekly_gm_championship_placement.sql","utf8");
const mode = readFileSync("src/features/back-room/FootballGmModePage.tsx","utf8");
const official = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx","utf8");

describe("October 13 Weekly GM Featured Championship", () => {
  it("preserves ordinary GM scoring components but reweights them 90/10", () => {
    expect(FOOTBALL_GM_SCORE_WEIGHTS).toEqual({rosterManagement:0.90,threeYearResume:0.10});
    expect(footballGmScoreFromComponents(90,100)).toBe(91);
  });
  it("fixes only the two assigned official QB development outcomes", () => {
    const allen = footballGmPlayerById("BUF|QB|joshallen")!;
    const dart = footballGmPlayerById("NYG|QB|jaxsondart")!;
    expect(allen).toBeTruthy();
    expect(dart).toBeTruthy();
    expect(footballGmProjectedGradeForPlayer(allen,2,"test:weekly-gm-elite:gmdev1")).toBe(99);
    expect(footballGmProjectedGradeForPlayer(allen,3,"test:weekly-gm-elite:gmdev1")).toBe(99);
    expect(footballGmProjectedGradeForPlayer(dart,2,"test:weekly-gm-young:gmdev1")).toBe(87);
    expect(footballGmProjectedGradeForPlayer(dart,3,"test:weekly-gm-young:gmdev1")).toBe(87);
    expect(footballGmProjectedGradeForPlayer(dart,1,"test:weekly-gm-young:gmdev1")).toBe(82);
  });
  it("binds one server-owned attempt per player and QB event", () => {
    expect(backend).toContain("primary key(week_start,profile_id,scenario)");
    expect(backend).toContain("v_entry.completed_at is not null");
    expect(backend).toContain("p_expected_revision");
    expect(backend).toContain("state=p_state,result=p_result,score=v_score");
    expect(backend).toContain("GM progress changed in another session");
    expect(backend).toContain("2026-10-20 00:00");
    expect(backend).toContain("v_spin not between 1 and 7");
    expect(backend).toContain("v_spin>v_prev_spin+1");
    expect(backend).toContain("v_expected_qb");
    expect(backend).toContain("v_week_start <> date '2026-10-13'");
  });
  it("has six actual randomized spins, with Casual mode separate", () => {
    expect(mode).toContain("spinIndex: 1");
    expect(mode).toContain("weeklyGmRepository.start(weeklyScenario)");
    expect(mode).toContain("footballGmSpinTeam(run.seed, run.spinIndex, draftEligibleTeamCodes)");
    expect(mode).toContain("if (weeklyScenario) { navigate");
    expect(mode).toContain("weeklySaveQueue");
    expect(official).toContain("Six random spins");
    expect(official).toContain("Josh Allen");
    expect(official).toContain("Jaxson Dart");
  });
  it("gives Weekly GM one Featured placement without changing 60/30/10", () => {
    expect(integration).toContain("select date '2026-10-13' as week_start");
    expect(integration).toContain("sum(score)::numeric as total_score");
    expect(integration).toContain("rank() over(partition by gm.week_start order by gm.total_score desc)");
    expect(integration).toContain("then 'Weekly NFL GM'");
    expect(integration).toContain("else 10 end as featured_weight");
  });
});
