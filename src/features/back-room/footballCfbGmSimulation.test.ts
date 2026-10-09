import { describe, expect, it } from "vitest";
import { cfbGmSimulateCollegeSeason } from "./footballCfbGmSimulation";
import { CFB_GM_VERSION, cfbGmInitial, cfbGmValidateRun } from "./footballCfbGmEngine";

describe("CFB GM 2026-style 12-team CFP and regular-season simulator", () => {
  it("produces a seeded, deterministic 12-game season and coherent eleven-game single-elimination bracket", () => {
    for (let i = 0; i < 150; i++) {
      const input = ["cfp-seed-"+i, (i%2+1) as 1|2, 77+(i%22)] as const;
      const result = cfbGmSimulateCollegeSeason(...input);
      expect(result).toEqual(cfbGmSimulateCollegeSeason(...input));
      expect(result.wins + result.losses).toBe(12);
      expect(result.games).toHaveLength(11);
      const losers = result.games.map(game => game.loser);
      expect(new Set(losers).size).toBe(11);
      expect(losers).not.toContain(result.games[result.games.length-1]!.winner);
      expect(result.champion).toBeTruthy();
      for (const game of result.games) {
        expect(game.teamA).not.toBe(game.teamB);
        expect([game.teamA, game.teamB]).toContain(game.winner);
        expect([game.teamA, game.teamB]).toContain(game.loser);
        expect(game.winner).not.toBe(game.loser);
      }
      if (result.cfpSeed === null) {
        expect(result.finish).toBe("Missed CFP");
        expect(result.winOdds).toBe(0);
      } else {
        expect(result.cfpSeed).toBeGreaterThanOrEqual(1);
        expect(result.cfpSeed).toBeLessThanOrEqual(12);
        expect(result.finish).not.toBe("Missed CFP");
      }
    }
  });
  it("uses four top-seed byes and the 5/12, 6/11, 7/10, 8/9 first-round lanes", () => {
    const season=cfbGmSimulateCollegeSeason("verified-bracket-2026",1,98);
    const first=season.games.filter(g=>g.round==="First Round");
    expect(first).toHaveLength(4);
    expect(first.map(g=>g.teamA).length).toBe(4);
    const quarters=season.games.filter(g=>g.round==="Quarterfinal");
    expect(quarters).toHaveLength(4);
    expect(season.games.filter(g=>g.round==="Semifinal")).toHaveLength(2);
    expect(season.games.filter(g=>g.round==="National Championship")).toHaveLength(1);
    expect(season.cfpSeed).not.toBeNull();
    if(season.cfpSeed && season.cfpSeed<=4) expect(first.every(g=>g.teamA!=="user"&&g.teamB!=="user")).toBe(true);
  });
  it("rewards stronger cores across many independent game seeds without guaranteed outcomes", () => {
    let strong=0,weak=0,upsets=0;
    for(let i=0;i<100;i++) {
      const seed="strength-audit-"+i;
      const a=cfbGmSimulateCollegeSeason(seed,1,96);
      const b=cfbGmSimulateCollegeSeason(seed,1,82);
      strong+=a.wins;weak+=b.wins;
      if(a.losses>0)upsets++;
    }
    expect(strong).toBeGreaterThan(weak+220);
    expect(upsets).toBeGreaterThan(0);
  });
  it("versions the preview so old saved simulations cannot silently adopt the new college bracket", () => {
    const run=cfbGmInitial("sample-cfb-seed-2026");
    expect(CFB_GM_VERSION).toContain("v9-portal-integrity");
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v8-nfl-parity"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v7-first-party-market"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v2-cfp"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v3-market-development"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v4-official-classes"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v5-extended-year-evidence"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v6-individual-evidence"})).toBeNull();
    expect(cfbGmValidateRun(run)).not.toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v1"})).toBeNull();
  });
});
