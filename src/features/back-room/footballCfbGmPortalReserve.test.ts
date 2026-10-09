import { describe, expect, it } from "vitest";
import {
  CFB_GM_BUDGETS, cfbGmCandidates, cfbGmEligibleSchools,
  cfbGmOpenSlots, cfbGmPick, cfbGmSpent, cfbGmSpin,
  type CfbGmRosterEntry,
} from "./footballCfbGmEngine";

describe("College GM honest late-round roster and NIL cap reserves", () => {
  it("never offers a final-three-slot pick that strands the remaining positions in Powerhouse or Builder", () => {
    for (const mode of ["POWERHOUSE", "BUILDER"] as const) {
      const budget = CFB_GM_BUDGETS[mode];
      for (let seedIndex = 0; seedIndex < 8; seedIndex++) {
        const seed = "reserve-audit-" + mode + "-" + seedIndex;
        let roster: CfbGmRosterEntry[] = [];
        let previous: string | null = null;
        // Use varied but financially sensible opening picks to obtain four
        // filled positions, leaving the most collision-prone final three.
        for (let turn = 0; turn < 4; turn++) {
          const schools = cfbGmEligibleSchools(roster, budget, 1, previous);
          expect(schools.length).toBeGreaterThan(0);
          const school = cfbGmSpin(seed, turn, schools)!;
          const candidates = cfbGmCandidates(school, roster, budget, 1);
          const affordable = [...candidates].sort((a, b) => a.nilYear1-b.nilYear1);
          const player = affordable[Math.min(seedIndex%3, affordable.length-1)]!;
          roster = cfbGmPick(roster, player.id, budget, 1)!;
          expect(roster).not.toBeNull();
          previous = school;
        }
        expect(cfbGmOpenSlots(roster)).toHaveLength(3);
        // Every candidate presented at this point must preserve a legal
        // distinct-player two-slot finish without exceeding the same budget.
        const schools = cfbGmEligibleSchools(roster, budget, 1, previous);
        for (const school of schools.slice(0, 3)) {
          const options = cfbGmCandidates(school, roster, budget, 1);
          for (const option of options.slice(0, 8)) {
            const five = cfbGmPick(roster, option.id, budget, 1)!;
            expect(five).not.toBeNull();
            const sixthSchools = cfbGmEligibleSchools(five, budget, 1, school);
            expect(sixthSchools.length, option.id + " should have a sixth pick").toBeGreaterThan(0);
            const sixth = cfbGmCandidates(sixthSchools[0]!, five, budget, 1)[0]!;
            const six = cfbGmPick(five, sixth.id, budget, 1)!;
            expect(six).not.toBeNull();
            const finalSchools = cfbGmEligibleSchools(six, budget, 1, sixthSchools[0]!);
            expect(finalSchools.length, option.id + " should have a seventh pick").toBeGreaterThan(0);
            const final = cfbGmCandidates(finalSchools[0]!, six, budget, 1)[0]!;
            const seven = cfbGmPick(six, final.id, budget, 1)!;
            expect(seven).toHaveLength(7);
            expect(cfbGmOpenSlots(seven!)).toHaveLength(0);
            expect(cfbGmSpent(seven!, 1)).toBeLessThanOrEqual(budget);
          }
        }
      }
    }
  });
});
