import { describe, expect, it } from "vitest";
import { whyNotProfileCopy } from "./FighterProfilePage";
import { getFighter } from "./rankingModel";

describe("fighter profile limiting copy", () => {
  it("uses the canonical presentation copy for the board leader", () => {
    const fighter = getFighter("jon-jones");

    expect(fighter).toBeDefined();
    expect(whyNotProfileCopy(fighter!)).toBe(fighter!.whyNotHigher);
    expect(whyNotProfileCopy(fighter!)).not.toContain(
      "He cannot rank higher. The argument against a runaway #1 case",
    );
  });
});
