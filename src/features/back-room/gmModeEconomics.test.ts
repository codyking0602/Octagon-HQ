import { describe, expect, it } from "vitest";
import {
  gmModeContractTermForFreeAgencyYear,
  gmModeSalaryFitsCap,
  gmModeThreeYearSalaryWindow,
  projectGmModeExtensionApy,
  roundGmModeSalary,
} from "./gmModeEconomics";

describe("GM Mode economics", () => {
  it("collapses every expiring-window contract to the locked 1YR/3YR model", () => {
    expect(gmModeContractTermForFreeAgencyYear(2027)).toBe("1YR");
    expect(gmModeContractTermForFreeAgencyYear(2028)).toBe("1YR");
    expect(gmModeContractTermForFreeAgencyYear(2029)).toBe("3YR");
    expect(gmModeContractTermForFreeAgencyYear(2032)).toBe("3YR");
  });

  it("keeps 3YR salary fixed and reprices 1YR salary once for years two and three", () => {
    expect(gmModeThreeYearSalaryWindow({
      currentApy: 5.26,
      term: "3YR",
      projectedExtensionApy: 30,
    })).toEqual([5.5, 5.5, 5.5]);

    expect(gmModeThreeYearSalaryWindow({
      currentApy: 5.26,
      term: "1YR",
      projectedExtensionApy: 30.24,
    })).toEqual([5.5, 30, 30]);
  });

  it("makes higher projected ability more expensive at every GM position", () => {
    for (const position of ["QB", "RB", "WR", "TE", "DL", "LB", "DB"] as const) {
      const low = projectGmModeExtensionApy({ position, projectedGrade: 80, ageAtExtension: 26 });
      const good = projectGmModeExtensionApy({ position, projectedGrade: 90, ageAtExtension: 26 });
      const elite = projectGmModeExtensionApy({ position, projectedGrade: 99, ageAtExtension: 26 });
      expect(low).toBeLessThan(good);
      expect(good).toBeLessThan(elite);
    }
  });

  it("keeps positional markets materially different", () => {
    const qb = projectGmModeExtensionApy({ position: "QB", projectedGrade: 95, ageAtExtension: 27 });
    const wr = projectGmModeExtensionApy({ position: "WR", projectedGrade: 95, ageAtExtension: 27 });
    const rb = projectGmModeExtensionApy({ position: "RB", projectedGrade: 95, ageAtExtension: 27 });
    expect(qb).toBeGreaterThan(wr);
    expect(wr).toBeGreaterThan(rb);
  });

  it("discounts older players without overriding the projected football grade", () => {
    const prime = projectGmModeExtensionApy({ position: "RB", projectedGrade: 94, ageAtExtension: 25 });
    const older = projectGmModeExtensionApy({ position: "RB", projectedGrade: 94, ageAtExtension: 30 });
    expect(older).toBeLessThan(prime);

    const primeWr = projectGmModeExtensionApy({ position: "WR", projectedGrade: 94, ageAtExtension: 27 });
    const olderWr = projectGmModeExtensionApy({ position: "WR", projectedGrade: 94, ageAtExtension: 32 });
    expect(olderWr).toBeLessThan(primeWr);
  });

  it("rounds visible salaries to clean half-million increments", () => {
    expect(roundGmModeSalary(17.24)).toBe(17);
    expect(roundGmModeSalary(17.25)).toBe(17.5);
    expect(roundGmModeSalary(17.74)).toBe(17.5);
    expect(roundGmModeSalary(17.75)).toBe(18);
  });

  it("requires every modeled year to fit the cap", () => {
    expect(gmModeSalaryFitsCap([150, 155, 154], 155)).toBe(true);
    expect(gmModeSalaryFitsCap([150, 155.5, 154], 155)).toBe(false);
  });
});
