import { describe, expect, it } from "vitest";
import { assertFamilyFeudPack, matchFamilyFeudAnswer, normalizeFamilyFeudInput } from "../games/familyFeudEngine";
import {
  NBA_SPORTS_FEUD_MAIN,
  NBA_SPORTS_FEUD_FAST,
  buildNbaSportsFeudPack,
  nbaSportsFeudEditorialLane,
} from "./nbaSportsFeudBank";

const ALL = [...NBA_SPORTS_FEUD_MAIN, ...NBA_SPORTS_FEUD_FAST];
function findPack(id: string, group: "main" | "fast") {
  for (let n = 0; n < 2048; n++) {
    const pack = buildNbaSportsFeudPack("editorial-" + n);
    if ((group === "main" ? pack.mainBoards : pack.fastMoney).some(q => q.id === "nba-feud-" + id)) return pack;
  }
  throw new Error("Unreachable editorial question " + id);
}
function accepted(id: string, group: "main" | "fast", guess: string) {
  const pack = findPack(id, group);
  const question = [...pack.mainBoards, ...pack.fastMoney].find(q => q.id === "nba-feud-" + id)!;
  const match = matchFamilyFeudAnswer(pack, question, guess);
  return match.status === "matched"
    ? pack.entities.find(e => e.id === match.entityId)!.displayName
    : match.status;
}

describe("NBA Feud expanded question-bank editorial integrity", () => {
  it("has eight distinctive ranked names and valid extras on all curated questions", () => {
    expect(NBA_SPORTS_FEUD_MAIN).toHaveLength(54);
    expect(NBA_SPORTS_FEUD_FAST).toHaveLength(78);
    expect(new Set(ALL.map(q => q.id)).size).toBe(ALL.length);
    expect(new Set(ALL.map(q => normalizeFamilyFeudInput(q.prompt))).size).toBe(ALL.length);
    for (const q of ALL) {
      const universe = [...q.answers, ...q.extras].map(normalizeFamilyFeudInput);
      expect(q.answers, q.id).toHaveLength(8);
      expect(new Set(universe).size, q.id).toBe(universe.length);
      expect(q.kind, q.id).toMatch(/^(person|team|other)$/);
      expect(q.prompt.length, q.id).toBeLessThan(150);
    }
  });

  it("does not ask season-specific or Finals-roster trivia in Fast Money", () => {
    for (const q of NBA_SPORTS_FEUD_FAST) {
      expect(q.prompt, q.id).not.toMatch(/\b(?:19|20)\d{2}\b|\b(?:finals|game [1-7]|playoff series|roster|season-specific)\b/i);
      expect(q.prompt, q.id).toMatch(/^Name (?:an? |someone |something )/);
      // The player can immediately name one of eight mainstream associations,
      // instead of reconstructing one single-season roster or obscure stat line.
      expect(q.answers).toHaveLength(8);
    }
  });

  it("accepts the complete defined conference, medal-team and never-champion sets", () => {
    for (const [id, size] of [
      ["east-teams", 15], ["west-teams", 15], ["without-nba-title", 10],
      ["redeem-team-2008", 12], ["london-team-2012", 12],
      ["recent-title-franchises", 12],
    ] as const) {
      const q = NBA_SPORTS_FEUD_MAIN.find(v => v.id === id)!;
      expect(q.answers.length + q.extras.length, id).toBe(size);
    }
    expect(accepted("east-teams", "main", "Wizards")).toBe("Washington Wizards");
    expect(accepted("west-teams", "main", "Clippers")).toBe("Los Angeles Clippers");
    expect(accepted("without-nba-title", "main", "Nets")).toBe("Brooklyn Nets");
    expect(accepted("redeem-team-2008", "main", "Deron Williams")).toBe("Deron Williams");
    expect(accepted("london-team-2012", "main", "Andre Iguodala")).toBe("Andre Iguodala");
  });

  it("fixes 2026 NBA champions and awards and catches normal fan alternate names", () => {
    expect(accepted("fmvp", "main", "Brunson")).toBe("Jalen Brunson");
    expect(accepted("finalists", "main", "Knicks")).toBe("New York Knicks");
    expect(accepted("champions", "main", "Wizards")).toBe("Washington Wizards");
    expect(accepted("champions", "main", "Kings")).toBe("Sacramento Kings");
    expect(accepted("sixth-man-award", "main", "Keldon Johnson")).toBe("Keldon Johnson");
    expect(accepted("coaches-award", "main", "Mazzulla")).toBe("Joe Mazzulla");
    expect(accepted("duke-alumni", "main", "Flagg")).toBe("Cooper Flagg");
    expect(accepted("number-one-picks", "main", "Hakeem")).toBe("Hakeem Olajuwon");
    expect(accepted("fast-free-throws", "fast", "Steph")).toBe("Stephen Curry");
    expect(accepted("nets-alumni", "fast", "KD")).toBe("Kevin Durant");
    expect(accepted("lakers-legends", "fast", "Elgin Baylor")).toBe("Elgin Baylor");
    expect(accepted("celtics-legends", "fast", "Marcus Smart")).toBe("Marcus Smart");
    expect(accepted("heat", "fast", "Duncan Robinson")).toBe("Duncan Robinson");
    expect(accepted("warriors", "fast", "Jimmy Butler")).toBe("Jimmy Butler");
    expect(accepted("knicks", "fast", "Karl-Anthony Towns")).toBe("Karl-Anthony Towns");
    expect(accepted("mavericks", "fast", "Cooper Flagg")).toBe("Cooper Flagg");
    expect(accepted("nicknames", "fast", "PG13")).toBe("Paul George");
    expect(accepted("wolves-alumni", "fast", "KAT")).toBe("Karl-Anthony Towns");
  });

  it("runs 6,000 complete varied seven-question seeds and checks alias collisions", () => {
    const frequencies = new Map<string, number>();
    const distinctSequences = new Set<string>();
    for (let i = 0; i < 6_000; i++) {
      const seed = "nba-feud-audit-" + i;
      const pack = buildNbaSportsFeudPack(seed);
      expect(() => assertFamilyFeudPack(pack)).not.toThrow();
      const questions = [...pack.mainBoards, ...pack.fastMoney];
      expect(questions).toHaveLength(7);
      const ids = questions.map(q => q.id);
      expect(new Set(ids).size).toBe(7);
      const categories = ids.map(id => ALL.find(q => "nba-feud-" + q.id === id)!.category);
      expect(new Set(categories).size).toBe(7);
      expect(new Set(categories.map(nbaSportsFeudEditorialLane)).size).toBe(7);
      distinctSequences.add(ids.join("|"));
      for (const question of questions) {
        frequencies.set(question.id, (frequencies.get(question.id) ?? 0) + 1);
        const tokens = new Map<string, string>();
        for (const entity of pack.entities.filter(e => question.candidateIds.includes(e.id))) {
          for (const label of [entity.displayName, ...(entity.aliases ?? [])]) {
            const key = normalizeFamilyFeudInput(label);
            const prior = tokens.get(key);
            expect(prior === undefined || prior === entity.id,
              question.id + ": " + label + " ambiguously identifies two answers").toBe(true);
            tokens.set(key, entity.id);
          }
        }
      }
    }
    expect(distinctSequences.size).toBe(6_000);
    // No dead questions across the full pool, even after semantic collisions.
    for (const q of ALL) expect(frequencies.get("nba-feud-" + q.id) ?? 0, q.id).toBeGreaterThan(0);
  });
});
