import {describe,expect,it} from "vitest";
import {buildSportsFeudPack,buildUfcFeudV2DailyPack,UFC_FEUD_V2_DAILY_CUTOVER_DAY} from "./sportsFeudDailyBanks";
import {ufcFeudAppearanceDatesInWindow,ufcFeudSixMonthReleaseReadiness} from "./ufcSportsFeudV2EditorialReleaseGate";
import {lockedWeightedGameForDay} from "./dailyChallengeRotation";

describe("future-only UFC Feud V2 Daily cutover and historical immutability",()=>{
  it("keeps every earlier published UFC Feud pack byte-for-byte unchanged",()=>{
    for(const day of ["2026-09-24","2026-10-10","2026-10-12"]){
      expect(buildUfcFeudV2DailyPack(day)).toEqual(buildSportsFeudPack("ufc",day));
    }
  });
  it("anchors first future appearance to the actual weighted UFC calendar",()=>{
    expect(UFC_FEUD_V2_DAILY_CUTOVER_DAY).toBe("2026-11-04");
    expect(lockedWeightedGameForDay("ufc",UFC_FEUD_V2_DAILY_CUTOVER_DAY)).toBe("sports_feud");
    const dates=ufcFeudAppearanceDatesInWindow("2026-10-24","2027-04-24");
    expect(dates).toHaveLength(24);
    expect(dates[0]).toBe(UFC_FEUD_V2_DAILY_CUTOVER_DAY);
    expect(dates[1]).toBe("2026-11-06");
    expect(dates[23]).toMatch(/^2027-/);
  });
  it("publishes a fully scored V2 pack only with 168 explicitly certified disjoint topics",()=>{
    const readiness=ufcFeudSixMonthReleaseReadiness();
    if(!readiness.ready){
      expect(buildUfcFeudV2DailyPack("2026-11-04")).toEqual(buildSportsFeudPack("ufc","2026-11-04"));
    }else{
      const pack=buildUfcFeudV2DailyPack("2026-11-04");
      expect(pack.id).toContain("sports-feud-v2-ufc-2026-11-04");
      expect(pack.mainBoards).toHaveLength(2);
      expect(pack.fastMoney).toHaveLength(5);
    }
  });
});
