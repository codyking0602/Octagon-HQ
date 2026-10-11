import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { gmModeContractTermForFreeAgencyYear } from "./gmModeEconomics";

type PriorityTeam = Record<"QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary", string[]>;
type PriorityArtifact = { teams: Record<string, PriorityTeam> };
type ContractRecord = {
  team: string;
  player: string;
  sourceFamily: "QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary";
  gmPosition: "QB" | "RB" | "WR" | "TE" | "DL" | "LB" | "DB";
  age: number;
  currentApyMillions: number;
  freeAgencyYear: number;
  freeAgencyType: string | null;
  gmTerm: "1YR" | "3YR";
};
type ContractArtifact = {
  expectedCanonicalPlayerIdentities: number;
  records: ContractRecord[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const priority = JSON.parse(readFileSync(
  "data/generated/football/wheel-football-priorities.json",
  "utf8",
)) as PriorityArtifact;

const contracts = JSON.parse(readFileSync(
  "data/generated/football/gm-mode-nfl-contracts-2026.json",
  "utf8",
)) as ContractArtifact;

const families = ["QB", "RB", "WR", "TE", "Front Seven", "Secondary"] as const;

function key(team: string, family: string, player: string) {
  return `${team}|${family}|${normalize(player)}`;
}

describe("GM Mode NFL contract universe", () => {
  it("covers every canonical current Wheel player and excludes coaches", () => {
    const expected = new Set<string>();
    for (const [team, values] of Object.entries(priority.teams)) {
      for (const family of families) {
        for (const player of values[family] ?? []) {
          expected.add(key(team, family, player));
        }
      }
    }

    const actual = new Set(
      contracts.records.map((row) => key(row.team, row.sourceFamily, row.player)),
    );

    expect(expected.size).toBe(594);
    expect(contracts.expectedCanonicalPlayerIdentities).toBe(594);
    expect(contracts.records).toHaveLength(594);
    expect(actual).toEqual(expected);
  });

  it("stores only real positive APYs and the locked 1YR/3YR term", () => {
    for (const row of contracts.records) {
      expect(row.currentApyMillions).toBeGreaterThan(0);
      expect(row.age).toBeGreaterThanOrEqual(20);
      expect(row.age).toBeLessThanOrEqual(45);
      expect(row.freeAgencyYear).toBeGreaterThanOrEqual(2027);
      expect(row.gmTerm).toBe(gmModeContractTermForFreeAgencyYear(row.freeAgencyYear));
    }
  });

  it("maps the seven-slot GM defensive structure without changing offense", () => {
    for (const row of contracts.records) {
      if (row.sourceFamily === "QB") expect(row.gmPosition).toBe("QB");
      if (row.sourceFamily === "RB") expect(row.gmPosition).toBe("RB");
      if (row.sourceFamily === "WR") expect(row.gmPosition).toBe("WR");
      if (row.sourceFamily === "TE") expect(row.gmPosition).toBe("TE");
      if (row.sourceFamily === "Secondary") expect(row.gmPosition).toBe("DB");
      if (row.sourceFamily === "Front Seven") {
        expect(["DL", "LB"]).toContain(row.gmPosition);
      }
    }
  });

  it("preserves important real-world contract archetypes", () => {
    const find = (team: string, family: ContractRecord["sourceFamily"], player: string) =>
      contracts.records.find((row) => key(row.team, row.sourceFamily, row.player) === key(team, family, player));

    expect(find("LAR", "WR", "Puka Nacua")).toMatchObject({
      currentApyMillions: 1.021245,
      gmTerm: "1YR",
    });
    expect(find("SEA", "WR", "Jaxon Smith-Njigba")).toMatchObject({
      currentApyMillions: 42.15,
      gmTerm: "3YR",
    });
    expect(find("LAR", "QB", "Matthew Stafford")).toMatchObject({
      currentApyMillions: 55,
      gmTerm: "1YR",
    });
    expect(find("LV", "TE", "Brock Bowers")).toMatchObject({
      currentApyMillions: 4.534696,
      gmTerm: "1YR",
    });
    expect(find("NE", "QB", "Drake Maye")).toMatchObject({
      currentApyMillions: 9.159941,
      gmTerm: "1YR",
    });
  });

  it("keeps two-way Travis Hunter's single real contract usable in either GM role", () => {
    const hunter = contracts.records.filter((row) => row.team === "JAX" && row.player === "Travis Hunter");
    expect(hunter).toHaveLength(2);
    expect(hunter.map((row) => row.gmPosition).sort()).toEqual(["DB", "WR"]);
    expect(new Set(hunter.map((row) => row.currentApyMillions)).size).toBe(1);
    expect(new Set(hunter.map((row) => row.gmTerm)).size).toBe(1);
  });
});
