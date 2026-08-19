import { describe, expect, it } from "vitest";
import { compactHitTheNumberDivisions } from "./HitTheNumberGameView";

describe("Hit the Number fighter division labels", () => {
  it("uses compact UFC abbreviations so multi-division eligibility stays readable", () => {
    expect(compactHitTheNumberDivisions(["Light Heavyweight", "Heavyweight"])).toBe("LHW · HW");
    expect(compactHitTheNumberDivisions(["Featherweight", "Lightweight"])).toBe("FW · LW");
    expect(compactHitTheNumberDivisions(["Openweight", "Welterweight"])).toBe("OW · WW");
    expect(compactHitTheNumberDivisions(["Women's Flyweight", "Women's Bantamweight"])).toBe("WFLW · WBW");
  });
});
