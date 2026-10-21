import { describe, expect, it } from "vitest";
import {
  NBA_MILLIONAIRE_BANK_SIZE, NBA_MILLIONAIRE_QUESTIONS,
  nbaMillionaireQuestionsForLevel, nbaMillionaireRun,
} from "./nbaMillionaireBank";
import { MILLIONAIRE_CHOICE_IDS, MILLIONAIRE_LEVELS, MILLIONAIRE_MONEY_BY_LEVEL } from "../games/millionaireAuthority";
import { advanceMillionaireRuntime, assertMillionaireRun, createMillionaireState } from "../games/millionaireEngine";

describe("NBA Millionaire owner-review question quality and replay", () => {
  it("carries 240 unique source-backed questions, exactly 30 in each tier", () => {
    expect(NBA_MILLIONAIRE_QUESTIONS).toHaveLength(NBA_MILLIONAIRE_BANK_SIZE);
    expect(new Set(NBA_MILLIONAIRE_QUESTIONS.map(question => question.id)).size).toBe(240);
    for (const tier of MILLIONAIRE_LEVELS) {
      expect(nbaMillionaireQuestionsForLevel(tier)).toHaveLength(30);
    }
  });

  it("keeps one valid answer, plausible distinct options, protected lifelines and no Q8 hints", () => {
    for (const q of NBA_MILLIONAIRE_QUESTIONS) {
      expect(q.sport).toBe("nba");
      expect(q.money).toBe(MILLIONAIRE_MONEY_BY_LEVEL[q.level]);
      expect(q.prompt.length).toBeGreaterThan(25);
      expect(q.explanation.length).toBeGreaterThan(35);
      expect(q.sourceUrl).toMatch(/^https:\/\/www\.nba\.com\/news\/history-/);
      expect(q.verifiedAt).toBe("2026-10-21");
      expect(q.choices.map(c => c.id)).toEqual([...MILLIONAIRE_CHOICE_IDS]);
      expect(new Set(q.choices.map(c => c.text)).size).toBe(4);
      expect(q.choices.filter(c => c.id === q.correctChoiceId)).toHaveLength(1);
      expect(q.fiftyFifty.survivorChoiceIds).toContain(q.correctChoiceId);
      expect(q.fiftyFifty.removalChoiceIds).not.toContain(q.correctChoiceId);
      expect(new Set([...q.fiftyFifty.survivorChoiceIds,...q.fiftyFifty.removalChoiceIds]).size).toBe(4);
      if (q.level === "Q8") {
        expect(q.statSheet).toBeNull();
        expect(Object.values(q.lifelineCompatibility).some(Boolean)).toBe(false);
      } else {
        expect(q.statSheet).toBeTruthy();
      }
      for (const choice of q.choices) expect(choice.text.length).toBeLessThanOrEqual(39);
    }
  });

  it("generates date-locked Daily Preview, varied Casual runs, no last-eight-board repeats", () => {
    expect(nbaMillionaireRun("nba-daily-preview:2026-10-21"))
      .toEqual(nbaMillionaireRun("nba-daily-preview:2026-10-21"));
    const recent: string[] = [];
    const seenRuns = new Set<string>();
    for (let attempt=0; attempt<120; attempt++) {
      const run = nbaMillionaireRun("nba-owner-play-"+attempt,recent);
      expect(() => assertMillionaireRun(run)).not.toThrow();
      expect(new Set(run.map(q=>q.id)).size).toBe(8);
      if (attempt<12) {
        expect(run.every(q=>!recent.slice(0,64).includes(q.id))).toBe(true);
      }
      seenRuns.add(run.map(q=>q.id).join("|"));
      recent.unshift(...run.map(q=>q.id));
      recent.splice(128);
    }
    expect(seenRuns.size).toBe(120);
  });

  it("uses the existing shared scoring and Q8 risk rules unchanged", () => {
    const run=nbaMillionaireRun("nba-millionaire-shared-engine");
    let state=createMillionaireState(run);
    for(const q of run.slice(0,7)){
      state=advanceMillionaireRuntime(run,state,{type:"answer",choiceId:q.correctChoiceId}).state;
    }
    expect(state.score).toBe(90);
    const walk=advanceMillionaireRuntime(run,state,{type:"walk_away"}).state;
    expect(walk.status).toBe("walked-away");
    expect(walk.finalMoney).toBe(500_000);
    const win=advanceMillionaireRuntime(run,state,{type:"answer",choiceId:run[7]!.correctChoiceId}).state;
    expect(win.status).toBe("won");
    expect(win.score).toBe(100);
  });
});
