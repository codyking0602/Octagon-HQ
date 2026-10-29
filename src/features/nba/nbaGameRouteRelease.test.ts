import {describe,expect,it} from "vitest";
import {canAccessNbaCasualRoute,canAccessNbaGames,canPreviewNbaWhoAmI} from "./NbaWhoAmIOwnerGate";
import {NBA_OFFICIAL_GAMES_RELEASE_READY} from "./nbaDailySchedule";

describe("NBA game route public release safety",()=>{
  const owner={displayName:"CODY",canControlPicks:true};
  const member={displayName:"TROY",canControlPicks:false};
  it("retains a segregated owner preview during the transition",()=>{
    expect(canPreviewNbaWhoAmI(owner)).toBe(true);
    expect(canAccessNbaGames(owner,"2026-10-23")).toBe(true);
    expect(canPreviewNbaWhoAmI(member)).toBe(false);
  });
  it("opens only the four Casual modes Oct 29, never the official Daily query",()=>{
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(true);
    expect(canAccessNbaGames(member,"2026-10-29")).toBe(false);
    for(const path of ["/nba/who-am-i","/nba/find-the-leader","/nba/hit-the-number","/nba/higher-lower"]){
      expect(canAccessNbaCasualRoute(path,"","2026-10-28")).toBe(false);
      expect(canAccessNbaCasualRoute(path,"","2026-10-29")).toBe(true);
      expect(canAccessNbaCasualRoute(path,"?mode=daily","2026-10-29")).toBe(false);
    }
    expect(canAccessNbaCasualRoute("/nba/millionaire","","2026-10-29")).toBe(false);
    expect(canAccessNbaCasualRoute("/nba/today","","2026-10-29")).toBe(false);
  });
  it("keeps local preview URLs owner-only after official NBA Daily starts",()=>{
    expect(canAccessNbaGames(member,"2026-10-30")).toBe(false);
    expect(canAccessNbaGames(null,"2026-10-30")).toBe(false);
    expect(canAccessNbaCasualRoute("/nba/millionaire","","2026-10-30")).toBe(false);
    expect(canAccessNbaCasualRoute("/nba/who-am-i","?mode=daily","2026-10-30")).toBe(false);
  });
});
