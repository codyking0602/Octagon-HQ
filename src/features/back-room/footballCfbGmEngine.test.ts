import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { wheelFootballPoolTeams } from "./wheelFootballModel";
import {
  CFB_GM_AP_SCHOOLS, CFB_GM_BUDGETS, CFB_GM_PLAYERS, CFB_GM_ROSTER_SLOTS, CFB_GM_POSITION_WEIGHTS, cfbGmDepartureRisk, cfbGmEligibleIn2027, cfbGmPortalAvailable, cfbGmExitSignal,
  cfbGmCandidates, cfbGmEligibleSchools, cfbGmEnterOffseason, cfbGmFinalResult,
  cfbGmInitial, cfbGmOpenSlots, cfbGmPick, cfbGmPlayer, cfbGmPortalOut,
  cfbGmReflow, cfbGmSeason, cfbGmSpent, cfbGmSpin, cfbGmTeamGrade, cfbGmTeamOverall, cfbGmRoleFit,
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

  it("weights both Front Seven spots equally at the current NFL 14% baseline", () => {
    const fronts = CFB_GM_PLAYERS.filter((p) => p.family === "Front Seven" && p.currentGrade !== 85);
    const a = fronts[0]!, b = fronts.find((p) => p.currentGrade !== a.currentGrade)!;
    const entry = (playerId: string, slot: "FRONT_7_A" | "FRONT_7_B") =>
      ({playerId, slot, acquired: "draft" as const});
    const aFirst = cfbGmTeamGrade([entry(a.id, "FRONT_7_A"), entry(b.id, "FRONT_7_B")]);
    const bFirst = cfbGmTeamGrade([entry(b.id, "FRONT_7_A"), entry(a.id, "FRONT_7_B")]);
    expect(aFirst).toBe(bFirst);
    expect(CFB_GM_POSITION_WEIGHTS).toEqual({ QB:.28, RB:.08, WR:.14, FLEX:.08, FRONT_7_A:.14, FRONT_7_B:.14, SECONDARY:.14 });
    expect(aFirst).toBe(Math.round((80 + (a.currentGrade - 80 + b.currentGrade - 80) * .14) * 10) / 10);
  });

  it("uses a College-calibrated team overall scale, not NFL anchors",()=>{
    expect(cfbGmTeamOverall(72)).toBe(60);
    expect(cfbGmTeamOverall(80)).toBe(74);
    expect(cfbGmTeamOverall(88)).toBe(90);
    expect(cfbGmTeamOverall(92)).toBe(97);
    expect(cfbGmTeamOverall(98)).toBe(99);
    let last=0;
    for(let grade=65;grade<=99;grade+=.25) {
      const ovr=cfbGmTeamOverall(grade);
      expect(ovr).toBeGreaterThanOrEqual(last);
      last=ovr;
    }
  });
  it("assigns each of 468 athletes only to their documented family slots",()=>{
    for(const player of CFB_GM_PLAYERS) {
      const all=CFB_GM_ROSTER_SLOTS.map(slot=>({slot,fit:cfbGmRoleFit(player,slot)}));
      expect(all.filter(x=>x.fit.eligible).map(x=>x.slot).sort(),player.id)
        .toEqual([...player.eligibleSlots].sort());
      for(const role of all) {
        if(!role.fit.eligible)expect(role.fit.label).toBe("INVALID ROLE");
        if(role.slot==="FLEX"&&role.fit.eligible) {
          expect(["RB","WR","TE"],player.id).toContain(player.family);
          expect(role.fit.label).toBe("FLEX FIT");
        }
      }
      if(["Front Seven","Secondary"].includes(player.family)) {
        expect(player.eligibleSlots).not.toContain("FLEX");
      }
    }
  });
  it("scouts all 468 individual profiles and combines departures, class and portal risks honestly", () => {
    expect(CFB_GM_PLAYERS).toHaveLength(468);
    for (const p of CFB_GM_PLAYERS) {
      expect(["HIGH UPSIDE", "RISING", "STEADY", "BOOM/BUST", "DECLINE RISK"]).toContain(p.outlook);
      expect(cfbGmDepartureRisk(p.id,p.currentGrade,p.classification)).toBe(p.departureRisk);
      expect(["LOW","MEDIUM","HIGH"]).toContain(p.departureRisk);
    }
    // A known final-year classification is not presented as low NFL-only draft risk.
    const eighth = CFB_GM_PLAYERS.find(p=>p.classification==="8TH");
    expect(eighth).toBeDefined();
    expect(eighth!.departureRisk).toBe("HIGH");
  });

  it("never recruits a player with exhausted 2027 eligibility or unverified senior extension", () => {
    const player = cfbGmPlayer("tennessee|amarecampbell")!;
    expect(player.classification).toBe("SR");
    expect(cfbGmEligibleIn2027(player.id, player.classification)).toBe(false);
    expect(cfbGmExitSignal(player).label).toBe("FINAL YEAR");
    expect(cfbGmPortalAvailable(player, "portal-integrity-123")).toBe(false);
    expect(CFB_GM_PLAYERS.some(p => cfbGmEligibleIn2027(p.id,p.classification))).toBe(true);
    const seed = "portal-integrity-123";
    const available = CFB_GM_PLAYERS.filter(p=>cfbGmPortalAvailable(p,seed));
    expect(available.length).toBeGreaterThan(45);
    expect(available.length).toBeLessThan(CFB_GM_PLAYERS.length / 2);
    for (const p of available) expect(cfbGmEligibleIn2027(p.id,p.classification),p.id).toBe(true);
    const next = CFB_GM_PLAYERS.filter(p=>cfbGmPortalAvailable(p,"portal-integrity-456"));
    expect(available.map(p=>p.id)).not.toEqual(next.map(p=>p.id));
    // Year 2 must use the same seeded marketplace in both the school wheel and
    // the final pick validator; a direct pick cannot bypass it.
    const eligible = cfbGmEligibleSchools([], CFB_GM_BUDGETS.POWERHOUSE, 2, null, CFB_GM_AP_SCHOOLS, new Set(), seed);
    for (const school of eligible) for (const candidate of cfbGmCandidates(school,[],CFB_GM_BUDGETS.POWERHOUSE,2,true,new Set(),seed)) {
      expect(cfbGmPortalAvailable(candidate,seed),candidate.id).toBe(true);
      expect(cfbGmPick([],candidate.id,CFB_GM_BUDGETS.POWERHOUSE,2,new Set(),seed)).not.toBeNull();
    }
  });

  it("provides 2027 budget depth in every required slot despite seeded market opt-ins", () => {
    for (const mode of ["POWERHOUSE","BUILDER"] as const) for (let i=0;i<25;i++) {
      const seed = "portal-depth-"+mode+"-"+i;
      const candidates = CFB_GM_PLAYERS.filter(p=>cfbGmPortalAvailable(p,seed));
      for(const slot of CFB_GM_ROSTER_SLOTS) {
        const options=candidates.filter(p=>p.eligibleSlots.includes(slot));
        expect(options.length,seed+" "+slot).toBeGreaterThanOrEqual(5);
        expect(options.some(p=>p.nilYear2<CFB_GM_BUDGETS[mode]/4)).toBe(true);
      }
    }
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
    // CFB now shares the locked NFL graphic final composition, with its own
    // two-year results, NIL money, and transfer-portal descriptions.
    expect(page).toContain('football-gm__position-tabs');
    expect(page).toContain('setSelectedPosition');
    expect(page).toContain('football-gm__cfb-budget-modes');
    expect(page).toContain('data-cfb-gm="true"');
    expect(read("src/features/back-room/footballCfbGmEngine.ts")).toContain('FRONT_7_A: "F7-1"');
    const nflFinal = read("src/features/back-room/FootballGmFinalExperience.tsx");
    expect(nflFinal).toContain("YOUR FINAL ROSTER");
    for (const token of ["football-gm-final gm-final","gm-final__hero","gm-final__hero-main",
      "gm-final__stats","gm-final__seasons","gm-final__highlights","gm-final__roster-list",
      "gm-final__band-track","gm-final__band-start","gm-final__transactions",
      "gm-final__disclosure","gm-final__math","gm-final__money"]) {
      expect(page).toContain(token);
      expect(nflFinal).toContain(token);
    }
    expect(page).toContain('style={{left: "50%"}}');
    expect(page).toContain("COLLEGE DEPARTURES");
    expect(page).toContain("TWO-YEAR RESULTS");
    expect(page).toContain("CFP RÉSUMÉ");
    expect(page).not.toContain("gm-result__summary");

  });
  it("preserves CFB GM implementation while closing its route and removing its Play tile", () => {
    expect(router).toContain('path: "football/gm-cfb-preview", element: <Navigate to="/football" replace />');
    expect(page).toContain('identity.profile?.canControlPicks !== true');
    expect(landing).toContain('<PlayV2Page sport="football" />');
    expect(landing).not.toContain("OWNER PREVIEW");
  });
});
