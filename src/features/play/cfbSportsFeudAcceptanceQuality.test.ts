import { describe, expect, it } from "vitest";
import {
  assertFamilyFeudPack,
  matchFamilyFeudAnswer,
  normalizeFamilyFeudInput,
  type FamilyFeudPack,
  type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { CFB_SPORTS_FEUD_MAIN } from "./cfbSportsFeudMain";
import { CFB_SPORTS_FEUD_FAST_1 } from "./cfbSportsFeudFast1";
import { CFB_SPORTS_FEUD_FAST_2 } from "./cfbSportsFeudFast2";
import { CFB_SPORTS_FEUD_FAST_3 } from "./cfbSportsFeudFast3";
import { CFB_SPORTS_FEUD_FAST_4 } from "./cfbSportsFeudFast4";
import { CFB_SPORTS_FEUD_FAST_5 } from "./cfbSportsFeudFast5";
import {
  buildSportsFeudPack,
  sportsFeudQuestionIdsForDay,
} from "./sportsFeudDailyBanks";
import type {
  SportsFeudAuthoredAnswer,
  SportsFeudAuthoredQuestion,
} from "./sportsFeudBankTypes";

const CFB_FAST = [
  ...CFB_SPORTS_FEUD_FAST_1,
  ...CFB_SPORTS_FEUD_FAST_2,
  ...CFB_SPORTS_FEUD_FAST_3,
  ...CFB_SPORTS_FEUD_FAST_4,
  ...CFB_SPORTS_FEUD_FAST_5,
];
const CFB_ALL = [...CFB_SPORTS_FEUD_MAIN, ...CFB_FAST];

function candidates(question: SportsFeudAuthoredQuestion) {
  return [...question.answers, ...(question.alsoAcceptedAnswers ?? [])];
}

function authoredQuestion(id: string) {
  const question = CFB_ALL.find((row) => row.id === id);
  expect(question, id).toBeDefined();
  return question!;
}

function materializeForMatch(question: SportsFeudAuthoredQuestion) {
  const rows = candidates(question);
  const entities = rows.map((answer, index) => ({
    id: `${question.id}:qa-${index + 1}`,
    displayName: answer.name,
    kind: question.entityKind,
    aliases: answer.aliases,
  }));
  const rankedIds = entities.slice(0, question.answers.length).map((entity) => entity.id);
  const alsoAcceptedEntityIds = entities.slice(question.answers.length).map((entity) => entity.id);
  const runtimeQuestion: FamilyFeudQuestion = {
    id: question.id,
    prompt: question.prompt,
    candidateIds: entities.map((entity) => entity.id),
    answers: rankedIds.map((entityId, index) => ({
      entityId,
      points: 8 - index,
    })),
    ...(alsoAcceptedEntityIds.length ? { alsoAcceptedEntityIds } : {}),
  };
  const pack: FamilyFeudPack = {
    id: "cfb-acceptance-quality",
    sport: "football",
    entities,
    mainBoards: [],
    fastMoney: [],
  };
  return { pack, runtimeQuestion };
}

function matchName(question: SportsFeudAuthoredQuestion, input: string) {
  const { pack, runtimeQuestion } = materializeForMatch(question);
  const match = matchFamilyFeudAnswer(pack, runtimeQuestion, input);
  expect(match.status, `${question.id} should recognize "${input}"`).toBe("matched");
  if (match.status !== "matched") return null;
  return {
    name: pack.entities.find((entity) => entity.id === match.entityId)?.displayName ?? null,
    kind: match.kind,
  };
}

function firstName(answer: SportsFeudAuthoredAnswer) {
  const tokens = normalizeFamilyFeudInput(answer.name).split(" ").filter(Boolean);
  const first = tokens[0] ?? "";
  return first === "the" ? "" : first;
}

function surname(answer: SportsFeudAuthoredAnswer) {
  const tokens = normalizeFamilyFeudInput(answer.name).split(" ").filter(Boolean);
  while (
    tokens.length > 1
    && ["jr", "sr", "ii", "iii", "iv", "v"].includes(tokens[tokens.length - 1]!)
  ) {
    tokens.pop();
  }
  return tokens.at(-1) ?? "";
}

function addDays(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

describe("CFB Sports Feud answer-acceptance quality", () => {
  it("keeps all 350 CFB prompts explicitly typed with exactly eight ranked answers", () => {
    expect(CFB_SPORTS_FEUD_MAIN).toHaveLength(100);
    expect(CFB_FAST).toHaveLength(250);
    expect(CFB_ALL).toHaveLength(350);

    for (const question of CFB_ALL) {
      expect(["person", "team", "school", "other"]).toContain(question.entityKind);
      expect(question.answers, question.id).toHaveLength(8);
    }
  });

  it("keeps authored aliases collision-free and off-board answers distinct from ranked answers", () => {
    for (const question of CFB_ALL) {
      const ranked = new Set(question.answers.map((answer) => normalizeFamilyFeudInput(answer.name)));
      for (const answer of question.alsoAcceptedAnswers ?? []) {
        expect(ranked.has(normalizeFamilyFeudInput(answer.name)), question.id).toBe(false);
      }

      const owners = new Map<string, Set<string>>();
      for (const answer of candidates(question)) {
        for (const term of [answer.name, ...(answer.aliases ?? [])]) {
          const normalized = normalizeFamilyFeudInput(term);
          if (!normalized) continue;
          const names = owners.get(normalized) ?? new Set<string>();
          names.add(answer.name);
          owners.set(normalized, names);
        }
      }
      for (const [term, names] of owners) {
        expect(
          names.size,
          `${question.id} maps "${term}" to ${[...names].join(", ")}`,
        ).toBe(1);
      }
    }
  });

  it("supports unique person short names while preserving first-name/surname ambiguity", () => {
    const personQuestions = CFB_ALL.filter((question) => question.entityKind === "person");
    expect(personQuestions.length).toBeGreaterThan(0);

    for (const question of personQuestions) {
      const rows = candidates(question);
      const byFirst = new Map<string, SportsFeudAuthoredAnswer[]>();
      const bySurname = new Map<string, SportsFeudAuthoredAnswer[]>();
      for (const answer of rows) {
        const first = firstName(answer);
        if (first) {
          const group = byFirst.get(first) ?? [];
          group.push(answer);
          byFirst.set(first, group);
        }
        const last = surname(answer);
        if (last) {
          const group = bySurname.get(last) ?? [];
          group.push(answer);
          bySurname.set(last, group);
        }
      }

      let unambiguousCount = 0;
      const { pack, runtimeQuestion } = materializeForMatch(question);
      for (const answer of rows) {
        for (const [kind, key] of [
          ["first-name", firstName(answer)],
          ["surname", surname(answer)],
        ] as const) {
          if (!key) continue;
          const owners = new Set([
            ...(byFirst.get(key) ?? []),
            ...(bySurname.get(key) ?? []),
          ].map((row) => row.name));
          const match = matchFamilyFeudAnswer(pack, runtimeQuestion, key);
          if (owners.size === 1) {
            unambiguousCount += 1;
            expect(match, question.id + " " + kind + " " + key).toMatchObject({
              status: "matched",
            });
          } else {
            expect(match, question.id + " short-name " + key + " should stay ambiguous").toMatchObject({
              status: "ambiguous",
            });
          }
        }
      }
      expect(unambiguousCount, question.id).toBeGreaterThan(0);
    }
  });
  it("keeps subjective Main prompts independently ranked instead of collapsing to family copies", () => {
    const subjectiveFamilies = [1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    for (const family of subjectiveFamilies) {
      const prefix = `cfb-main-${String(family).padStart(2, "0")}-`;
      const rows = CFB_SPORTS_FEUD_MAIN.filter((question) => question.id.startsWith(prefix));
      expect(rows, prefix).toHaveLength(5);
      const signatures = new Set(rows.map((question) =>
        candidates(question).map((answer) => normalizeFamilyFeudInput(answer.name)).join("|")
      ));
      expect(signatures.size, prefix).toBeGreaterThan(1);
    }
  });

  it("resolves Saban and natural school shorthand", () => {
    expect(matchName(authoredQuestion("cfb-main-09-1"), "Saban")).toEqual({
      name: "Nick Saban",
      kind: "surname",
    });
    expect(matchName(authoredQuestion("cfb-main-06-1"), "Mendoza")?.name).toBe("Fernando Mendoza");
    expect(matchName(authoredQuestion("cfb-main-18-3"), "FB")?.name).toBe("Fullback");

    expect(matchName(authoredQuestion("cfb-main-01-2"), "Bama")?.name).toBe("Alabama");
    expect(matchName(authoredQuestion("cfb-fast1-01-1"), "Bama")?.name).toBe("Alabama");
    expect(matchName(authoredQuestion("cfb-fast1-01-1"), "UGA")?.name).toBe("Georgia");
    expect(matchName(authoredQuestion("cfb-fast1-02-1"), "OSU")?.name).toBe("Ohio State");
    expect(matchName(authoredQuestion("cfb-fast1-01-1"), "Longhorns")?.name).toBe("Texas");
    expect(matchName(authoredQuestion("cfb-fast1-01-1"), "OU")?.name).toBe("Oklahoma");
    expect(matchName(authoredQuestion("cfb-fast1-04-1"), "The U")?.name).toBe("Miami");
  });

  it("tightens broad school-star prompts and recognizes obvious off-board program stars", () => {
    const schoolStars = CFB_FAST.filter((question) => question.category === "school-stars");
    expect(schoolStars).toHaveLength(50);
    for (const question of schoolStars) {
      expect(question.prompt, question.id).toMatch(/2000/);
      expect(question.alsoAcceptedAnswers?.length ?? 0, question.id).toBeGreaterThan(0);
    }

    expect(matchName(authoredQuestion("cfb-fast2-01-1"), "Milroe")?.name).toBe("Jalen Milroe");
    expect(matchName(authoredQuestion("cfb-fast2-07-1"), "Peppers")?.name).toBe("Jabrill Peppers");
    expect(matchName(authoredQuestion("cfb-fast2-08-1"), "Hamilton")?.name).toBe("Kyle Hamilton");
    expect(matchName(authoredQuestion("cfb-fast2-09-1"), "Green")?.name).toBe("A.J. Green");
    expect(matchName(authoredQuestion("cfb-fast2-10-1"), "Boyd")?.name).toBe("Tajh Boyd");
  });

  it("keeps stadium, award, conference, offense, recruiting, and defense shorthand natural", () => {
    expect(matchName(authoredQuestion("cfb-main-12-1"), "Neyland")?.name).toBe("Tennessee");
    expect(matchName(authoredQuestion("cfb-main-12-1"), "Big House")?.name).toBe("Michigan");
    expect(matchName(authoredQuestion("cfb-fast3-05-1"), "Tennessee")?.name).toBe("Neyland Stadium");
    expect(matchName(authoredQuestion("cfb-fast3-05-1"), "Horseshoe")?.name).toBe("Ohio Stadium");
    expect(matchName(authoredQuestion("cfb-fast3-05-1"), "Big House")?.name).toBe("Michigan Stadium");

    expect(matchName(authoredQuestion("cfb-fast3-08-1"), "Heisman")?.name).toBe("Heisman Trophy");
    expect(matchName(authoredQuestion("cfb-fast3-08-1"), "OBrien")?.name).toBe("Davey O'Brien Award");
    expect(matchName(authoredQuestion("cfb-fast3-08-1"), "Mackey")?.name).toBe("John Mackey Award");

    expect(matchName(authoredQuestion("cfb-fast3-09-1"), "B1G")?.name).toBe("Big Ten");
    expect(matchName(authoredQuestion("cfb-fast3-09-1"), "C-USA")?.name).toBe("Conference USA");
    expect(matchName(authoredQuestion("cfb-fast3-09-1"), "Mid-American Conference")?.name).toBe("MAC");

    expect(matchName(authoredQuestion("cfb-fast4-06-1"), "four verts")?.name).toBe("Four verticals");
    expect(matchName(authoredQuestion("cfb-fast4-06-1"), "spread")?.name).toBe("Spread offense");
    expect(matchName(authoredQuestion("cfb-fast4-06-1"), "IZ")?.name).toBe("Inside zone");

    expect(matchName(authoredQuestion("cfb-fast4-08-1"), "Portal")?.name).toBe("Transfer portal");
    expect(matchName(authoredQuestion("cfb-fast4-08-1"), "NSD")?.name).toBe("Signing day");
    expect(matchName(authoredQuestion("cfb-fast4-08-1"), "PWO")?.name).toBe("Preferred walk-on");
    expect(matchName(authoredQuestion("cfb-fast4-08-1"), "5-star")?.name).toBe("Five-star");

    expect(matchName(authoredQuestion("cfb-fast4-07-1"), "Blitz")?.name).toBe("Blitz");
    expect(matchName(authoredQuestion("cfb-fast4-07-1"), "Cover 4")?.name).toBe("Quarters");
    expect(matchName(authoredQuestion("cfb-fast4-07-1"), "QB spy")?.name).toBe("Spy");
  });

  it("keeps accepted universes wording-driven and Fast Money quick-answer friendly", () => {
    for (const question of CFB_FAST) {
      expect(question.prompt.length, question.id).toBeLessThanOrEqual(100);
      expect(question.prompt, question.id).not.toMatch(/explain|describe why|give a reason/i);
    }
  });

  it("builds valid CFB packs across a three-year window", () => {
    for (let offset = 0; offset < 1_095; offset += 1) {
      expect(() =>
        assertFamilyFeudPack(buildSportsFeudPack("cfb", addDays("2026-09-23", offset)))
      ).not.toThrow();
    }
  });

  it("preserves the Sept. 23 CFB source selection identity", () => {
    expect(sportsFeudQuestionIdsForDay("cfb", "2026-09-23")).toEqual({
      main: ["cfb-main-15-2", "cfb-main-02-4"],
      fastMoney: [
        "cfb-fast5-10-2",
        "cfb-fast1-09-4",
        "cfb-fast2-09-1",
        "cfb-fast3-08-3",
        "cfb-fast4-07-5",
      ],
    });
  });
});
