import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { wheelFootballPoolTeams } from "./wheelFootballModel";
import {
  CFB_GM_AP_SCHOOLS, CFB_GM_BUDGETS, CFB_GM_PLAYERS, CFB_GM_ROSTER_SLOTS,
  cfbGmCandidates, cfbGmEligibleSchools, cfbGmEnterOffseason, cfbGmFinalResult,
  cfbGmInitial, cfbGmOpenSlots, cfbGmPick, cfbGmPlayer, cfbGmPortalOut,
  cfbGmReflow, cfbGmSeason, cfbGmSpent, cfbGmSpin, cfbGmTeamGrade,
} from "./footballCfbGmEngine";

describe("CFB The GM owner preview", () => {
  it("locks the approved 7 slots, two separate Front Seven starters and current AP Top 25", () => {
    expect(CFB_GM_ROSTER_SLOTS).toEqual(["QB", "RB", "WR", "FLEX", "FRONT_7_A", "FRONT_7_B", "SECONDARY"]);
    expect(CFB_GM_AP_SCHOOLS).toEqual(wheelFootballPoolTeams("AP_TOP_25").map((x) => x.code));
    expect(CFB_GM_AP_SCHOOLS).toHaveLength(25);
    expect(CFB_GM_AP_SCHOOLS).toContain("boise-state");
    expect(CFB_GM_AP_SCHOOLS).toContain("pittsburgh");
    expect(CFB_GM_AP_SCHOOLS).not.toContain("kentucky");
  });


  it("keeps the compact public grade projection identical to the canonical audited Wheel sources", () => {
    const projection = JSON.parse(readFileSync("data/generated/football/wheel-cfb-gm-grade-projection-2026-10-07.json","utf8")) as {
      sourceAuthority:string[]; boiseAuthority:string;
      grades:Array<{school:string;family:string;player:string;grade:number}>;
    };
    const families = ["QB","RB","WR","TE","Front Seven","Secondary"];
    const canonical = projection.sourceAuthority.flatMap((path, i) => (
      (JSON.parse(readFileSync(path,"utf8")) as {grades:Array<{school:string;player:string;grade:number}>}).grades
        .map((r) => ({school:r.school,family:families[i]!,player:r.player,grade:r.grade}))
    ));
    const boise = (JSON.parse(readFileSync(projection.boiseAuthority,"utf8")) as {
      grades:Array<{family:string;name:string;grade:number}>;
    }).grades.filter((r) => r.family !== "Head Coach").map((r) => ({
      school:"Boise State",family:r.family,player:r.name,grade:r.grade,
    }));
    const sort = (rows: typeof projection.grades) => rows.sort((a,b) =>
      a.school.localeCompare(b.school) || a.family.localeCompare(b.family) || a.player.localeCompare(b.player));
    expect(projection.grades).toEqual(sort([...canonical,...boise]));
  });

  it("reads the locked Wheel grades rather than inferring quality from NIL amounts", () => {
    expect(CFB_GM_PLAYERS.length).toBeGreaterThan(200);
    expect(new Set(CFB_GM_PLAYERS.map((p) => p.id)).size).toBe(CFB_GM_PLAYERS.length);
    expect(CFB_GM_PLAYERS.every((p) => p.currentGrade >= 60 && p.currentGrade <= 100)).toBe(true);
    expect(CFB_GM_PLAYERS.every((p) => p.nilYear1 > 0 && p.nilYear2 > 0)).toBe(true);
    expect(CFB_GM_PLAYERS.every((p) => CFB_GM_AP_SCHOOLS.includes(p.schoolId))).toBe(true);
    expect(CFB_GM_PLAYERS.find((p) => p.name === "Justin Cryer")?.currentGrade).toBe(85);
    expect(CFB_GM_PLAYERS.find((p) => p.name === "Luke Metz")?.currentGrade).toBe(87);
    expect(CFB_GM_PLAYERS.find((p) => p.name === "Maddux Madsen")?.currentGrade).toBe(88);
    const upper = cfbGmInitial("example-run-1234", "POWERHOUSE");
    const lower = cfbGmInitial("example-run-1234", "BUILDER");
    expect(CFB_GM_BUDGETS[upper.budget]).toBe(11_000_000);
    expect(CFB_GM_BUDGETS[lower.budget]).toBe(7_500_000);
    expect(cfbGmPlayer(CFB_GM_PLAYERS[0]!.id)?.nilYear1).toBe(CFB_GM_PLAYERS[0]!.nilYear1);
  });

  it("auto-fits FLEX and Front Seven without consuming or duplicating a player", () => {
    const players = CFB_GM_PLAYERS.filter((p) => p.schoolId === "alabama");
    const front = players.filter((p) => p.family === "Front Seven");
    expect(front.length).toBeGreaterThanOrEqual(2);
    const roster = cfbGmReflow([
      {playerId: front[0]!.id, slot: "FRONT_7_A", acquired: "draft"},
      {playerId: front[1]!.id, slot: "FRONT_7_A", acquired: "draft"},
    ]);
    expect(roster).not.toBeNull();
    expect(roster!.map((r) => r.slot)).toEqual(["FRONT_7_A","FRONT_7_B"]);
    expect(cfbGmReflow([roster![0]!, roster![0]!])).toBeNull();
  });

  it("weights both Front Seven spots equally at the latest NFL 15% standard", () => {
    const fronts = CFB_GM_PLAYERS.filter((p) => p.family === "Front Seven" && p.currentGrade !== 85);
    const a = fronts[0]!, b = fronts.find((p) => p.currentGrade !== a.currentGrade)!;
    const entry = (playerId: string, slot: "FRONT_7_A" | "FRONT_7_B") =>
      ({playerId, slot, acquired: "draft" as const});
    const aFirst = cfbGmTeamGrade([entry(a.id, "FRONT_7_A"), entry(b.id, "FRONT_7_B")]);
    const bFirst = cfbGmTeamGrade([entry(b.id, "FRONT_7_A"), entry(a.id, "FRONT_7_B")]);
    expect(aFirst).toBe(bFirst);
    expect(aFirst).toBe(Math.round((a.currentGrade + b.currentGrade) * .15 * 10) / 10);
  });

  it("has an affordable seven-round path in both budgets with no unfillable late slots", () => {
    for (const budget of Object.values(CFB_GM_BUDGETS)) {
      let roster: ReturnType<typeof cfbGmPick> = [];
      let previous: string | null = null;
      for (let turn = 0; turn < 7; turn++) {
        const schools = cfbGmEligibleSchools(roster!, budget, 1, previous);
        expect(schools.length).toBeGreaterThan(0);
        const school = schools[0]!;
        const candidates = cfbGmCandidates(school, roster!, budget, 1);
        expect(candidates.length).toBeGreaterThan(0);
        const p = [...candidates].sort((a,b) => a.nilYear1 - b.nilYear1)[0]!;
        roster = cfbGmPick(roster!, p.id, budget, 1);
        expect(roster).not.toBeNull();
        expect(cfbGmSpent(roster!, 1)).toBeLessThanOrEqual(budget);
        previous = school;
      }
      expect(roster).toHaveLength(7);
      expect(cfbGmOpenSlots(roster!)).toHaveLength(0);
      expect(cfbGmTeamGrade(roster!)).toBeGreaterThan(60);
    }
  });

  it("models year-one results, forced departures, portal restrictions and deterministic outcomes", () => {
    let run = cfbGmInitial("fixed-seed-1234567", "POWERHOUSE");
    for(let i=0;i<7;i++) {
      const schools = cfbGmEligibleSchools(run.roster, CFB_GM_BUDGETS[run.budget], 1, run.previousSchool);
      const school = cfbGmSpin(run.seed, i, schools)!;
      const p = cfbGmCandidates(school, run.roster, CFB_GM_BUDGETS[run.budget], 1)[0]!;
      const next = cfbGmPick(run.roster, p.id, CFB_GM_BUDGETS[run.budget], 1)!;
      run = {...run, roster: next, previousSchool: school, spinIndex: i + 1};
    }
    expect(run.roster).toHaveLength(7);
    expect(cfbGmSeason(run,1)).toEqual(cfbGmSeason(run,1));
    run = cfbGmEnterOffseason({...run,phase:"year1"});
    expect(run.phase).toBe("offseason");
    expect(run.finalRoster).toHaveLength(7 - run.departures.length);
    const before = run.finalRoster[0];
    if (before) {
      run = cfbGmPortalOut(run, before.playerId)!;
      expect(run.voluntaryPortalOuts).toHaveLength(1);
      expect(run.finalRoster.some((r) => r.playerId === before.playerId)).toBe(false);
    }
    expect(cfbGmFinalResult(run)).toEqual(cfbGmFinalResult(run));
  });
});

describe("CFB GM UI parity and owner gating", () => {
  const read = (path: string) => readFileSync(path, "utf8");
  const page = read("src/features/back-room/FootballCfbGmPage.tsx");
  const nfl = read("src/features/back-room/FootballGmModePage.tsx");
  const router = read("src/app/router.tsx");
  const landing = read("src/features/back-room/FootballBackRoomPage.tsx");
  it("reuses NFL wheel, headshot, roster, intro, and report components rather than inventing a second visual pattern", () => {
    expect(page).toContain('import { GmFootballWheel, PlayerHeadshot }');
    for (const token of ['football-gm__header','football-gm__intro-stages',
      'football-gm__roster-grid','football-wheel-picker football-gm__picker']) {
      expect(page).toContain(token);
      expect(nfl + read("src/features/back-room/FootballGmFranchiseReport.tsx")).toContain(token);
    }
    // CFB keeps its own two-year CFP/NIL final while NFL now has the approved
    // graphic-first results screen. Shared draft and roster treatments remain.
    expect(page).toContain('football-gm__position-tabs');
    expect(page).toContain('setSelectedPosition');
    expect(page).toContain('football-gm__cfb-budget-modes');
    expect(page).toContain('data-cfb-gm="true"');
    expect(read("src/features/back-room/footballCfbGmEngine.ts")).toContain('FRONT_7_A: "F7-1"')
    const nflReport = read("src/features/back-room/FootballGmFranchiseReport.tsx");
    expect(nflReport).toContain("FootballGmFinalExperience");
    expect(read("src/features/back-room/FootballGmFinalExperience.tsx")).toContain("YOUR FINAL ROSTER");
    for (const token of ["gm-result__summary","gm-result__scores","gm-result__season-comparison",
      "gm-result__roster-card","gm-result__front-office","gm-result__final-roster",
      "gm-result__scoring-card","gm-result__scoring","football-gm-report__evolution-rows",
      "football-gm-report__evolution-row"]) {
      expect(page).toContain(token);
    }
    expect(page).toContain("YOUR TWO-YEAR GM RESULT");
    expect(page).toContain("CFP RÉSUMÉ");
    expect(page).not.toContain("football-gm-report__hero");

  });
  it("gates CFB owner route without changing existing public game library order", () => {
    expect(router).toContain('path: "football/gm-cfb-preview"');
    expect(page).toContain('identity.profile?.canControlPicks !== true');
    expect(landing).toContain('identity.profile?.canControlPicks === true');
    expect(landing).toContain('OWNER PREVIEW');
  });
});
