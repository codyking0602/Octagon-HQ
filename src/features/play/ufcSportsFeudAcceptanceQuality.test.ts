import { describe, expect, it } from "vitest";
import { normalizeFamilyFeudInput } from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";
import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

const UFC_FAST = [
  ...UFC_SPORTS_FEUD_FAST_1,
  ...UFC_SPORTS_FEUD_FAST_2,
  ...UFC_SPORTS_FEUD_FAST_3,
  ...UFC_SPORTS_FEUD_FAST_4,
  ...UFC_SPORTS_FEUD_FAST_5,
];
const UFC_ALL = [...UFC_SPORTS_FEUD_MAIN, ...UFC_FAST];

function candidates(question: SportsFeudAuthoredQuestion) {
  return [...question.answers, ...(question.alsoAcceptedAnswers ?? [])];
}

function names(question: SportsFeudAuthoredQuestion) {
  return candidates(question).map((answer) => answer.name);
}

function question(id: string) {
  const row = UFC_ALL.find((candidate) => candidate.id === id);
  expect(row, id).toBeDefined();
  return row!;
}

function familyRows(prefix: string) {
  return UFC_ALL.filter((row) => row.id.startsWith(prefix));
}

function rankingSignature(row: SportsFeudAuthoredQuestion) {
  return row.answers.map((answer) => normalizeFamilyFeudInput(answer.name)).join("|");
}

describe("UFC Sports Feud full-bank acceptance quality", () => {
  it("locks the complete 350-prompt UFC authored shape", () => {
    expect(UFC_SPORTS_FEUD_MAIN).toHaveLength(100);
    expect(UFC_FAST).toHaveLength(250);
    expect(UFC_ALL).toHaveLength(350);
    expect(new Set(UFC_ALL.map((row) => row.id)).size).toBe(350);

    for (const row of UFC_ALL) {
      expect(row.answers, row.id).toHaveLength(8);
      const ranked = row.answers.map((answer) => normalizeFamilyFeudInput(answer.name));
      const accepted = (row.alsoAcceptedAnswers ?? []).map((answer) =>
        normalizeFamilyFeudInput(answer.name));
      expect(new Set(ranked).size, row.id).toBe(8);
      expect(new Set(accepted).size, row.id).toBe(accepted.length);
      expect(accepted.some((name) => ranked.includes(name)), row.id).toBe(false);
    }
  });

  it("keeps subjective UFC Main families independently ranked", () => {
    const subjective = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19,20];
    for (const family of subjective) {
      const prefix = `ufc-main-${String(family).padStart(2, "0")}-`;
      const rows = familyRows(prefix);
      expect(rows, prefix).toHaveLength(5);
      expect(new Set(rows.map(rankingSignature)).size, prefix).toBeGreaterThan(1);
    }
  });

  it("keeps subjective UFC Fast Money families independently ranked", () => {
    const families = [
      ...[7,8,9,10].map((n) => `ufc-fast1-${String(n).padStart(2, "0")}-`),
      ...Array.from({ length: 10 }, (_, i) => `ufc-fast2-${String(i + 1).padStart(2, "0")}-`),
      ...[1,2,3,4,5,6,8,9,10].map((n) => `ufc-fast3-${String(n).padStart(2, "0")}-`),
      ...Array.from({ length: 10 }, (_, i) => `ufc-fast4-${String(i + 1).padStart(2, "0")}-`),
      ...Array.from({ length: 10 }, (_, i) => `ufc-fast5-${String(i + 1).padStart(2, "0")}-`),
    ];

    for (const prefix of families) {
      const rows = familyRows(prefix);
      expect(rows, prefix).toHaveLength(5);
      expect(new Set(rows.map(rankingSignature)).size, prefix).toBeGreaterThan(1);
    }
  });

  it("keeps current closed-set UFC champion history complete through September 2026", () => {
    const lightweight = names(question("ufc-fast1-02-1"));
    expect(lightweight).toHaveLength(14);
    expect(lightweight).toContain("Justin Gaethje");
    expect(lightweight).toContain("Ilia Topuria");

    const welterweight = names(question("ufc-fast1-03-1"));
    expect(welterweight).toHaveLength(14);
    expect(welterweight).toContain("Islam Makhachev");
    expect(welterweight).toContain("Jack Della Maddalena");

    const middleweight = names(question("ufc-fast1-04-1"));
    expect(middleweight).toHaveLength(15);
    expect(middleweight).toContain("Sean Strickland");
    expect(middleweight).toContain("Khamzat Chimaev");

    const heavyweight = names(question("ufc-fast1-05-1"));
    expect(heavyweight).toHaveLength(20);
    expect(heavyweight).toContain("Jon Jones");
    expect(heavyweight).toContain("Tom Aspinall");
    expect(heavyweight).toContain("Ciryl Gane");

    const multiDivision = names(question("ufc-fast1-06-1"));
    expect(multiDivision).toHaveLength(11);
    expect(multiDivision).toContain("Islam Makhachev");
    expect(multiDivision).toContain("Ilia Topuria");
  });

  it("keeps the official Modern and Pioneer Hall of Fame fighter universe uncapped", () => {
    const hall = names(question("ufc-fast3-07-1"));
    expect(hall).toHaveLength(41);
    expect(hall).toContain("Dominick Cruz");
    expect(hall).toContain("Chris Weidman");
    expect(hall).toContain("Demetrious Johnson");
    expect(hall).toContain("Mark Kerr");
    expect(hall.length).toBeGreaterThan(25);
  });

  it("keeps PRIDE wording scoped to what actually happened", () => {
    expect(names(question("ufc-fast3-06-1"))).not.toContain("Kazushi Sakuraba");
    expect(names(question("ufc-fast3-06-2"))).toContain("Kazushi Sakuraba");
    expect(names(question("ufc-fast3-06-3"))).not.toContain("Kazushi Sakuraba");
    expect(names(question("ufc-fast3-06-4"))).toContain("Kazushi Sakuraba");
  });

  it("carries current champions and major current names into open-ended families", () => {
    expect(names(question("ufc-main-01-1"))).toContain("Islam Makhachev");
    expect(names(question("ufc-main-08-1"))).toContain("Ilia Topuria");
    expect(names(question("ufc-main-09-1"))).toContain("Islam Makhachev");
    expect(names(question("ufc-main-09-1"))).toContain("Jack Della Maddalena");
    expect(names(question("ufc-main-10-1"))).toContain("Jon Jones");
    expect(names(question("ufc-fast2-06-1"))).toContain("Alexandre Pantoja");
    expect(names(question("ufc-fast2-09-1"))).toContain("Kayla Harrison");
    expect(names(question("ufc-fast5-09-1"))).toContain("Justin Gaethje");
  });

  it("uses the current grounded-opponent foul wording", () => {
    const fouls = names(question("ufc-fast4-06-1"));
    expect(fouls).toContain("Knee to the head of a grounded opponent");
    expect(fouls).not.toContain("Knee to a grounded opponent");
  });

  it("audits natural player shorthand as authored semantic coverage", () => {
    const aliasSet = (id: string, answerName: string) => {
      const row = question(id);
      const answer = candidates(row).find((candidate) => candidate.name === answerName);
      expect(answer, `${id} ${answerName}`).toBeDefined();
      return new Set((answer?.aliases ?? []).map(normalizeFamilyFeudInput));
    };

    expect(aliasSet("ufc-fast4-01-1", "Knockout")).toContain(normalizeFamilyFeudInput("KO"));
    expect(aliasSet("ufc-fast4-02-1", "Rear-naked choke")).toContain(normalizeFamilyFeudInput("RNC"));
    expect(aliasSet("ufc-fast4-05-1", "Ground-and-pound")).toContain(normalizeFamilyFeudInput("GNP"));
    expect(aliasSet("ufc-fast4-08-1", "Takedown defense")).toContain(normalizeFamilyFeudInput("TDD"));
    expect(aliasSet("ufc-main-16-1", "Enter the UFC Hall of Fame")).toContain(normalizeFamilyFeudInput("HOF"));
    expect(aliasSet("ufc-main-16-1", "Become pound-for-pound No. 1")).toContain(normalizeFamilyFeudInput("P4P #1"));
    expect(aliasSet("ufc-main-15-1", "Madison Square Garden")).toContain(normalizeFamilyFeudInput("MSG"));
    expect(aliasSet("ufc-main-12-1", "American Top Team")).toContain(normalizeFamilyFeudInput("ATT"));
    expect(aliasSet("ufc-main-01-1", "Georges St-Pierre")).toContain(normalizeFamilyFeudInput("GSP"));
    expect(aliasSet("ufc-fast4-09-1", "Fainting")).toContain(normalizeFamilyFeudInput("faint"));
    expect(aliasSet("ufc-fast4-10-1", "Give instructions")).toContain(normalizeFamilyFeudInput("instructions"));
  });

  it("keeps Fast Money prompts immediate and phone-sized", () => {
    for (const row of UFC_FAST) {
      expect(row.prompt.length, row.id).toBeLessThanOrEqual(100);
      expect(row.prompt.toLowerCase(), row.id).not.toMatch(/explain|describe why|give a reason|justify/);
    }
  });
});
