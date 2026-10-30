import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_ROSTER_SLOTS, NBA_GM_TEAM_CODES } from "./nbaGmFoundation";
import {
  nbaGmDevAssignRoster, nbaGmDevCanAdd, nbaGmDevSpend,
  type NbaGmDevPlayer,
} from "./nbaGmDevModel";

const raw=JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")) as {
  players:Array<{editorialId:string;name:string;teamCode:string;candidatePositions:string[];
    overall:number;skills:NbaGmDevPlayer["skills"]}>;
};
const board:NbaGmDevPlayer[]=raw.players.map(player=>{
  const price=Math.round((2_500_000+58_000_000*Math.pow(Math.max(0,player.overall-73)/26,1.8))/100_000)*100_000;
  const fixtureTerm=["0","1","2","3","4","5"].includes(
    createHash("md5").update(player.editorialId).digest("hex").slice(-1))?"1YR":"3YR";
  return {
    id:player.editorialId,name:player.name,teamCode:player.teamCode as NbaGmDevPlayer["teamCode"],
    positions:player.candidatePositions as NbaGmDevPlayer["positions"],
    currentGrade:player.overall,skills:player.skills,gameContract:fixtureTerm,
    salaries:[price,Math.round(price*1.05/100_000)*100_000,Math.round(price*1.1/100_000)*100_000],
    pricingKind:"GAME_FIXTURE_NOT_REAL_CONTRACT",eligibilityKind:"PROVISIONAL_EDITORIAL",
    officialNbaPlayerId:null,officialRosterPosition:"F",positionReview:"unverified",
    reviewFlags:["private-fixture"],
  };
});
const cap=[192_500_000,192_500_000,192_500_000] as const;

describe("NBA GM draft completion from authentic 330-player eligibility bank",()=>{
  it("contains both guard-qualified wings and big-qualified forwards without treating pure SF as either",()=>{
    expect(board.filter(p=>p.positions.includes("SF")&&p.positions.includes("SG")).length).toBeGreaterThan(5);
    expect(board.filter(p=>p.positions.includes("SF")&&p.positions.includes("PF")).length).toBeGreaterThan(5);
    expect(board.filter(p=>p.positions.length===1&&p.positions[0]==="SF").length).toBeGreaterThan(30);
  });
  it("retains a legal, affordable seven-man completion across varied team-wheel and choice policies",()=>{
    // Seeded diversity: some drafts chase stars, others save cap or mix by slot.
    // The wheel only offers a team if at least one legal player exists.
    const policies=["top","cheap","mid","versatile"] as const;
    for(let seed=0;seed<12;seed++){
      let picks:ReturnType<typeof nbaGmDevAssignRoster>=[];
      for(let round=0;round<7;round++){
        const eligible=board.filter(p=>nbaGmDevCanAdd(picks!,p,board,cap));
        expect(eligible.length).toBeGreaterThan(0);
        const teams=NBA_GM_TEAM_CODES.filter(code=>eligible.some(p=>p.teamCode===code));
        expect(teams.length).toBeGreaterThan(0);
        const chosenTeam=teams[(seed*13+round*17+seed*round)%teams.length]!;
        const options=eligible.filter(p=>p.teamCode===chosenTeam);
        const policy=policies[seed%policies.length]!;
        options.sort((a,b)=>policy==="top"?b.currentGrade-a.currentGrade
          :policy==="cheap"?a.salaries[0]-b.salaries[0]
          :policy==="versatile"?b.positions.length-a.positions.length||b.currentGrade-a.currentGrade
          :Math.abs(a.currentGrade-85)-Math.abs(b.currentGrade-85));
        const chosen=options[(seed+round)%Math.min(options.length,3)]!;
        picks=nbaGmDevAssignRoster([...picks!.map(x=>x.playerId),chosen.id],board);
        expect(picks).not.toBeNull();
        expect(picks).toHaveLength(round+1);
      }
      expect(new Set(picks!.map(p=>p.slot))).toEqual(new Set(NBA_GM_ROSTER_SLOTS));
      expect(new Set(picks!.map(p=>p.playerId)).size).toBe(7);
      const spent=nbaGmDevSpend(picks!,board);
      for(let year=0;year<3;year++)expect(spent[year]).toBeLessThanOrEqual(cap[year]);
    }
  });
});
