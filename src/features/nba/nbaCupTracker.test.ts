import {describe,expect,it} from "vitest";
import {CUP_GROUPS} from "./nbaCup2026";
import {
  CUP_GAMES,CUP_NIGHTS,cupFixtureId,cupGamesForTeam,cupGroupRecords,
  nextCupGame,nextCupNight,type CupScoreFeed,
} from "./nbaCupTracker";
import {parseEspnNbaCupScoreboard,NBA_CUP_2026_DATES} from "../../../worker/nbaCupScoreboard";

const atNov4=Date.parse("2026-11-04T15:00:00Z");
function withFinals():CupScoreFeed{
  return {byGame:{
    [cupFixtureId("2026-10-30","DET","BKN")]:{
      away:"DET",home:"BKN",status:"final",awayScore:110,homeScore:94,detail:"Final",
    },
    [cupFixtureId("2026-10-30","ORL","TOR")]:{
      away:"ORL",home:"TOR",status:"final",awayScore:121,homeScore:114,detail:"Final",
    },
  },failedDates:[],refreshedAt:"2026-11-04T12:00:00Z"};
}
describe("NBA 2026 Cup group-play tracker",()=>{
  it("contains exactly the 60 NBA-official Cup games, four games per team and 10 per group",()=>{
    expect(CUP_NIGHTS).toEqual(["2026-10-30","2026-11-06","2026-11-13","2026-11-20","2026-11-24","2026-11-25","2026-11-27"]);
    expect(CUP_GAMES).toHaveLength(60);
    expect(new Set(CUP_GAMES.map(g=>g.id)).size).toBe(60);
    expect([...NBA_CUP_2026_DATES]).toEqual(CUP_NIGHTS);
    for(const group of CUP_GROUPS){
      const games=CUP_GAMES.filter(g=>g.groupId===group.id);
      expect(games).toHaveLength(10);
      for(const team of group.teams){
        expect(cupGamesForTeam(team)).toHaveLength(4);
        expect(games.filter(g=>g.away===team||g.home===team)).toHaveLength(4);
      }
      const pairs=new Set(games.map(g=>[g.away,g.home].sort().join("-")));
      expect(pairs.size).toBe(10);
    }
    // The authenticated Picks page must never count arbitrary regular season games.
    expect(CUP_GAMES.some(g=>g.date==="2026-11-02")).toBe(false);
    expect(CUP_GAMES.some(g=>g.away==="PHI"&&g.home==="DET"&&g.date==="2026-11-04")).toBe(false);
  });
  it("labels the correct next group game and Cup night",()=>{
    const feed=withFinals();
    expect(nextCupNight(feed,atNov4)).toBe("2026-11-06");
    expect(nextCupGame("DET",feed,atNov4)?.id).toBe("2026-11-20|TOR|DET");
    expect(nextCupGame("PHI",feed,atNov4)?.id).toBe("2026-11-06|PHI|CLE");
  });
  it("derives only provisional group records from finished Cup matchups",()=>{
    const east=cupGroupRecords("EA",withFinals());
    expect(east.map(row=>[row.teamId,row.wins,row.losses,row.differential])).toEqual([
      ["DET",1,0,16],["ORL",1,0,7],["MIL",0,0,0],["TOR",0,1,-7],["BKN",0,1,-16],
    ]);
    expect(cupGroupRecords("EC",withFinals()).every(row=>row.played===0)).toBe(true);
  });
  it("accepts only normalized Eastern-day ESPN results, not nonfinal score placeholders",()=>{
    const parsed=parseEspnNbaCupScoreboard("2026-10-30",{events:[{
      date:"2026-10-30T23:30:00Z",
      status:{type:{completed:true,state:"post",shortDetail:"Final"}},
      competitions:[{competitors:[
        {homeAway:"away",team:{abbreviation:"DET"},score:"110"},
        {homeAway:"home",team:{abbreviation:"BKN"},score:"94"},
      ]}],
    },{
      date:"2026-10-31T23:30:00Z",
      status:{type:{completed:true}},
      competitions:[{competitors:[
        {homeAway:"away",team:{abbreviation:"CHI"},score:"121"},
        {homeAway:"home",team:{abbreviation:"BOS"},score:"125"},
      ]}],
    }]});
    expect(parsed).toEqual([{
      id:"2026-10-30|DET|BKN",home:"BKN",away:"DET",
      status:"final",homeScore:94,awayScore:110,detail:"Final",
    }]);
    expect(parseEspnNbaCupScoreboard("2026-11-04",{events:[]})).toEqual([]);
    expect(parseEspnNbaCupScoreboard("2026-11-13",{events:[{
      date:"2026-11-14T02:30:00Z",
      status:{type:{state:"pre",completed:false,shortDetail:"7:00 PM EST"}},
      competitions:[{competitors:[
        {homeAway:"away",team:{abbreviation:"GS"},score:"0"},
        {homeAway:"home",team:{abbreviation:"SA"},score:"0"},
      ]}],
    }]})).toEqual([{
      id:"2026-11-13|GSW|SAS",home:"SAS",away:"GSW",
      status:"scheduled",homeScore:null,awayScore:null,detail:"7:00 PM EST",
    }]);
  });
});
