import {describe,expect,it} from "vitest";
import {buildSportsFeudPack,buildUfcFeudV2DailyPack,UFC_FEUD_V2_DAILY_CUTOVER_DAY} from "./sportsFeudDailyBanks";
import {ufcFeudAppearanceDatesInWindow,ufcFeudSixMonthReleaseReadiness} from "./ufcSportsFeudV2EditorialReleaseGate";
import {isUfcPublicationDay,lockedWeightedGameForDay} from "./dailyChallengeRotation";

describe("future-only UFC Feud V2 Daily cutover and historical immutability",()=>{
  it("keeps every earlier published UFC Feud pack byte-for-byte unchanged",()=>{
    for(const day of ["2026-09-24","2026-10-10","2026-10-12"]){
      expect(buildUfcFeudV2DailyPack(day)).toEqual(buildSportsFeudPack("ufc",day));
    }
  });
  it("anchors first future appearance to the actual weighted UFC calendar",()=>{
    expect(UFC_FEUD_V2_DAILY_CUTOVER_DAY).toBe("2026-11-04");
    expect(isUfcPublicationDay(UFC_FEUD_V2_DAILY_CUTOVER_DAY)).toBe(true);
    expect(lockedWeightedGameForDay("ufc","2026-11-10")).toBe("sports_feud");
    const dates=ufcFeudAppearanceDatesInWindow("2026-10-24","2027-04-24");
    expect(dates).toHaveLength(13);
    expect(dates[0]).toBe("2026-10-27");
    expect(dates[1]).toBe("2026-11-10");
    expect(dates[12]).toBe("2027-04-13");
  });
  it("publishes a fully scored V2 pack only with 168 explicitly certified disjoint topics",()=>{
    const readiness=ufcFeudSixMonthReleaseReadiness();
    if(!readiness.ready){
      expect(buildUfcFeudV2DailyPack("2026-11-10")).toEqual(buildSportsFeudPack("ufc","2026-11-10"));
    }else{
      const pack=buildUfcFeudV2DailyPack("2026-11-10");
      expect(pack.id).toContain("sports-feud-v2-ufc-2026-11-10");
      expect(pack.mainBoards).toHaveLength(2);
      expect(pack.fastMoney).toHaveLength(5);
    }
  });
});
