import { describe, expect, it } from "vitest";
import {
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  matchFamilyFeudAnswer,
  normalizeFamilyFeudInput,
  type FamilyFeudEntity,
  type FamilyFeudPack,
  type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { CFB_SPORTS_FEUD_MAIN } from "./cfbSportsFeudMain";
import { CFB_SPORTS_FEUD_FAST_1 } from "./cfbSportsFeudFast1";
import { CFB_SPORTS_FEUD_FAST_2 } from "./cfbSportsFeudFast2";
import { CFB_SPORTS_FEUD_FAST_3 } from "./cfbSportsFeudFast3";
import { CFB_SPORTS_FEUD_FAST_4 } from "./cfbSportsFeudFast4";
import { CFB_SPORTS_FEUD_FAST_5 } from "./cfbSportsFeudFast5";
import { NFL_SPORTS_FEUD_MAIN } from "./nflSportsFeudMain";
import { NFL_SPORTS_FEUD_FAST_1 } from "./nflSportsFeudFast1";
import { NFL_SPORTS_FEUD_FAST_2 } from "./nflSportsFeudFast2";
import { NFL_SPORTS_FEUD_FAST_3 } from "./nflSportsFeudFast3";
import { NFL_SPORTS_FEUD_FAST_4 } from "./nflSportsFeudFast4";
import { NFL_SPORTS_FEUD_FAST_5 } from "./nflSportsFeudFast5";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";
import type {
  SportsFeudAuthoredAnswer,
  SportsFeudAuthoredQuestion,
} from "./sportsFeudBankTypes";

type Domain = "ufc" | "cfb" | "nfl";
type DomainBank = {
  main: readonly SportsFeudAuthoredQuestion[];
  fast: readonly SportsFeudAuthoredQuestion[];
};

const UFC_FAST = [
  ...UFC_SPORTS_FEUD_FAST_1,
  ...UFC_SPORTS_FEUD_FAST_2,
  ...UFC_SPORTS_FEUD_FAST_3,
  ...UFC_SPORTS_FEUD_FAST_4,
  ...UFC_SPORTS_FEUD_FAST_5,
];
const CFB_FAST = [
  ...CFB_SPORTS_FEUD_FAST_1,
  ...CFB_SPORTS_FEUD_FAST_2,
  ...CFB_SPORTS_FEUD_FAST_3,
  ...CFB_SPORTS_FEUD_FAST_4,
  ...CFB_SPORTS_FEUD_FAST_5,
];
const NFL_FAST = [
  ...NFL_SPORTS_FEUD_FAST_1,
  ...NFL_SPORTS_FEUD_FAST_2,
  ...NFL_SPORTS_FEUD_FAST_3,
  ...NFL_SPORTS_FEUD_FAST_4,
  ...NFL_SPORTS_FEUD_FAST_5,
];

const BANKS: Record<Domain, DomainBank> = {
  ufc: { main: UFC_SPORTS_FEUD_MAIN, fast: UFC_FAST },
  cfb: { main: CFB_SPORTS_FEUD_MAIN, fast: CFB_FAST },
  nfl: { main: NFL_SPORTS_FEUD_MAIN, fast: NFL_FAST },
};

const RANKED_ONLY_FAMILY_REASONS: Readonly<Record<string, string>> = {
  "cfb-main-05": "The prompts explicitly ask for the traditional eight college football blue-blood programs.",
  "cfb-fast4-09": "This family is intentionally bounded to eight canonical modern postseason stage/game labels.",
  "nfl-fast4-10": "The NFL has exactly eight divisions, all eight of which are ranked answers.",
};

function familyId(id: string) {
  return id.replace(/-\d+$/, "");
}

function candidateAnswers(question: SportsFeudAuthoredQuestion) {
  return [...question.answers, ...(question.alsoAcceptedAnswers ?? [])];
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

function materializeForGuard(domain: Domain, question: SportsFeudAuthoredQuestion) {
  const authored = candidateAnswers(question);
  const entities: FamilyFeudEntity[] = authored.map((answer, index) => ({
    id: `${question.id}:guard-${index + 1}`,
    displayName: answer.name,
    kind: question.entityKind,
    ...(answer.aliases?.length ? { aliases: [...answer.aliases] } : {}),
  }));
  const ranked = entities.slice(0, question.answers.length);
  const alsoAccepted = entities.slice(question.answers.length);
  const runtimeQuestion: FamilyFeudQuestion = {
    id: question.id,
    prompt: question.prompt,
    candidateIds: entities.map((entity) => entity.id),
    answers: ranked.map((entity, index) => ({ entityId: entity.id, points: 8 - index })),
    ...(alsoAccepted.length
      ? { alsoAcceptedEntityIds: alsoAccepted.map((entity) => entity.id) }
      : {}),
  };
  const pack: FamilyFeudPack = {
    id: `sports-feud-global-guard-${domain}`,
    sport: domain === "ufc" ? "ufc" : "football",
    entities,
    mainBoards: [],
    fastMoney: [],
  };
  return { pack, runtimeQuestion };
}

describe("Sports Feud global semantic guard", () => {
  it("locks the exact 1,050-prompt bank shape", () => {
    const allIds: string[] = [];
    const allFamilies = new Set<string>();

    for (const domain of Object.keys(BANKS) as Domain[]) {
      const bank = BANKS[domain];
      expect(bank.main, `${domain} main count`).toHaveLength(100);
      expect(bank.fast, `${domain} Fast Money count`).toHaveLength(250);
      const all = [...bank.main, ...bank.fast];
      expect(all, `${domain} total count`).toHaveLength(350);
      for (const question of all) {
        allIds.push(question.id);
        allFamilies.add(familyId(question.id));
      }
    }

    expect(allIds).toHaveLength(1_050);
    expect(new Set(allIds).size).toBe(1_050);
    expect(allFamilies.size).toBe(210);
  });

  it("requires explicit type, eight ranked answers, and curated valid universes", () => {
    const rankedOnlyFamilies = new Set<string>();

    for (const domain of Object.keys(BANKS) as Domain[]) {
      for (const question of [...BANKS[domain].main, ...BANKS[domain].fast]) {
        expect(["person", "team", "school", "other"], question.id).toContain(question.entityKind);
        expect(question.answers, question.id).toHaveLength(8);

        const ranked = question.answers.map((answer) => normalizeFamilyFeudInput(answer.name));
        const accepted = (question.alsoAcceptedAnswers ?? []).map((answer) =>
          normalizeFamilyFeudInput(answer.name));

        expect(new Set(ranked).size, `${question.id} ranked answers`).toBe(8);
        expect(new Set(accepted).size, `${question.id} off-board answers`).toBe(accepted.length);
        expect(
          accepted.some((name) => ranked.includes(name)),
          `${question.id} ranked/off-board overlap`,
        ).toBe(false);

        const universeSize = question.answers.length + accepted.length;
        expect(universeSize, `${question.id} candidate universe`).toBeLessThanOrEqual(25);
        if (accepted.length === 0) rankedOnlyFamilies.add(familyId(question.id));
      }
    }

    expect([...rankedOnlyFamilies].sort()).toEqual(
      Object.keys(RANKED_ONLY_FAMILY_REASONS).sort(),
    );
    for (const [id, reason] of Object.entries(RANKED_ONLY_FAMILY_REASONS)) {
      expect(reason.length, `${id} ranked-only reason`).toBeGreaterThan(20);
    }
  });

  it("keeps canonical names and explicit aliases unique within every question", () => {
    for (const domain of Object.keys(BANKS) as Domain[]) {
      for (const question of [...BANKS[domain].main, ...BANKS[domain].fast]) {
        const owners = new Map<string, Set<string>>();
        for (const answer of candidateAnswers(question)) {
          for (const raw of [answer.name, ...(answer.aliases ?? [])]) {
            const term = normalizeFamilyFeudInput(raw);
            expect(term, `${question.id} empty alias`).not.toBe("");
            const names = owners.get(term) ?? new Set<string>();
            names.add(answer.name);
            owners.set(term, names);
          }
        }
        for (const [term, names] of owners) {
          expect(
            names.size,
            `${question.id} maps "${term}" to ${[...names].join(", ")}`,
          ).toBe(1);
        }
      }
    }
  });

  it("accepts unique person short names while preserving first-name/surname ambiguity", () => {
    for (const domain of Object.keys(BANKS) as Domain[]) {
      const people = [...BANKS[domain].main, ...BANKS[domain].fast]
        .filter((question) => question.entityKind === "person");

      for (const question of people) {
        const rows = candidateAnswers(question);
        const byFirstName = new Map<string, SportsFeudAuthoredAnswer[]>();
        const bySurname = new Map<string, SportsFeudAuthoredAnswer[]>();
        for (const answer of rows) {
          const first = firstName(answer);
          if (first) {
            const group = byFirstName.get(first) ?? [];
            group.push(answer);
            byFirstName.set(first, group);
          }
          const last = surname(answer);
          if (last) {
            const group = bySurname.get(last) ?? [];
            group.push(answer);
            bySurname.set(last, group);
          }
        }

        const { pack, runtimeQuestion } = materializeForGuard(domain, question);
        for (const answer of rows) {
          const terms = [
            ["first-name", firstName(answer)],
            ["surname", surname(answer)],
          ] as const;
          for (const [kind, key] of terms) {
            if (!key) continue;
            const owners = new Set([
              ...(byFirstName.get(key) ?? []),
              ...(bySurname.get(key) ?? []),
            ].map((row) => row.name));
            const match = matchFamilyFeudAnswer(pack, runtimeQuestion, key);
            if (owners.size === 1) {
              expect(match, question.id + " " + kind + " " + key).toMatchObject({
                status: "matched",
              });
            } else {
              expect(match, question.id + " short-name " + key + " ambiguity").toMatchObject({
                status: "ambiguous",
              });
            }
          }
        }
      }
    }
  });

  it("keeps family type/category alignment stable across all five prompt variants", () => {
    const families = new Map<string, SportsFeudAuthoredQuestion[]>();
    for (const domain of Object.keys(BANKS) as Domain[]) {
      for (const question of [...BANKS[domain].main, ...BANKS[domain].fast]) {
        const id = familyId(question.id);
        const rows = families.get(id) ?? [];
        rows.push(question);
        families.set(id, rows);
      }
    }

    expect(families.size).toBe(210);
    for (const [id, rows] of families) {
      expect(rows, id).toHaveLength(5);
      expect(new Set(rows.map((row) => row.entityKind)).size, `${id} entity type`).toBe(1);
      expect(new Set(rows.map((row) => row.category)).size, `${id} category`).toBe(1);
    }
  });

  it("keeps every Fast Money prompt quick-answer friendly", () => {
    for (const domain of Object.keys(BANKS) as Domain[]) {
      for (const question of BANKS[domain].fast) {
        expect(question.prompt.length, question.id).toBeLessThanOrEqual(100);
        expect(question.prompt, question.id).not.toMatch(
          /explain|describe why|give a reason|justify your answer/i,
        );
      }
    }
  });

  it("locks ranked scoring and the 50-second Fast Money clock", () => {
    expect(FAMILY_FEUD_FAST_MONEY_TIME_MS).toBe(50_000);

    for (const domain of Object.keys(BANKS) as Domain[]) {
      const pack = buildSportsFeudPack(domain, "2026-10-15");
      expect(pack.mainBoards).toHaveLength(2);
      expect(pack.fastMoney).toHaveLength(5);

      for (const question of pack.mainBoards) {
        expect(question.answers.map((answer) => answer.points)).toEqual([10, 8, 7, 5, 5, 4, 4, 3]);
        expect(question.candidateIds.length).toBe(
          question.answers.length + (question.alsoAcceptedEntityIds?.length ?? 0),
        );
      }
      for (const question of pack.fastMoney) {
        expect(question.answers.map((answer) => answer.points)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
        expect(question.candidateIds.length).toBe(
          question.answers.length + (question.alsoAcceptedEntityIds?.length ?? 0),
        );
      }
    }
  });
});
