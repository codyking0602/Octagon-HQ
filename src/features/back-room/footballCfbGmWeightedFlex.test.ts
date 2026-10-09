import { describe, expect, it } from "vitest";
import {
  CFB_GM_PLAYERS, cfbGmReflow, cfbGmTeamGrade, cfbGmEffectiveGrade,
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
  it("reassigns Year 2 WR/FLEX using developed 2027 ability rather than 2026 grade or pick order", () => {
    const receivers = CFB_GM_PLAYERS.filter(player => player.family === "WR"
      && player.eligibleSlots.includes("WR") && player.eligibleSlots.includes("FLEX"));
    let crossed: [string, string, string] | null = null;
    for (let n = 0; n < 40 && !crossed; n++) {
      const seed = "cfb-year2-flex-role-" + n;
      for (const first of receivers) {
        const after = cfbGmEffectiveGrade(first, 2, seed);
        const second = receivers.find(other => other.id !== first.id && other.currentGrade === first.currentGrade
          && cfbGmEffectiveGrade(other, 2, seed) > after);
        if (second) { crossed = [first.id, second.id, seed]; break; }
      }
    }
    expect(crossed).not.toBeNull();
    const [first, second, seed] = crossed!;
    const input = [
      { slot: "WR" as const, playerId: first, acquired: "draft" as const },
      { slot: "FLEX" as const, playerId: second, acquired: "draft" as const },
    ];
    const fitted = cfbGmReflow(input, 2, seed)!;
    expect(fitted.find(row => row.slot === "WR")?.playerId).toBe(second);
    expect(fitted.find(row => row.slot === "FLEX")?.playerId).toBe(first);
    // The internal contribution must improve even when 0.1-point UI rounding ties.
    const before = (cfbGmEffectiveGrade(CFB_GM_PLAYERS.find(p=>p.id===first)!, 2, seed)-80)*.14
      + (cfbGmEffectiveGrade(CFB_GM_PLAYERS.find(p=>p.id===second)!, 2, seed)-80)*.08*1.05;
    const after = (cfbGmEffectiveGrade(CFB_GM_PLAYERS.find(p=>p.id===second)!, 2, seed)-80)*.14
      + (cfbGmEffectiveGrade(CFB_GM_PLAYERS.find(p=>p.id===first)!, 2, seed)-80)*.08*1.05;
    expect(after).toBeGreaterThan(before);
    expect(cfbGmTeamGrade(fitted, 2, seed)).toBeGreaterThanOrEqual(cfbGmTeamGrade(input, 2, seed));
  });

});
