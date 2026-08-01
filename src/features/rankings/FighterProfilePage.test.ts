import { describe, expect, it } from "vitest";
import FighterProfilePage, { whyNotProfileCopy } from "./FighterProfilePage";
import { getFighter } from "./rankingModel";

void FighterProfilePage;

const approvedJonJonesLimitingCase =
  "The case against greater separation rests on three things: disputed decisions against Alexander Gustafsson, Thiago Santos, and Dominick Reyes; long absences that repeatedly interrupted his championship years; and a heavyweight resume built on only two wins. Suspensions, stripped titles, and stalled activity kept him from producing an even cleaner reign. Those flaws narrow the gap, but no rival owns the stronger UFC resume.";

describe("fighter profile limiting copy", () => {
  it("uses Jon Jones's canonical approved copy in the Why Not Lower card", () => {
    const jonJones = getFighter("jon-jones");

    expect(jonJones).toBeDefined();
    expect(jonJones?.whyNotHigher).toBe(approvedJonJonesLimitingCase);
    expect(whyNotProfileCopy(jonJones!)).toBe(approvedJonJonesLimitingCase);
  });

  it("keeps the existing canonical limiting copy for fighters below the top spot", () => {
    const georgesStPierre = getFighter("georges-st-pierre");

    expect(georgesStPierre).toBeDefined();
    expect(whyNotProfileCopy(georgesStPierre!)).toBe(
      georgesStPierre?.whyNotHigher,
    );
  });
});
