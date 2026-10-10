import { describe, expect, it } from "vitest";
import {
  assertFamilyFeudPack,
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  matchFamilyFeudAnswer,
  normalizeFamilyFeudInput,
  submitFamilyFeudMainAnswer,
} from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";
import { UFC_SPORTS_FEUD_SEP24_PROTOTYPE } from "./ufcSportsFeudSep24Prototype";
import {
  buildSportsFeudPack,
  sportsFeudQuestionIdsForDay,
} from "./sportsFeudDailyBanks";
import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

const UFC_FAST = [
  ...UFC_SPORTS_FEUD_FAST_1,
  ...UFC_SPORTS_FEUD_FAST_2,
  ...UFC_SPORTS_FEUD_FAST_3,
  ...UFC_SPORTS_FEUD_FAST_4,
  ...UFC_SPORTS_FEUD_FAST_5,
];
const UFC_ALL = [...UFC_SPORTS_FEUD_MAIN, ...UFC_FAST];

function addDays(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function answerNames(question: SportsFeudAuthoredQuestion) {
  return [
    ...question.answers.map((answer) => answer.name),
    ...(question.alsoAcceptedAnswers ?? []).map((answer) => answer.name),
  ];
}

function authoredQuestion(id: string) {
  const question = UFC_ALL.find((row) => row.id === id);
  expect(question).toBeDefined();
  return question!;
}

let materialized:
  | Map<string, { pack: ReturnType<typeof buildSportsFeudPack>; questionId: string }>
  | null = null;

function materializedQuestions() {
  if (materialized) return materialized;
  materialized = new Map();
  for (let offset = 0; offset < 500; offset += 1) {
    const pack = buildSportsFeudPack("ufc", addDays("2026-09-23", offset));
    for (const question of [...pack.mainBoards, ...pack.fastMoney]) {
      if (!materialized.has(question.id)) {
        materialized.set(question.id, { pack, questionId: question.id });
      }
    }
  }
  return materialized;
}

function materializedQuestion(id: string) {
  const row = materializedQuestions().get(id);
  expect(row).toBeDefined();
  const question = [...row!.pack.mainBoards, ...row!.pack.fastMoney].find(
    (candidate) => candidate.id === row!.questionId,
  );
  expect(question).toBeDefined();
  return { pack: row!.pack, question: question! };
}

function matchedDisplayName(id: string, input: string) {
  const { pack, question } = materializedQuestion(id);
  const match = matchFamilyFeudAnswer(pack, question, input);
  expect(match.status).toBe("matched");
  if (match.status !== "matched") return null;
  return pack.entities.find((entity) => entity.id === match.entityId)?.displayName ?? null;
}

describe("UFC Sports Feud answer-acceptance hardening", () => {
  it("keeps the full UFC authored bank explicit and eight-ranked", () => {
    expect(UFC_SPORTS_FEUD_MAIN).toHaveLength(100);
    expect(UFC_FAST).toHaveLength(250);
    expect(UFC_ALL).toHaveLength(350);
    expect(new Set(UFC_ALL.map((question) => question.id)).size).toBe(350);

    for (const question of UFC_ALL) {
      expect(["person", "team", "school", "other"]).toContain(question.entityKind);
      expect(question.answers).toHaveLength(8);
      expect(new Set(question.answers.map((answer) =>
        normalizeFamilyFeudInput(answer.name))).size).toBe(8);
    }
  });

  it("types every audited person-oriented UFC family as people", () => {
    const personFamilies = new Set([
      ...Array.from({ length: 11 }, (_value, index) =>
        `ufc-main-${String(index + 1).padStart(2, "0")}`),
      "ufc-main-20",
      ...Array.from({ length: 9 }, (_value, index) =>
        `ufc-fast1-${String(index + 2).padStart(2, "0")}`),
      ...Array.from({ length: 10 }, (_value, index) =>
        `ufc-fast2-${String(index + 1).padStart(2, "0")}`),
      "ufc-fast3-01",
      "ufc-fast3-02",
      "ufc-fast3-05",
      "ufc-fast3-06",
      "ufc-fast3-07",
      "ufc-fast3-08",
      "ufc-fast3-09",
      ...Array.from({ length: 10 }, (_value, index) =>
        `ufc-fast5-${String(index + 1).padStart(2, "0")}`),
    ]);

    const clearlyPerson = UFC_ALL.filter((question) =>
      personFamilies.has(question.id.slice(0, question.id.lastIndexOf("-"))));
    expect(clearlyPerson).toHaveLength(240);
    for (const question of clearlyPerson) {
      expect(question.entityKind, `${question.id}: ${question.prompt}`).toBe("person");
    }
  });

  it("keeps off-board answers distinct from ranked answers and explicit aliases unique", () => {
    for (const question of UFC_ALL) {
      const ranked = new Set(question.answers.map((answer) =>
        normalizeFamilyFeudInput(answer.name)));
      const accepted = question.alsoAcceptedAnswers ?? [];

      for (const answer of accepted) {
        expect(
          ranked.has(normalizeFamilyFeudInput(answer.name)),
          `${question.id} duplicates ranked answer ${answer.name}`,
        ).toBe(false);
      }

      const terms = new Map<string, string>();
      for (const answer of [...question.answers, ...accepted]) {
        for (const raw of [answer.name, ...(answer.aliases ?? [])]) {
          const term = normalizeFamilyFeudInput(raw);
          const prior = terms.get(term);
          expect(
            prior == null || prior === answer.name,
            `${question.id} alias "${raw}" collides between ${prior} and ${answer.name}`,
          ).toBe(true);
          terms.set(term, answer.name);
        }
      }
    }
  });

  it("materializes every authored UFC question plus the isolated Sept. 24 prototype", () => {
    const selected = materializedQuestions();
    const prototypeIds = new Set([
      ...UFC_SPORTS_FEUD_SEP24_PROTOTYPE.main,
      ...UFC_SPORTS_FEUD_SEP24_PROTOTYPE.fastMoney,
    ].map((question) => question.id));
    expect(selected.size).toBe(UFC_ALL.length + prototypeIds.size);
    for (const id of prototypeIds) expect(selected.has(id), id).toBe(true);

    for (const authored of UFC_ALL) {
      const { pack, question } = materializedQuestion(authored.id);
      const candidates = question.candidateIds.map((entityId) =>
        pack.entities.find((entity) => entity.id === entityId)!);
      const aliasOwners = new Map<string, string>();
      for (const entity of candidates) {
        for (const raw of [entity.displayName, ...(entity.aliases ?? [])]) {
          const term = normalizeFamilyFeudInput(raw);
          const prior = aliasOwners.get(term);
          expect(
            prior == null || prior === entity.id,
            `${authored.id} materialized alias "${raw}" collides across entities`,
          ).toBe(true);
          aliasOwners.set(term, entity.id);
        }
      }
    }

    for (const authored of UFC_ALL.filter((question) => question.entityKind === "person")) {
      const { pack, question } = materializedQuestion(authored.id);
      const candidates = question.candidateIds.map((entityId) =>
        pack.entities.find((entity) => entity.id === entityId)!);
      const surnameCounts = new Map<string, number>();
      for (const entity of candidates) {
        const tokens = normalizeFamilyFeudInput(entity.displayName).split(" ").filter(Boolean);
        const surname = tokens.at(-1)!;
        surnameCounts.set(surname, (surnameCounts.get(surname) ?? 0) + 1);
      }

      for (const entity of candidates) {
        const tokens = normalizeFamilyFeudInput(entity.displayName).split(" ").filter(Boolean);
        const surname = tokens.at(-1)!;
        if (surnameCounts.get(surname) !== 1) continue;
        const match = matchFamilyFeudAnswer(pack, question, surname);
        expect(match, `${authored.id} should accept unique surname ${surname}`)
          .toMatchObject({ status: "matched", entityId: entity.id });
      }
    }
  });

  it("accepts Stipe, submission specialists, and minor Khabib misspellings fairly", () => {
    expect(matchedDisplayName("ufc-main-10-1", "Miocic")).toBe("Stipe Miocic");
    expect(matchedDisplayName("ufc-main-10-1", "Stipe")).toBe("Stipe Miocic");

    for (const id of ["ufc-main-03-1", "ufc-fast1-08-1"]) {
      expect(answerNames(authoredQuestion(id))).toContain("Khabib Nurmagomedov");
      expect(answerNames(authoredQuestion(id))).toContain("Jim Miller");
      expect(matchedDisplayName(id, "Khabib")).toBe("Khabib Nurmagomedov");
      expect(matchedDisplayName(id, "Kabib")).toBe("Khabib Nurmagomedov");
      expect(matchedDisplayName(id, "Miller")).toBe("Jim Miller");
    }
  });

  it("accepts unambiguous UFC commentator and referee surnames", () => {
    for (const [input, expected] of [
      ["Rogan", "Joe Rogan"],
      ["Anik", "Jon Anik"],
      ["Cormier", "Daniel Cormier"],
      ["Bisping", "Michael Bisping"],
    ] as const) {
      expect(matchedDisplayName("ufc-fast3-08-1", input)).toBe(expected);
    }

    for (const [input, expected] of [
      ["Dean", "Herb Dean"],
      ["McCarthy", "John McCarthy"],
      ["Goddard", "Marc Goddard"],
      ["Herzog", "Jason Herzog"],
    ] as const) {
      expect(matchedDisplayName("ufc-fast3-09-1", input)).toBe(expected);
    }
  });

  it("treats venue prompts as arena/host-city/site questions and accepts Las Vegas intentionally", () => {
    for (const id of ["ufc-main-15-1", "ufc-fast3-10-1"]) {
      const authored = authoredQuestion(id);
      expect(authored.prompt.toLowerCase()).toContain("host city");
      expect(authored.alsoAcceptedAnswers?.map((answer) => answer.name)).toContain("Las Vegas");
      expect(matchedDisplayName(id, "Las Vegas")).toBe("Las Vegas");
    }

    const { pack, question } = materializedQuestion("ufc-main-15-1");
    const state = {
      phase: "main" as const,
      mainBoardIndex: pack.mainBoards.findIndex((row) => row.id === question.id),
      mainBoards: pack.mainBoards.map(() => ({
        revealedEntityIds: [],
        submittedEntityIds: [],
        submittedUnrecognized: [],
        strikes: 0,
      })),
      fastMoneyIndex: 0,
      fastMoneyResults: [],
      fastMoneyTimeRemainingMs: FAMILY_FEUD_FAST_MONEY_TIME_MS,
    };
    const transition = submitFamilyFeudMainAnswer(pack, state, "Las Vegas");
    expect(transition.outcome.type).toBe("board-also-accepted");
    expect(transition.state.mainBoards[state.mainBoardIndex]?.strikes).toBe(0);
  });

  it("preserves UFC shorthand and prior quick-answer fixes", () => {
    expect(matchedDisplayName("ufc-fast1-03-1", "GSP")).toBe("Georges St-Pierre");
    expect(matchedDisplayName("ufc-fast1-05-1", "DC")).toBe("Daniel Cormier");
    expect(matchedDisplayName("ufc-fast4-01-1", "KO")).toBe("Knockout");
    expect(matchedDisplayName("ufc-fast4-01-1", "TKO")).toBe("TKO");
    expect(matchedDisplayName("ufc-fast4-01-1", "DQ")).toBe("Disqualification");
    expect(matchedDisplayName("ufc-fast4-02-1", "RNC")).toBe("Rear-naked choke");
    expect(matchedDisplayName("ufc-fast4-05-1", "GNP")).toBe("Ground-and-pound");
    expect(matchedDisplayName("ufc-fast4-06-1", "low blow")).toBe("Groin strike");
    expect(matchedDisplayName("ufc-fast4-06-1", "cage grab")).toBe("Fence grab");
    expect(matchedDisplayName("ufc-fast4-07-1", "significant strikes")).toBe("Effective striking");
    expect(matchedDisplayName("ufc-fast4-10-1", "coaching")).toBe("Give instructions");
  });

  it("keeps ambiguous short forms ambiguous", () => {
    const { pack, question } = materializedQuestion("ufc-fast2-08-1");
    const match = matchFamilyFeudAnswer(pack, question, "Nurmagomedov");
    expect(match.status).toBe("ambiguous");
  });

  it("builds valid UFC packs across a long date window", () => {
    for (let offset = 0; offset < 2_000; offset += 1) {
      expect(() =>
        assertFamilyFeudPack(buildSportsFeudPack("ufc", addDays("2026-09-23", offset))),
      ).not.toThrow();
    }
  });

  it("keeps Fast Money at 50 seconds and leaves the Sept. 23 Daily selection intact", () => {
    expect(FAMILY_FEUD_FAST_MONEY_TIME_MS).toBe(50_000);
    expect(sportsFeudQuestionIdsForDay("ufc", "2026-09-23")).toEqual({
      main: ["ufc-main-03-1", "ufc-main-10-3"],
      fastMoney: [
        "ufc-fast3-10-1",
        "ufc-fast4-09-3",
        "ufc-fast5-08-5",
        "ufc-fast2-07-4",
        "ufc-fast3-07-1",
      ],
    });
  });
});
