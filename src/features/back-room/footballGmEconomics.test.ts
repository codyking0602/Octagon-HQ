import { describe, expect, it } from "vitest";
import gmContracts from "../../../data/generated/football/nfl-gm-contracts-2026-10-05.json";
import wheelPriority from "../../../data/generated/football/wheel-football-priorities.json";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_CONTRACT_EFFECTIVE_DATE,
  footballGmContractForPlayer,
  footballGmMarketCeiling,
  footballGmSalarySchedule,
  projectFootballGmExtensionApy,
} from "./footballGmEconomics";
import { normalizedWheelFootballNflBaseName } from "./wheelFootballNflPriority";

const families = ["QB", "RB", "WR", "TE", "Front Seven", "Secondary"] as const;

function key(team: string, family: string, player: string) {
  return `${team}|${family}|${normalizedWheelFootballNflBaseName(player)}`;
}

describe("Football GM economics authority", () => {
  it("covers the complete current non-coach NFL Wheel population exactly once", () => {
    const expected = new Set<string>();
    for (const [teamCode, team] of Object.entries(wheelPriority.teams)) {
      for (const family of families) {
        for (const player of team[family] ?? []) {
          expected.add(key(teamCode, family, player));
        }
      }
    }

    const actual = new Set<string>();
    for (const contract of gmContracts.players) {
      const identity = key(contract.teamCode, contract.family, contract.player);
      expect(actual.has(identity), `duplicate GM contract identity ${identity}`).toBe(false);
      actual.add(identity);
      expect(contract.currentApy).toBeGreaterThan(0);
      expect(contract.currentApy).toBeLessThanOrEqual(70_000_000);
      expect(["1YR", "3YR"]).toContain(contract.gameContract);
    }

    expect(expected.size).toBe(594);
    expect(gmContracts.populationCount).toBe(594);
    expect(actual).toEqual(expected);
  });

  it("never embeds hidden or projected player grades in the salary authority", () => {
    for (const contract of gmContracts.players) {
      const fields = Object.keys(contract).map((field) => field.toLowerCase());
      expect(fields.some((field) => field.includes("grade"))).toBe(false);
    }
  });

  it("applies the locked 1YR / 3YR rule to reconciled free-agency years", () => {
    for (const contract of gmContracts.players) {
      if (!("freeAgencyYear" in contract)) continue;
      expect(contract.gameContract).toBe(contract.freeAgencyYear >= 2029 ? "3YR" : "1YR");
    }
  });

  it("locks the initial cap and effective contract snapshot", () => {
    expect(FOOTBALL_GM_CAP).toBe(155_000_000);
    expect(gmContracts.gmCap).toBe(FOOTBALL_GM_CAP);
    expect(FOOTBALL_GM_CONTRACT_EFFECTIVE_DATE).toBe("2026-10-05");
  });

  it("keeps current 2026 market-reset anchors correct", () => {
    expect(footballGmContractForPlayer("KC", "QB", "Patrick Mahomes")).toMatchObject({
      currentApy: 64_000_000,
      gameContract: "3YR",
      marketPosition: "QB",
    });
    expect(footballGmContractForPlayer("LAR", "QB", "Matthew Stafford")).toMatchObject({
      currentApy: 55_000_000,
      gameContract: "1YR",
    });
    expect(footballGmContractForPlayer("ATL", "WR", "Drake London")).toMatchObject({
      currentApy: 35_263_500,
      gameContract: "3YR",
    });
    expect(footballGmContractForPlayer("SF", "RB", "Christian McCaffrey")).toMatchObject({
      currentApy: 19_000_000,
      gameContract: "1YR",
    });
    expect(footballGmContractForPlayer("HOU", "Front Seven", "Will Anderson Jr.")).toMatchObject({
      currentApy: 50_000_000,
      gameContract: "3YR",
      marketPosition: "EDGE",
    });
    expect(footballGmContractForPlayer("LAR", "Front Seven", "Aaron Donald")).toMatchObject({
      currentApy: 20_000_000,
      gameContract: "1YR",
      marketPosition: "IDL",
    });
    expect(footballGmContractForPlayer("HOU", "WR", "Nico Collins")).toMatchObject({
      currentApy: 30_000_000,
      gameContract: "1YR",
      freeAgencyYear: 2028,
    });
    expect(footballGmContractForPlayer("BAL", "WR", "Zay Flowers")).toMatchObject({
      currentApy: 35_000_000,
      gameContract: "3YR",
      freeAgencyYear: 2032,
    });
    expect(footballGmContractForPlayer("DET", "RB", "Jahmyr Gibbs")).toMatchObject({
      currentApy: 22_500_000,
      gameContract: "3YR",
      freeAgencyYear: 2031,
    });
    expect(footballGmContractForPlayer("ATL", "RB", "Bijan Robinson")).toMatchObject({
      currentApy: 22_250_000,
      gameContract: "3YR",
      freeAgencyYear: 2031,
    });
    expect(footballGmContractForPlayer("IND", "RB", "Jonathan Taylor")).toMatchObject({
      currentApy: 22_000_000,
      gameContract: "3YR",
      freeAgencyYear: 2029,
    });
    expect(footballGmContractForPlayer("LAC", "Secondary", "Derwin James Jr.")).toMatchObject({
      currentApy: 25_200_000,
      gameContract: "3YR",
      freeAgencyYear: 2030,
    });
    expect(footballGmContractForPlayer("NE", "Secondary", "Christian Gonzalez")).toMatchObject({
      currentApy: 33_750_000,
      gameContract: "3YR",
    });
    expect(footballGmContractForPlayer("PHI", "Secondary", "Riq Woolen")).toMatchObject({
      currentApy: 12_000_000,
      gameContract: "1YR",
    });
    expect(footballGmContractForPlayer("LAR", "Secondary", "Kam Curl")).toMatchObject({
      currentApy: 12_000_000,
      gameContract: "3YR",
    });
    expect(footballGmContractForPlayer("JAX", "Secondary", "Travis Hunter")).toMatchObject({
      currentApy: 11_662_278,
      gameContract: "3YR",
      marketPosition: "DB",
    });
  });

  it("prices projected extensions by ability, position market, and age", () => {
    const youngEliteWr = projectFootballGmExtensionApy({
      marketPosition: "WR",
      projectedGrade: 99,
      ageAtExtension: 25,
    });
    const youngGoodWr = projectFootballGmExtensionApy({
      marketPosition: "WR",
      projectedGrade: 90,
      ageAtExtension: 25,
    });
    const youngEliteRb = projectFootballGmExtensionApy({
      marketPosition: "RB",
      projectedGrade: 99,
      ageAtExtension: 24,
    });
    const oldEliteRb = projectFootballGmExtensionApy({
      marketPosition: "RB",
      projectedGrade: 99,
      ageAtExtension: 30,
    });
    const oldEliteQb = projectFootballGmExtensionApy({
      marketPosition: "QB",
      projectedGrade: 99,
      ageAtExtension: 38,
    });

    expect(youngEliteWr).toBeGreaterThan(youngGoodWr);
    expect(youngEliteWr).toBeGreaterThan(youngEliteRb);
    expect(youngEliteRb).toBeGreaterThan(oldEliteRb);
    expect(oldEliteQb / footballGmMarketCeiling("QB")).toBeGreaterThan(
      oldEliteRb / footballGmMarketCeiling("RB"),
    );
  });

  it("keeps role-specific defensive markets distinct", () => {
    const edge = projectFootballGmExtensionApy({
      marketPosition: "EDGE",
      projectedGrade: 99,
      ageAtExtension: 26,
    });
    const interior = projectFootballGmExtensionApy({
      marketPosition: "IDL",
      projectedGrade: 99,
      ageAtExtension: 26,
    });
    const linebacker = projectFootballGmExtensionApy({
      marketPosition: "LB",
      projectedGrade: 99,
      ageAtExtension: 26,
    });
    const db = projectFootballGmExtensionApy({
      marketPosition: "DB",
      projectedGrade: 99,
      ageAtExtension: 26,
    });

    expect(edge).toBeGreaterThan(interior);
    expect(interior).toBeGreaterThan(db);
    expect(db).toBeGreaterThan(linebacker);
  });

  it("uses current APY for all three years on 3YR deals and reprices 1YR deals once", () => {
    const locked = footballGmContractForPlayer("KC", "QB", "Patrick Mahomes")!;
    expect(footballGmSalarySchedule(locked, null)).toEqual([
      64_000_000,
      64_000_000,
      64_000_000,
    ]);

    const expiring = footballGmContractForPlayer("LAR", "QB", "Matthew Stafford")!;
    expect(footballGmSalarySchedule(expiring, 32_000_000)).toEqual([
      55_000_000,
      32_000_000,
      32_000_000,
    ]);
    expect(() => footballGmSalarySchedule(expiring, null)).toThrow(
      "A 1YR GM contract requires a positive projected extension APY.",
    );
  });
});
