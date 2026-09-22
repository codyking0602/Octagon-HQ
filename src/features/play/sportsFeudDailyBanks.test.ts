import { describe, expect, it } from "vitest";
import { assertFamilyFeudPack } from "../games/familyFeudEngine";
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

  it("alternates Football Sports Feud appearances between CFB and NFL", () => {
    expect(footballSportsFeudDomainForDay("2026-09-23")).toBe("cfb");
    expect(footballSportsFeudDomainForDay("2026-10-01")).toBe("nfl");
    expect(footballSportsFeudDomainForDay("2026-10-08")).toBe("cfb");
    expect(footballSportsFeudDomainForDay("2026-10-15")).toBe("nfl");
    expect(footballSportsFeudDomainForDay("2026-10-19")).toBe("cfb");
  });

  it("never mixes question identities across the three source banks", () => {
    const cfb = new Set([...CFB_SPORTS_FEUD_MAIN, ...CFB_FAST].map((question) => question.id));
    const nfl = new Set([...NFL_SPORTS_FEUD_MAIN, ...NFL_FAST].map((question) => question.id));
    const ufc = new Set([...UFC_SPORTS_FEUD_MAIN, ...UFC_FAST].map((question) => question.id));
    expect([...cfb].some((id) => nfl.has(id) || ufc.has(id))).toBe(false);
    expect([...nfl].some((id) => ufc.has(id))).toBe(false);
  });
});
