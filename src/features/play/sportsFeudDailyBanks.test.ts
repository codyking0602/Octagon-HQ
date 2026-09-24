import { describe, expect, it } from "vitest";
import {
  assertFamilyFeudPack,
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  matchFamilyFeudAnswer,
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
import {
  buildSportsFeudPack,
  footballSportsFeudDomainForDay,
} from "./sportsFeudDailyBanks";
import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

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
const UFC_FAST = [
  ...UFC_SPORTS_FEUD_FAST_1,
  ...UFC_SPORTS_FEUD_FAST_2,
  ...UFC_SPORTS_FEUD_FAST_3,
  ...UFC_SPORTS_FEUD_FAST_4,
  ...UFC_SPORTS_FEUD_FAST_5,
];

function addDays(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function assertAuthoredBank(main: readonly SportsFeudAuthoredQuestion[], fast: readonly SportsFeudAuthoredQuestion[]) {
  expect(main).toHaveLength(100);
  expect(fast).toHaveLength(250);
  const all = [...main, ...fast];
  expect(new Set(all.map((question) => question.id)).size).toBe(350);
  expect(new Set(main.map((question) => question.prompt)).size).toBe(100);
  expect(new Set(fast.map((question) => question.prompt)).size).toBe(250);

  for (const question of all) {
    expect(["person", "team", "school", "other"]).toContain(question.entityKind);
    expect(question.answers).toHaveLength(8);
    expect(new Set(question.answers.map((answer) => answer.name.toLowerCase())).size).toBe(8);
  }

  const lighter = all.filter((question) => /culture|personality/i.test(question.category));
  expect(lighter.length).toBeLessThanOrEqual(35);
}

describe("Sports Feud authored Daily banks", () => {
  it("locks 100 main plus 250 Fast Money prompts for each isolated sport bank", () => {
    assertAuthoredBank(CFB_SPORTS_FEUD_MAIN, CFB_FAST);
    assertAuthoredBank(NFL_SPORTS_FEUD_MAIN, NFL_FAST);
    assertAuthoredBank(UFC_SPORTS_FEUD_MAIN, UFC_FAST);
  });

  it("keeps Heisman quarterback prompts quarterback-only", () => {
    const questions = [...CFB_SPORTS_FEUD_MAIN, ...CFB_FAST].filter((question) =>
      /heisman/i.test(question.prompt) && /quarterback/i.test(question.prompt));
    expect(questions.length).toBeGreaterThan(0);
    for (const question of questions) {
      expect(question.answers.map((answer) => answer.name)).not.toContain("Reggie Bush");
    }
  });

  it("builds valid two-board plus five-prompt packs across six months", () => {
    for (let offset = 0; offset < 180; offset += 1) {
      const day = addDays("2026-09-23", offset);
      expect(() => assertFamilyFeudPack(buildSportsFeudPack("ufc", day))).not.toThrow();
      expect(() => assertFamilyFeudPack(buildSportsFeudPack("cfb", day))).not.toThrow();
      expect(() => assertFamilyFeudPack(buildSportsFeudPack("nfl", day))).not.toThrow();
    }
  });

  it("alternates actual Football Sports Feud appearances between CFB and NFL", () => {
    expect(footballSportsFeudDomainForDay("2026-09-23")).toBe("cfb");
    expect(footballSportsFeudDomainForDay("2026-09-25")).toBe("nfl");
    expect(footballSportsFeudDomainForDay("2026-09-30")).toBe("cfb");
    expect(footballSportsFeudDomainForDay("2026-10-06")).toBe("nfl");
    expect(footballSportsFeudDomainForDay("2026-10-14")).toBe("cfb");
  });

  it("gives Fast Money 50 seconds", () => {
    expect(FAMILY_FEUD_FAST_MONEY_TIME_MS).toBe(50_000);
  });

  it("removes rivalry-trophy trivia and lets loud-stadium answers use the school or team", () => {
    expect(CFB_FAST.some((question) => /rivalry trophy/i.test(question.prompt))).toBe(false);

    const conference = CFB_FAST.find((question) => question.id === "cfb-fast3-09-1");
    expect(conference).toBeDefined();
    expect(conference?.answers.map((answer) => answer.name)).toContain("SEC");

    const findPack = (domain: "cfb" | "nfl", questionId: string) => {
      for (let offset = 0; offset < 365; offset += 1) {
        const pack = buildSportsFeudPack(domain, addDays("2026-09-23", offset));
        if (pack.fastMoney.some((question) => question.id === questionId)) return pack;
      }
      throw new Error("Could not find selected Fast Money question " + questionId);
    };

    const cfb = findPack("cfb", "cfb-fast3-05-1");
    const cfbStadium = cfb.fastMoney.find((question) => question.id === "cfb-fast3-05-1")!;
    const cfbMatch = matchFamilyFeudAnswer(cfb, cfbStadium, "Tennessee");
    expect(cfbMatch.status).toBe("matched");
    if (cfbMatch.status === "matched") {
      expect(cfb.entities.find((entity) => entity.id === cfbMatch.entityId)?.displayName)
        .toBe("Neyland Stadium");
    }

    const nfl = findPack("nfl", "nfl-fast3-05-1");
    const nflStadium = nfl.fastMoney.find((question) => question.id === "nfl-fast3-05-1")!;
    const nflMatch = matchFamilyFeudAnswer(nfl, nflStadium, "Chiefs");
    expect(nflMatch.status).toBe("matched");
    if (nflMatch.status === "matched") {
      expect(nfl.entities.find((entity) => entity.id === nflMatch.entityId)?.displayName)
        .toBe("Arrowhead Stadium");
    }
  });

  it("locks the audited quick-answer treatment across CFB, NFL, and UFC", () => {
    const question = (bank: readonly SportsFeudAuthoredQuestion[], id: string) => {
      const row = bank.find((item) => item.id === id);
      expect(row).toBeDefined();
      return row!;
    };
    const aliases = (
      bank: readonly SportsFeudAuthoredQuestion[],
      id: string,
      answerName: string,
    ) => {
      const answer = question(bank, id).answers.find((item) => item.name === answerName);
      expect(answer).toBeDefined();
      return answer?.aliases ?? [];
    };

    expect(question(CFB_FAST, "cfb-fast4-09-1").prompt)
      .toBe("Name a stage or game type in the college football postseason.");
    expect(aliases(CFB_FAST, "cfb-fast4-06-1", "Four verticals")).toContain("Four verts");
    expect(aliases(CFB_FAST, "cfb-fast4-08-1", "Transfer portal")).toContain("Portal");
    expect(aliases(CFB_FAST, "cfb-fast4-10-1", "Wear team colors")).toContain("Team colors");

    expect(aliases(NFL_FAST, "nfl-fast3-07-1", "Defensive Player of the Year")).toContain("DPOY");
    expect(question(NFL_FAST, "nfl-fast4-07-1").answers.map((answer) => answer.name)).toContain("Blitz");
    expect(aliases(NFL_FAST, "nfl-fast4-09-1", "Best player available")).toContain("BPA");
    expect(question(NFL_FAST, "nfl-fast4-10-1").answers.map((answer) => answer.name)).toEqual([
      "AFC East",
      "AFC North",
      "AFC South",
      "AFC West",
      "NFC East",
      "NFC North",
      "NFC South",
      "NFC West",
    ]);

    expect(question(UFC_FAST, "ufc-fast4-01-1").answers.map((answer) => answer.name)).toEqual([
      "Knockout",
      "TKO",
      "Submission",
      "Decision",
      "Doctor stoppage",
      "Disqualification",
      "No contest",
      "Corner stoppage",
    ]);
    expect(aliases(UFC_FAST, "ufc-fast4-02-1", "Rear-naked choke")).toContain("RNC");
    expect(aliases(UFC_FAST, "ufc-fast4-05-1", "Ground-and-pound")).toContain("GNP");
    expect(aliases(UFC_FAST, "ufc-fast4-06-1", "Knee to the head of a grounded opponent")).toContain("Illegal knee");
    expect(aliases(UFC_FAST, "ufc-fast4-07-1", "Effective striking")).toContain("Significant strikes");
    expect(aliases(UFC_FAST, "ufc-fast4-10-1", "Give instructions")).toContain("Coaching");
  });

  it("keeps Fast Money prompts precise while accepting natural shorthand", () => {
    const ufc = buildSportsFeudPack("ufc", "2026-09-23");
    const football = buildSportsFeudPack("cfb", "2026-09-23");

    const ufcQuestion = (id: string) => {
      const question = ufc.fastMoney.find((row) => row.id === id);
      expect(question).toBeDefined();
      return question!;
    };
    const cfbQuestion = (id: string) => {
      const question = football.fastMoney.find((row) => row.id === id);
      expect(question).toBeDefined();
      return question!;
    };
    const matchedName = (
      pack: ReturnType<typeof buildSportsFeudPack>,
      question: ReturnType<typeof ufcQuestion>,
      input: string,
    ) => {
      const match = matchFamilyFeudAnswer(pack, question, input);
      expect(match.status).toBe("matched");
      if (match.status !== "matched") return null;
      return pack.entities.find((entity) => entity.id === match.entityId)?.displayName ?? null;
    };

    expect(matchedName(ufc, ufcQuestion("ufc-fast3-10-1"), "New York"))
      .toBe("Madison Square Garden");
    expect(matchedName(ufc, ufcQuestion("ufc-fast3-10-1"), "MSG"))
      .toBe("Madison Square Garden");
    expect(matchedName(ufc, ufcQuestion("ufc-fast4-09-3"), "faint"))
      .toBe("Fainting");

    const hallOfFame = ufcQuestion("ufc-fast3-07-1");
    expect(hallOfFame.prompt.toLowerCase()).toContain("career");

    expect(CFB_FAST.some((question) =>
      question.prompt === "Name a tradition that makes a home game feel unique."
    )).toBe(false);

    const award = cfbQuestion("cfb-fast3-08-3");
    expect(award.prompt.toLowerCase()).toContain("award");
    expect(matchedName(football, award, "Heisman"))
      .toBe("Heisman Trophy");

    expect(matchedName(football, cfbQuestion("cfb-fast4-07-5"), "blitz"))
      .toBe("Blitz");
  });

  it("keeps explicit person matching independent of prompt keywords", () => {
    const findQuestion = (domain: "ufc" | "cfb" | "nfl", id: string) => {
      for (let offset = 0; offset < 730; offset += 1) {
        const pack = buildSportsFeudPack(domain, addDays("2026-09-23", offset));
        const question = [...pack.mainBoards, ...pack.fastMoney].find((row) => row.id === id);
        if (question) return { pack, question };
      }
      throw new Error("Could not materialize " + id);
    };

    const submissions = findQuestion("ufc", "ufc-main-03-1");
    expect(matchFamilyFeudAnswer(submissions.pack, submissions.question, "Oliveira"))
      .toMatchObject({ status: "matched", kind: "surname" });

    const heavyweight = findQuestion("ufc", "ufc-main-10-1");
    expect(matchFamilyFeudAnswer(heavyweight.pack, heavyweight.question, "Miocic"))
      .toMatchObject({ status: "matched", kind: "surname" });
  });

  it("locks the audited September 24 UFC prototype and forgiving human-name matching", () => {
    const pack = buildSportsFeudPack("ufc", "2026-09-24");

    expect(pack.mainBoards.map((question) => question.prompt)).toEqual([
      "Name a UFC star you associate with relentless grappling pressure.",
      "Name a fighter who helped make women's MMA a major part of the UFC.",
    ]);
    expect(pack.fastMoney.map((question) => question.prompt)).toEqual([
      "Name a submission you might see finish a UFC fight.",
      "Name a UFC fighter famous for trash talk.",
      "Name a UFC weight class.",
      "Name a UFC star you would pick for a striking showcase.",
      "Name an MMA referee you have seen inside the Octagon.",
    ]);

    const matchedName = (questionIndex: number, input: string, fast = false) => {
      const question = fast ? pack.fastMoney[questionIndex]! : pack.mainBoards[questionIndex]!;
      const match = matchFamilyFeudAnswer(pack, question, input);
      expect(match.status, input).toBe("matched");
      if (match.status !== "matched") return null;
      return pack.entities.find((entity) => entity.id === match.entityId)?.displayName ?? null;
    };

    expect(matchedName(0, "Khamzat Chimaev")).toBe("Khamzat Chimaev");
    expect(matchedName(0, "Cain Velasquez")).toBe("Cain Velasquez");
    expect(matchedName(0, "Islam")).toBe("Islam Makhachev");
    expect(matchedName(0, "Geroege St Lierre")).toBe("Georges St-Pierre");
    expect(matchedName(0, "st pierre")).toBe("Georges St-Pierre");

    expect(matchedName(1, "Valentina")).toBe("Valentina Shevchenko");
    expect(matchedName(1, "Joana")).toBe("Joanna Jedrzejczyk");
    expect(matchedName(1, "Joanna Jeddecici")).toBe("Joanna Jedrzejczyk");
    expect(matchedName(1, "Cat Zigano")).toBe("Cat Zingano");

    expect(matchedName(4, "Herb", true)).toBe("Herb Dean");
    expect(matchedName(1, "Conor", true)).toBe("Conor McGregor");
    expect(matchedName(3, "Jon Jones", true)).toBe("Jon Jones");

    const striking = pack.fastMoney[3]!;
    const jon = matchFamilyFeudAnswer(pack, striking, "Jon Jones");
    expect(jon.status).toBe("matched");
    if (jon.status === "matched") {
      expect(striking.alsoAcceptedEntityIds).toContain(jon.entityId);
    }
  });

  it("never mixes question identities across the three source banks", () => {
    const cfb = new Set([...CFB_SPORTS_FEUD_MAIN, ...CFB_FAST].map((question) => question.id));
    const nfl = new Set([...NFL_SPORTS_FEUD_MAIN, ...NFL_FAST].map((question) => question.id));
    const ufc = new Set([...UFC_SPORTS_FEUD_MAIN, ...UFC_FAST].map((question) => question.id));
    expect([...cfb].some((id) => nfl.has(id) || ufc.has(id))).toBe(false);
    expect([...nfl].some((id) => ufc.has(id))).toBe(false);
  });
});
