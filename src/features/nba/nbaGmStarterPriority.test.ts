import { describe,expect,it } from "vitest";
import { nbaGmDevAssignRoster,type NbaGmDevPlayer } from "./nbaGmDevModel";
const mk=(id:string,grade:number,positions:Array<"PG"|"SG"|"SF"|"PF"|"C">)=>
  ({id,currentGrade:grade,positions} as unknown as NbaGmDevPlayer);
describe("NBA GM owner run: do not bench an elite center",()=>{
  it("automatically starts Jokic at C over Bona while preserving seven legal slots",()=>{
    const roster=[
      mk("Rui",78,["PF","SF"]),mk("Jokic",98,["C"]),
      mk("Mobley",89,["PF","C"]),mk("Booker",91,["SG","PG"]),
      mk("Gillespie",78,["PG"]),mk("Giddey",82,["PG","SG"]),
      mk("Bona",74,["C"]),
    ];
    const picks=nbaGmDevAssignRoster(roster.map(x=>x.id),roster)!;
    expect(picks).toHaveLength(7);
    expect(picks.find(p=>p.playerId==="Jokic")?.slot).toBe("C");
    expect(picks.find(p=>p.playerId==="Bona")?.slot).toBe("BIG");
    expect(new Set(picks.map(p=>p.slot)).size).toBe(7);
  });
});
