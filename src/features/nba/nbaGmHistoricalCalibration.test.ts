import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Historical source cohort: NOT an empirical player-skill or chemistry model. */
interface TeamSeason { year:number; team:string; wins:number; losses:number; offense:number; defense:number; net:number }
const input=readFileSync("docs/nba-gm-150-team-season-efficiency-2022-2026.csv","utf8");
const lines=input.trim().split(/\r?\n/);
const rows:TeamSeason[]=lines.slice(1).map((line,index)=>{
  const cells=line.split(",");
  if(cells.length!==7)throw Error(`Malformed NBA history row ${index+2}`);
  const [year,team,wins,losses,offense,defense,net]=cells;
  return {year:Number(year),team,wins:Number(wins),losses:Number(losses),
    offense:Number(offense),defense:Number(defense),net:Number(net)};
});
const mean=(values:number[])=>values.reduce((sum,value)=>sum+value,0)/values.length;
const rmse=(actual:number[],predicted:number[])=>
  Math.sqrt(mean(actual.map((value,index)=>(value-predicted[index]!)**2)));
function fitNetToWins(train:TeamSeason[]){
  const mx=mean(train.map(row=>row.net)),my=mean(train.map(row=>row.wins));
  const covariance=train.reduce((sum,row)=>sum+(row.net-mx)*(row.wins-my),0);
  const variance=train.reduce((sum,row)=>sum+(row.net-mx)**2,0);
  const slope=covariance/variance;
  return {slope,intercept:my-slope*mx};
}
describe("NBA GM 150-team-season research integrity",()=>{
  it("preserves all 30 teams in all five seasons, 82 games and zero record duplication",()=>{
    expect(lines[0]).toBe("seasonEnd,teamCode,wins,losses,unadjustedOffensiveRating,unadjustedDefensiveRating,computedNetRating");
    expect(rows).toHaveLength(150);
    const teams=new Set(rows.filter(row=>row.year===2022).map(row=>row.team));
    expect(teams.size).toBe(30);
    for(const year of [2022,2023,2024,2025,2026]){
      const season=rows.filter(row=>row.year===year);
      expect(season).toHaveLength(30);
      expect(new Set(season.map(row=>row.team))).toEqual(teams);
      expect(season.reduce((sum,row)=>sum+row.wins,0)).toBe(1230);
      expect(season.reduce((sum,row)=>sum+row.losses,0)).toBe(1230);
      for(const row of season){
        expect(row.wins+row.losses).toBe(82);
        expect(Number.isFinite(row.net)).toBe(true);
        expect(Math.abs(row.net-(row.offense-row.defense))).toBeLessThan(0.011);
      }
    }
  });
  it("documents actual champion regular-season performance without tying championships to a win threshold",()=>{
    const champs:[[number,string,number,number]]|Array<[number,string,number,number]>=[
      [2022,"GSW",53,5.63],[2023,"DEN",53,3.30],[2024,"BOS",64,11.62],
      [2025,"OKC",68,12.72],[2026,"NYK",53,6.47],
    ];
    for(const [year,team,wins,net] of champs){
      const row=rows.find(value=>value.year===year&&value.team===team);
      expect(row?.wins).toBe(wins);
      expect(row?.net).toBeCloseTo(net,2);
    }
  });
  it("walk-forward net-to-wins benchmark holds out 2025-26 with no future-season leakage",()=>{
    const train=rows.filter(row=>row.year<2026),holdout=rows.filter(row=>row.year===2026);
    const {slope,intercept}=fitNetToWins(train);
    expect(train).toHaveLength(120);
    expect(holdout).toHaveLength(30);
    expect(slope).toBeCloseTo(2.2684,3);
    expect(intercept).toBeCloseTo(40.9983,3);
    const measured=rmse(holdout.map(row=>row.wins),holdout.map(row=>intercept+slope*row.net));
    const leagueBaseline=rmse(holdout.map(row=>row.wins),holdout.map(()=>41));
    expect(measured).toBeGreaterThan(3.3);
    expect(measured).toBeLessThan(3.4);
    expect(leagueBaseline).toBeGreaterThan(13.6);
    expect(measured).toBeLessThan(leagueBaseline);
    // This validates only win conversion conditional on observed net rating,
    // not forward predictions from the 330-player 2026 scouting board.
  });
});
