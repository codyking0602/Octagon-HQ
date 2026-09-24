import { describe, expect, it } from "vitest";
import {
  assertFamilyFeudPack,
  matchFamilyFeudAnswer,
  normalizeFamilyFeudInput,
} from "../games/familyFeudEngine";
import type {
  FamilyFeudEntity,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { NFL_SPORTS_FEUD_MAIN } from "./nflSportsFeudMain";
import { NFL_SPORTS_FEUD_FAST_1 } from "./nflSportsFeudFast1";
import { NFL_SPORTS_FEUD_FAST_2 } from "./nflSportsFeudFast2";
import { NFL_SPORTS_FEUD_FAST_3 } from "./nflSportsFeudFast3";
import { NFL_SPORTS_FEUD_FAST_4 } from "./nflSportsFeudFast4";
import { NFL_SPORTS_FEUD_FAST_5 } from "./nflSportsFeudFast5";
import {
  buildSportsFeudPack,
  footballSportsFeudDomainForDay,
} from "./sportsFeudDailyBanks";
import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

const NFL_FAST = [
  ...NFL_SPORTS_FEUD_FAST_1,
  ...NFL_SPORTS_FEUD_FAST_2,
  ...NFL_SPORTS_FEUD_FAST_3,
  ...NFL_SPORTS_FEUD_FAST_4,
  ...NFL_SPORTS_FEUD_FAST_5,
] as const;

const NFL_ALL = [...NFL_SPORTS_FEUD_MAIN, ...NFL_FAST] as const;

function addDays(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function surname(displayName: string) {
  const tokens = normalizeFamilyFeudInput(displayName).split(" ").filter(Boolean);
  while (
    tokens.length > 1
    && ["jr", "sr", "ii", "iii", "iv", "v"].includes(tokens[tokens.length - 1]!)
  ) {
    tokens.pop();
  }
  return tokens.at(-1) ?? "";
}

type MaterializedQuestion = {
  pack: FamilyFeudPack;
  question: FamilyFeudQuestion;
};

let cachedMaterialized: Map<string, MaterializedQuestion> | null = null;

function materializedNflQuestions() {
  if (cachedMaterialized) return cachedMaterialized;

  const found = new Map<string, MaterializedQuestion>();
  for (let offset = 0; offset < 730; offset += 1) {
    const pack = buildSportsFeudPack("nfl", addDays("2026-09-23", offset));
    assertFamilyFeudPack(pack);
    for (const question of [...pack.mainBoards, ...pack.fastMoney]) {
      if (!found.has(question.id)) found.set(question.id, { pack, question });
    }
  }

  cachedMaterialized = found;
  return found;
}

function selectedQuestion(id: string) {
  const selected = materializedNflQuestions().get(id);
  if (!selected) throw new Error(`NFL Sports Feud question ${id} did not materialize in the audit window.`);
  return selected;
}

function matchedDisplayName(id: string, input: string) {
  const { pack, question } = selectedQuestion(id);
  const match = matchFamilyFeudAnswer(pack, question, input);
  expect(match.status).toBe("matched");
  if (match.status !== "matched") return null;
  return pack.entities.find((entity) => entity.id === match.entityId)?.displayName ?? null;
}

function normalizedNames(question: SportsFeudAuthoredQuestion) {
  return question.answers.map((answer) => normalizeFamilyFeudInput(answer.name));
}

function candidateEntities(pack: FamilyFeudPack, question: FamilyFeudQuestion) {
  const byId = new Map(pack.entities.map((entity) => [entity.id, entity]));
  return question.candidateIds.map((entityId) => {
    const entity = byId.get(entityId);
    if (!entity) throw new Error(`Missing NFL Sports Feud entity ${entityId}.`);
    return entity;
  });
}

function matchTerms(entity: FamilyFeudEntity) {
  const terms = [
    normalizeFamilyFeudInput(entity.displayName),
    ...(entity.aliases ?? []).map(normalizeFamilyFeudInput),
  ];
  if (entity.kind === "person") {
    const tokens = normalizeFamilyFeudInput(entity.displayName).split(" ").filter(Boolean);
    terms.push(tokens[0] ?? "");
    terms.push(surname(entity.displayName));
  }
  return [...new Set(terms.filter(Boolean))];
}

describe("NFL Sports Feud authored answer quality", () => {
  it("keeps all 350 NFL prompts explicitly typed with exactly eight ranked scoring answers", () => {
    expect(NFL_SPORTS_FEUD_MAIN).toHaveLength(100);
    expect(NFL_FAST).toHaveLength(250);
    expect(NFL_ALL).toHaveLength(350);
    expect(new Set(NFL_ALL.map((question) => question.id)).size).toBe(350);

    for (const question of NFL_ALL) {
      expect(["person", "team", "school", "other"]).toContain(question.entityKind);
      expect(question.answers).toHaveLength(8);
      expect(new Set(normalizedNames(question)).size).toBe(8);
    }
  });

  it("keeps valid off-board pools curated, unique, and separate from ranked answers", () => {
    for (const question of NFL_ALL) {
      const ranked = new Set(normalizedNames(question));
      const accepted = (question.alsoAcceptedAnswers ?? []).map((answer) =>
        normalizeFamilyFeudInput(answer.name));

      expect(new Set(accepted).size).toBe(accepted.length);
      expect(accepted.every((name) => !ranked.has(name))).toBe(true);
      expect(question.answers.length + accepted.length).toBeLessThanOrEqual(25);
    }
  });

  it("materializes every NFL prompt and keeps generated packs valid across a long window", () => {
    const questions = materializedNflQuestions();
    expect(questions.size).toBe(350);
    expect([...questions.keys()].sort()).toEqual(NFL_ALL.map((question) => question.id).sort());
  });

  it("supports surnames for person entities while protecting every intentional normalized collision", () => {
    for (const { pack, question } of materializedNflQuestions().values()) {
      const termOwners = new Map<string, Set<string>>();
      for (const entity of candidateEntities(pack, question)) {
        for (const term of matchTerms(entity)) {
          if (!termOwners.has(term)) termOwners.set(term, new Set());
          termOwners.get(term)!.add(entity.id);
        }
      }

      for (const [term, owners] of termOwners) {
        const match = matchFamilyFeudAnswer(pack, question, term);
        if (owners.size === 1) {
          expect(match).toMatchObject({
            status: "matched",
            entityId: [...owners][0],
          });
        } else {
          expect(match.status).toBe("ambiguous");
          if (match.status === "ambiguous") {
            expect(new Set(match.entityIds)).toEqual(owners);
          }
        }
      }
    }
  });

  it("protects Mahomes, Brady, Rice, Rodgers, and Manning surname behavior", () => {
    expect(matchedDisplayName("nfl-main-06-1", "Mahomes")).toBe("Patrick Mahomes");
    expect(matchedDisplayName("nfl-main-06-1", "Brady")).toBe("Tom Brady");
    expect(matchedDisplayName("nfl-main-06-1", "Rodgers")).toBe("Aaron Rodgers");
    expect(matchedDisplayName("nfl-main-08-1", "Rice")).toBe("Jerry Rice");

    const { pack, question } = selectedQuestion("nfl-fast5-01-1");
    const manning = matchFamilyFeudAnswer(pack, question, "Manning");
    expect(manning.status).toBe("ambiguous");
    if (manning.status === "ambiguous") {
      const names = manning.entityIds
        .map((entityId) => pack.entities.find((entity) => entity.id === entityId)?.displayName)
        .filter(Boolean)
        .sort();
      expect(names).toEqual(["Eli Manning", "Peyton Manning"]);
    }
  });

  it("accepts natural franchise shorthand without collapsing ambiguous city names", () => {
    expect(matchedDisplayName("nfl-fast1-01-1", "Cowboys")).toBe("Dallas Cowboys");
    expect(matchedDisplayName("nfl-fast1-01-1", "Dallas")).toBe("Dallas Cowboys");
    expect(matchedDisplayName("nfl-fast1-01-1", "Packers")).toBe("Green Bay Packers");
    expect(matchedDisplayName("nfl-fast1-01-1", "Green Bay")).toBe("Green Bay Packers");
    expect(matchedDisplayName("nfl-fast1-01-1", "49ers")).toBe("San Francisco 49ers");
    expect(matchedDisplayName("nfl-fast1-01-1", "Niners")).toBe("San Francisco 49ers");
    expect(matchedDisplayName("nfl-fast1-01-1", "San Francisco")).toBe("San Francisco 49ers");

    expect(matchedDisplayName("nfl-fast1-02-1", "Chiefs")).toBe("Kansas City Chiefs");
    expect(matchedDisplayName("nfl-fast1-02-1", "KC")).toBe("Kansas City Chiefs");
    expect(matchedDisplayName("nfl-fast1-02-1", "Steelers")).toBe("Pittsburgh Steelers");
    expect(matchedDisplayName("nfl-fast1-02-1", "Pittsburgh")).toBe("Pittsburgh Steelers");
    expect(matchedDisplayName("nfl-fast1-02-1", "Patriots")).toBe("New England Patriots");
    expect(matchedDisplayName("nfl-fast1-02-1", "New England")).toBe("New England Patriots");

    const { pack, question } = selectedQuestion("nfl-fast1-01-1");
    expect(matchFamilyFeudAnswer(pack, question, "New York").status).toBe("unrecognized");
  });

  it("preserves stadium, award, Draft, defensive, and offensive quick-answer shorthand", () => {
    expect(matchedDisplayName("nfl-fast3-05-1", "Chiefs")).toBe("Arrowhead Stadium");
    expect(matchedDisplayName("nfl-fast3-05-1", "Arrowhead")).toBe("Arrowhead Stadium");
    expect(matchedDisplayName("nfl-fast3-07-1", "DPOY")).toBe("Defensive Player of the Year");
    expect(matchedDisplayName("nfl-fast3-07-1", "All-Pro")).toBe("First-team All-Pro");
    expect(matchedDisplayName("nfl-fast4-03-1", "DPI")).toBe("Pass interference");
    expect(matchedDisplayName("nfl-fast4-03-1", "Unnecessary roughness")).toBe("Personal foul");
    expect(matchedDisplayName("nfl-fast4-09-1", "BPA")).toBe("Best player available");
    expect(matchedDisplayName("nfl-fast4-07-1", "Blitz")).toBe("Blitz");
    expect(matchedDisplayName("nfl-fast4-06-1", "PA")).toBe("Play-action");
    expect(matchedDisplayName("nfl-fast4-06-1", "run pass option")).toBe("RPO");
    expect(matchedDisplayName("nfl-fast4-06-1", "four verts")).toBe("Four verticals");
    expect(matchedDisplayName("nfl-fast4-01-1", "RB")).toBe("Running back");
    expect(matchedDisplayName("nfl-fast4-02-1", "TD")).toBe("Touchdown");
    expect(matchedDisplayName("nfl-fast4-02-1", "FG")).toBe("Field goal");
    expect(matchedDisplayName("nfl-fast4-02-1", "PAT")).toBe("Extra point");
    expect(matchedDisplayName("nfl-fast4-04-1", "YPA")).toBe("Yards per attempt");
    expect(matchedDisplayName("nfl-fast4-05-1", "TFL")).toBe("Tackles for loss");
  });

  it("keeps the NFL division universe exact and Fast Money answers easy to enter", () => {
    const divisions = NFL_FAST.find((question) => question.id === "nfl-fast4-10-1");
    expect(divisions).toBeDefined();
    expect(divisions?.answers.map((answer) => answer.name)).toEqual([
      "AFC East",
      "AFC North",
      "AFC South",
      "AFC West",
      "NFC East",
      "NFC North",
      "NFC South",
      "NFC West",
    ]);
    expect(divisions?.alsoAcceptedAnswers ?? []).toEqual([]);

    for (const question of NFL_FAST) {
      const { pack, question: materialized } = selectedQuestion(question.id);
      for (const answer of materialized.answers) {
        const entity = pack.entities.find((candidate) => candidate.id === answer.entityId)!;
        expect(matchFamilyFeudAnswer(pack, materialized, entity.displayName))
          .toMatchObject({ status: "matched", entityId: entity.id });
      }
    }
  });

  it("leaves the September 23 Football Daily routed to CFB", () => {
    expect(footballSportsFeudDomainForDay("2026-09-23")).toBe("cfb");
  });
});
