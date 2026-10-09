import { describe, expect, it } from "vitest";
import {
  CFB_GM_PLAYERS, cfbGmReflow, cfbGmTeamGrade,
} from "./footballCfbGmEngine";

describe("College GM auto-fitting respects weighted slot value", () => {
  it("always assigns the stronger wide receiver to the higher-weight WR spot, even if picked later", () => {
    const receivers = CFB_GM_PLAYERS.filter(player => player.family === "WR"
      && player.eligibleSlots.includes("WR") && player.eligibleSlots.includes("FLEX"));
    const strong = [...receivers].sort((a,b) => b.currentGrade - a.currentGrade)[0]!;
    const weaker = receivers.find(player => player.currentGrade < strong.currentGrade)!;
    expect(strong).toBeDefined();
    expect(weaker).toBeDefined();
    const a = {slot:"FLEX" as const, playerId:strong.id, acquired:"draft" as const};
    const b = {slot:"WR" as const, playerId:weaker.id, acquired:"draft" as const};
    const direct = cfbGmReflow([a,b])!;
    const reverse = cfbGmReflow([b,a])!;
    expect(direct).toHaveLength(2);
    for (const chosen of [direct,reverse]) {
      expect(chosen.find(entry=>entry.slot==="WR")?.playerId).toBe(strong.id);
      expect(chosen.find(entry=>entry.slot==="FLEX")?.playerId).toBe(weaker.id);
    }
    expect(cfbGmTeamGrade(direct)).toBe(cfbGmTeamGrade(reverse));
    const expected = 80+(strong.currentGrade-80)*.14+(weaker.currentGrade-80)*.08*1.05;
    expect(cfbGmTeamGrade(direct)).toBe(Math.round(expected*10)/10);
    expect(cfbGmTeamGrade(direct)).toBeGreaterThan(cfbGmTeamGrade([a,b]));
  });

  it("rejects repeated athletes rather than boosting a core through duplicate slot identities", () => {
    const receiver=CFB_GM_PLAYERS.find(p=>p.family==="WR"&&p.eligibleSlots.includes("FLEX"))!;
    expect(cfbGmReflow([
      {slot:"WR",playerId:receiver.id,acquired:"draft"},
      {slot:"FLEX",playerId:receiver.id,acquired:"draft"},
    ])).toBeNull();
  });
});
