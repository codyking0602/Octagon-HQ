import { describe, expect, it } from "vitest";
import { footballGmActualRole } from "./footballGmPositionalValue";
import {
  WHEEL_FOOTBALL_GM_CAP,
  WHEEL_FOOTBALL_GM_ROSTER_SLOTS,
  projectWheelFootballGmExtensionApy,
  projectWheelFootballGmGrade,
  wheelFootballGmMarketPositionForContract,
  wheelFootballGmSalaryWindow,
  type WheelFootballGmContractRow,
  type WheelFootballGmRosterSlot,
} from "./wheelFootballGmEconomy";
import {
  contractsArtifact,
  frontSevenGradesArtifact,
  qbGradesArtifact,
  rbGradesArtifact,
  secondaryGradesArtifact,
  teGradesArtifact,
  wrGradesArtifact,
} from "./wheelFootballNflCurrentAuthority";

type ContractArtifact = {
  players: WheelFootballGmContractRow[];
  threeYearWindow: number[];
};

type GradeRow = {
  team: string;
  player: string;
  grade: number;
};

const contractAuthority = contractsArtifact as ContractArtifact;
const contracts = contractAuthority.players;
const windowEndSeason = Math.max(...contractAuthority.threeYearWindow);

const gradeFiles = [
  ["QB", qbGradesArtifact],
  ["RB", rbGradesArtifact],
  ["WR", wrGradesArtifact],
  ["TE", teGradesArtifact],
  ["Front Seven", frontSevenGradesArtifact],
  ["Secondary", secondaryGradesArtifact],
] as const;

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(?:iii|ii|iv|jr|sr|v)$/, "");
}

const grades = new Map<string, number>();
for (const [family, source] of gradeFiles) {
  const artifact = source as { grades: GradeRow[] };
  for (const row of artifact.grades) {
    grades.set(`${row.team}|${family}|${normalized(row.player)}`, row.grade);
  }
}

function gradeFor(contract: WheelFootballGmContractRow) {
  return grades.get(`${contract.team}|${contract.family}|${normalized(contract.player)}`);
}

function findContract(player: string, family?: WheelFootballGmContractRow["family"]) {
  const found = contracts.find((row) => row.player === player && (family == null || row.family === family));
  if (!found) throw new Error(`Missing GM contract fixture for ${player}`);
  return found;
}

function extensionFor(contract: WheelFootballGmContractRow) {
  const currentGrade = gradeFor(contract);
  if (currentGrade == null) throw new Error(`Missing grade for ${contract.player}`);
  return projectWheelFootballGmExtensionApy({
    currentGrade,
    age: contract.age,
    position: wheelFootballGmMarketPositionForContract(contract),
    marketRole: footballGmActualRole(contract),
    draftYear: contract.draftYear,
    draftOverall: contract.draftOverall,
    projectionAdjustment: contract.projectionAdjustment ?? 0,
  });
}

describe("Wheel NFL GM contract authority", () => {
  it("covers every non-coach Wheel identity with no fallback economics", () => {
    expect(contracts).toHaveLength(grades.size);
    expect(new Set(contracts.map((row) => row.team)).size).toBe(32);
    expect(contracts.every((row) => row.age >= 20 && row.age <= 42)).toBe(true);
    expect(contracts.every((row) => row.salaryApy > 0)).toBe(true);
    expect(contracts.every((row) => row.gmEligibleSlots.length > 0)).toBe(true);
  });

  it("applies the locked 1YR versus 3YR simplification literally", () => {
    for (const row of contracts) {
      expect(["1YR", "3YR"]).toContain(row.gameContract);
      const isOneYear = row.realContractEndSeason < windowEndSeason
        || (row.realContractEndSeason === windowEndSeason && row.salaryApy <= 7_000_000);
      expect(row.gameContract).toBe(isOneYear ? "1YR" : "3YR");
    }
  });

  it("calibrates the 594-player market to 65% 1YR / 35% 3YR without changing real contract data", () => {
    expect(contracts.filter((player) => player.gameContract === "1YR")).toHaveLength(386);
    expect(contracts.filter((player) => player.gameContract === "3YR")).toHaveLength(208);
    expect(contracts.filter((player) => player.gameContract === "1YR" && player.realContractEndSeason === windowEndSeason)).toHaveLength(67);
    expect(contracts.filter((player) => player.gameContract === "1YR" && player.realContractEndSeason === windowEndSeason && player.salaryApy > 7_000_000)).toHaveLength(0);
    expect(findContract("Matthew Stafford").gameContract).toBe("1YR");
    expect(findContract("Cameron Heyward").gameContract).toBe("1YR");
    expect(findContract("Fred Warner").gameContract).toBe("3YR");
    expect(findContract("Tetairoa McMillan").gameContract).toBe("1YR");
    expect(findContract("Colston Loveland").gameContract).toBe("1YR");
  });

  it("maps the current Wheel population into the seven GM roster slots", () => {
    const legal = new Set<string>(WHEEL_FOOTBALL_GM_ROSTER_SLOTS);
    for (const row of contracts) {
      expect(row.gmEligibleSlots.every((slot) => legal.has(slot))).toBe(true);
      if (row.family === "QB") expect(row.gmEligibleSlots).toEqual(["QB"]);
      if (row.family === "TE") expect(row.gmEligibleSlots).toEqual(["FLEX"]);
      if (row.family === "Secondary") expect(row.gmEligibleSlots).toEqual(["DB"]);
      if (row.family === "Front Seven") {
        expect(row.gmEligibleSlots.length).toBe(1);
        expect(["DL", "LB"]).toContain(row.gmEligibleSlots[0]);
      }
    }

  });

  it("resolves every current contract identity to the shared current-ability grades", () => {
    const missing = contracts.filter((row) => gradeFor(row) == null);
    expect(missing).toEqual([]);
  });
});

describe("Wheel NFL GM three-year economics", () => {
  it("does not grant improvement merely because a player is young", () => {
    expect(projectWheelFootballGmGrade({
      currentGrade: 78,
      age: 23,
      position: "WR",
      yearsAhead: 2,
      draftYear: 2023,
      draftOverall: 177,
    })).toBe(78);
  });

  it("allows recent blue-chip pedigree to create projection headroom without replacing current ability", () => {
    const maye = findContract("Drake Maye");
    const currentGrade = gradeFor(maye)!;
    const yearTwo = projectWheelFootballGmGrade({
      currentGrade,
      age: maye.age,
      position: "QB",
      yearsAhead: 1,
      draftYear: maye.draftYear,
      draftOverall: maye.draftOverall,
    });
    const yearThree = projectWheelFootballGmGrade({
      currentGrade,
      age: maye.age,
      position: "QB",
      yearsAhead: 2,
      draftYear: maye.draftYear,
      draftOverall: maye.draftOverall,
    });

    expect(yearTwo).toBeGreaterThan(currentGrade);
    expect(yearThree).toBeGreaterThan(yearTwo);
    expect(yearThree).toBeLessThanOrEqual(93);
  });

  it("lets evidence-backed outlook changes move a young player's future both directions", () => {
    const baseline = projectWheelFootballGmGrade({
      currentGrade: 82,
      age: 23,
      position: "WR",
      yearsAhead: 2,
      draftYear: 2024,
      draftOverall: 40,
    });
    const rising = projectWheelFootballGmGrade({
      currentGrade: 82,
      age: 23,
      position: "WR",
      yearsAhead: 2,
      draftYear: 2024,
      draftOverall: 40,
      projectionAdjustment: 1,
    });
    const falling = projectWheelFootballGmGrade({
      currentGrade: 82,
      age: 23,
      position: "WR",
      yearsAhead: 2,
      draftYear: 2024,
      draftOverall: 40,
      projectionAdjustment: -1,
    });

    expect(rising).toBeGreaterThan(baseline);
    expect(falling).toBeLessThan(baseline);
  });

  it("lets elite veterans decline gradually rather than automatically collapsing", () => {
    const yearTwo = projectWheelFootballGmGrade({
      currentGrade: 95,
      age: 38,
      position: "QB",
      yearsAhead: 1,
    });
    expect(yearTwo).toBeGreaterThan(92);
    expect(yearTwo).toBeLessThan(95);
  });

  it("reprices high-grade expiring stars to the current market rather than stale rookie money", () => {
    expect(projectWheelFootballGmExtensionApy({
      currentGrade: 98,
      age: 25,
      position: "WR",
      draftYear: 2023,
      draftOverall: 177,
    })).toBeGreaterThan(35_000_000);
    expect(projectWheelFootballGmExtensionApy({
      currentGrade: 98,
      age: 23,
      position: "FLEX",
      draftYear: 2024,
      draftOverall: 13,
    })).toBeGreaterThan(18_000_000);
  });

  it("reprices only once in the single offseason", () => {
    expect(wheelFootballGmSalaryWindow({
      gameContract: "1YR",
      salaryApy: 5_000_000,
      projectedExtensionApy: 24_000_000,
    })).toEqual([5_000_000, 24_000_000, 24_000_000]);

    expect(wheelFootballGmSalaryWindow({
      gameContract: "3YR",
      salaryApy: 21_000_000,
      projectedExtensionApy: 99_000_000,
    })).toEqual([21_000_000, 21_000_000, 21_000_000]);
  });
});

describe("Wheel NFL GM cap calibration", () => {
  const slots = [...WHEEL_FOOTBALL_GM_ROSTER_SLOTS];
  const teams = [...new Set(contracts.map((row) => row.team))];
  const byTeam = new Map(teams.map((team) => [
    team,
    contracts.filter((row) => row.team === team),
  ]));
  const minBySlot = new Map<WheelFootballGmRosterSlot, number>(
    slots.map((slot) => [
      slot,
      Math.min(...contracts.filter((row) => row.gmEligibleSlots.includes(slot)).map((row) => row.salaryApy)),
    ]),
  );

  function simulate(strategy: "greedy" | "random") {
    let seed = strategy === "greedy" ? 1708 : 1709;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const results: Array<{ yearOneGrade: number; yearTwoSalary: number }> = [];
    for (let game = 0; game < 2_000; game += 1) {
      let open = [...slots];
      const used = new Set<string>();
      const picks: WheelFootballGmContractRow[] = [];
      let spent = 0;
      let previousTeam = "";

      for (let turn = 0; turn < 7; turn += 1) {
        const eligibleTeams: Array<{
          team: string;
          options: Array<{ contract: WheelFootballGmContractRow; slot: WheelFootballGmRosterSlot }>;
        }> = [];

        for (const team of teams) {
          if (team === previousTeam) continue;
          const options: Array<{ contract: WheelFootballGmContractRow; slot: WheelFootballGmRosterSlot }> = [];
          for (const contract of byTeam.get(team) ?? []) {
            const identity = `${contract.team}|${contract.normalizedName}`;
            if (used.has(identity)) continue;
            for (const slot of contract.gmEligibleSlots) {
              if (!open.includes(slot)) continue;
              const minimumRemaining = open
                .filter((remaining) => remaining !== slot)
                .reduce((sum, remaining) => sum + minBySlot.get(remaining)!, 0);
              if (spent + contract.salaryApy + minimumRemaining <= WHEEL_FOOTBALL_GM_CAP) {
                options.push({ contract, slot });
              }
            }
          }
          if (options.length) eligibleTeams.push({ team, options });
        }

        if (!eligibleTeams.length) {
          picks.length = 0;
          break;
        }

        const landed = eligibleTeams[Math.floor(random() * eligibleTeams.length)]!;
        previousTeam = landed.team;
        const selected = strategy === "greedy"
          ? landed.options.reduce((best, option) =>
              gradeFor(option.contract)! > gradeFor(best.contract)! ? option : best)
          : landed.options[Math.floor(random() * landed.options.length)]!;

        picks.push(selected.contract);
        spent += selected.contract.salaryApy;
        used.add(`${selected.contract.team}|${selected.contract.normalizedName}`);
        open = open.filter((slot) => slot !== selected.slot);
      }

      if (picks.length !== 7) continue;
      const yearOneGrade = picks.reduce((sum, contract) => sum + gradeFor(contract)!, 0) / 7;
      const yearTwoSalary = picks.reduce((sum, contract) => (
        sum + (contract.gameContract === "1YR" ? extensionFor(contract) : contract.salaryApy)
      ), 0);
      results.push({ yearOneGrade, yearTwoSalary });
    }

    results.sort((left, right) => left.yearOneGrade - right.yearOneGrade);
    const topQuartile = results.slice(Math.floor(results.length * 0.75));
    return {
      completed: results.length,
      averageYearOne: results.reduce((sum, row) => sum + row.yearOneGrade, 0) / results.length,
      crisisRate: results.filter((row) => row.yearTwoSalary > WHEEL_FOOTBALL_GM_CAP).length / results.length,
      topQuartileCrisisRate:
        topQuartile.filter((row) => row.yearTwoSalary > WHEEL_FOOTBALL_GM_CAP).length / topQuartile.length,
    };
  }

  it("keeps aggressive Year 1 builds meaningfully constrained without making the offseason automatic", () => {
    const greedy = simulate("greedy");
    const random = simulate("random");

    expect(greedy.completed).toBeGreaterThan(1_900);
    expect(random.completed).toBeGreaterThan(1_900);
    expect(greedy.averageYearOne).toBeGreaterThan(random.averageYearOne + 5);
    expect(greedy.crisisRate).toBeGreaterThan(0.7);
    expect(greedy.crisisRate).toBeLessThan(0.9);
    // Correctly honoring 2028 contracts as 3YR reduces forced reprices. The
    // strongest Year 1 drafts should still face material offseason cap risk.
    expect(greedy.topQuartileCrisisRate).toBeGreaterThanOrEqual(0.8);
    expect(random.crisisRate).toBeLessThan(0.1);
    expect(greedy.crisisRate - random.crisisRate).toBeGreaterThan(0.65);
  });
});
