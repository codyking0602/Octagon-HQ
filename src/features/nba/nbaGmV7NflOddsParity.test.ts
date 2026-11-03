import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql=readFileSync("supabase/migrations/202612310914_nba_gm_v7_nfl_playoff_odds.sql","utf8");
const original=readFileSync("src/features/back-room/footballGmStrategy.ts","utf8");
const model=readFileSync("src/features/nba/nbaGmDevModel.ts","utf8");
const repository=readFileSync("src/features/nba/nbaGmDevRepository.ts","utf8");
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const final=readFileSync("src/features/nba/NbaGmFinalExperience.tsx","utf8");
const regression=readFileSync("supabase/tests/nba_gm_v7_nfl_playoff_odds.sql","utf8");

describe("NBA GM V7 mirrors NFL's outcome curve without predetermining results",()=>{
  it("reuses the exact ten calibrated Football GM odds anchors with NBA finish labels",()=>{
    const values=sql.match(/with anchors\(grade,miss,first,semis,conference,finals,champ\) as \(values\s*([\s\S]*?)\),\s*bounded as/);
    expect(values).not.toBeNull();
    const rows=[...(values?.[1]??"").matchAll(/\((\d+(?:\.\d+)?),([^()]+)\)/g)]
      .map(m=>[Number(m[1]),...m[2].split(",").map(Number)]);
    expect(rows).toHaveLength(10);
    const nfl=[...original.matchAll(/\{ grade: ([\d.]+), "Missed Playoffs": ([\d.]+), "Wild Card": ([\d.]+), Divisional: ([\d.]+), "Conference Championship": ([\d.]+), "Super Bowl Loss": ([\d.]+), Champion: ([\d.]+) \}/g)]
      .filter(match=>Number(match[1])<=92.5)
      .map(match=>match.slice(1).map(Number));
    expect(rows).toEqual(nfl);
    rows.forEach(row=>expect(row.slice(1).reduce((a,b)=>a+b,0)).toBeCloseTo(1,5));
    expect(rows.find(row=>row[0]===92)?.[6]).toBe(.434);
    expect(rows.find(row=>row[0]===92.5)?.[6]).toBe(.496);
    expect(sql).toContain("private.nba_gm_v7_overall(v_strength)");
  });
  it("runs four actual best-of-seven series with seeded matchups instead of drawing a finish",()=>{
    expect(sql).toContain("for v_round in 1..4 loop");
    expect(sql).toContain("for v_game in 1..7 loop");
    expect(sql).toContain("v_series:=35*power(v_mid,4)");
    expect(sql).toContain("v_home:=case");
    expect(sql).toContain("v_roll<v_game_win");
    expect(sql).toContain("v_roll<v_entry");
    expect(sql).toContain("nba_gm_v5_historical_teams");
    expect(regression).toContain("v_count<>900");
    expect(regression).toContain("v_chips[1]<55 or v_chips[1]>105");
  });
  it("preserves V5/V6 runs, NFL engine and score rules, opting in new NBA starts only",()=>{
    expect(sql).toContain("simulationModelVersion''=''7'' then");
    expect(sql).toContain("''simulationModelVersion'',7");
    expect(sql).toContain("simulationModelVersion''=''6'' then");
    expect(regression).toContain("V7 changed saved V%");
    expect(model).toContain("simulationModelVersion?: 5 | 6 | 7 | 8;");
    expect(repository).toContain("z.literal(5),z.literal(6),z.literal(7),z.literal(8)");
  });
  it("shows current team OVR and title odds without excess breakdown while retaining V7 scoring history",()=>{
    expect(page).toContain("season.teamOverall!=null&&season.titleOdds!=null");
    expect(page).not.toContain("season.outcomeOdds&&<details");
    expect(page).not.toContain("VIEW PLAYOFF OUTCOME ODDS");
    expect(page).not.toContain("Finals Loss");
    expect(page).toContain("graded={run.simulationModelVersion===6||run.simulationModelVersion===7||run.simulationModelVersion===8}");
    expect(final).toContain('(run.simulationModelVersion===7||run.simulationModelVersion===8)?"OVR"');
    expect(repository).toContain('teamOverall:z.number().int().min(70).max(99).optional()');
    expect(sql).toContain("'titleOdds',round(100*(v_odds->>'Champion')::numeric,1)");
  });
});
