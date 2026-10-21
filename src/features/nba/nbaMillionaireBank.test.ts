import { describe, expect, it } from "vitest";
import {
  NBA_MILLIONAIRE_QUESTION_BANK,
  NBA_MILLIONAIRE_SOURCES,
  createNbaMillionaireRun,
  nbaMillionaireDailyPreviewRun,
} from "./nbaMillionaireBank";
import { MILLIONAIRE_CHOICE_IDS, MILLIONAIRE_LEVELS, MILLIONAIRE_MONEY_BY_LEVEL } from "../games/millionaireAuthority";
import { advanceMillionaireRuntime, assertMillionaireRun, createMillionaireState } from "../games/millionaireEngine";

describe("NBA Millionaire authored 240-question owner-review bank", () => {
  it("has exactly 30 independently authored questions per tier and no duplicate IDs or options", () => {
    expect(NBA_MILLIONAIRE_QUESTION_BANK).toHaveLength(8);
    const all = NBA_MILLIONAIRE_QUESTION_BANK.flat();
    expect(all).toHaveLength(240);
    expect(new Set(all.map(row => row.id)).size).toBe(240);
    for (const group of NBA_MILLIONAIRE_QUESTION_BANK) {
      expect(group).toHaveLength(30);
      for (const item of group) {
        expect(new Set([item.answer, ...item.distractors]).size).toBe(4);
        expect(item.prompt.length).toBeGreaterThan(18);
        expect(item.explanation.length).toBeGreaterThan(18);
        expect(NBA_MILLIONAIRE_SOURCES[item.source]).toMatch(/^https:\/\/www\.nba\.com\//);
      }
    }
    expect(new Set(all.map(row => row.category)).size).toBeGreaterThanOrEqual(4);
  });

  it("builds valid eight-question runs with protected lifelines and correct money ladder", () => {
    for (let attempt=0; attempt<100; attempt++) {
      const run=createNbaMillionaireRun("audit-"+attempt);
      expect(() => assertMillionaireRun(run)).not.toThrow();
      expect(new Set(run.map(row=>row.id)).size).toBe(8);
      for(let level=0;level<8;level++){
        const q=run[level]!;
        expect(q.sport).toBe("nba");
        expect(q.level).toBe(MILLIONAIRE_LEVELS[level]);
        expect(q.money).toBe(MILLIONAIRE_MONEY_BY_LEVEL[q.level]);
        expect(q.choices.map(c=>c.id)).toEqual([...MILLIONAIRE_CHOICE_IDS]);
        expect(new Set(q.choices.map(c=>c.text)).size).toBe(4);
        expect(q.fiftyFifty.survivorChoiceIds).toContain(q.correctChoiceId);
        expect(q.fiftyFifty.removalChoiceIds).not.toContain(q.correctChoiceId);
        expect(new Set([...q.fiftyFifty.survivorChoiceIds,...q.fiftyFifty.removalChoiceIds]).size).toBe(4);
        if(level===7){
          expect(q.statSheet).toBeNull();
          expect(Object.values(q.lifelineCompatibility).some(Boolean)).toBe(false);
        } else {
          expect(q.statSheet).toBeTruthy();
        }
      }
    }
  });

  it("keeps the owner daily board deterministic and protects recent Casual questions", () => {
    const a=nbaMillionaireDailyPreviewRun("2026-10-21");
    const b=nbaMillionaireDailyPreviewRun("2026-10-21");
    expect(a).toEqual(b);
    const recentlyPlayed:string[]=[];
    for(let index=0; index<10;index++){
      const board=createNbaMillionaireRun("casual-history-"+index,recentlyPlayed);
      expect(board.every(q=>!recentlyPlayed.includes(q.id))).toBe(true);
      recentlyPlayed.unshift(...board.map(q=>q.id));
    }
    expect(createNbaMillionaireRun("next-day")).not.toEqual(a);
  });

  it("shares Football's exact jackpot/walk-away scoring and does not start official Daily scoring", () => {
    const board=createNbaMillionaireRun("nba-scoring");
    let state=createMillionaireState(board);
    for(const q of board.slice(0,7)) state=advanceMillionaireRuntime(board,state,{type:"answer",choiceId:q.correctChoiceId}).state;
    const walk=advanceMillionaireRuntime(board,state,{type:"walk_away"}).state;
    expect(walk.finalMoney).toBe(500_000);
    expect(walk.score).toBe(90);
    const win=advanceMillionaireRuntime(board,state,{type:"answer",choiceId:board[7]!.correctChoiceId}).state;
    expect(win.status).toBe("won");
    expect(win.finalMoney).toBe(1_000_000);
    expect(win.score).toBe(100);
  });
});
