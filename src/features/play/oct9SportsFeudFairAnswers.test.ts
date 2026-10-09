import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createFamilyFeudState, familyFeudMainBoardScore, matchFamilyFeudAnswer,
  submitFamilyFeudMainAnswer,
} from "../games/familyFeudEngine";
import { NFL_SPORTS_FEUD_MAIN } from "./nflSportsFeudMain";
import { NFL_SPORTS_FEUD_FAST_3 } from "./nflSportsFeudFast3";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";

const publishedDay = "2026-10-09";

describe("Oct 9 NFL Sports Feud fair-answer regression", () => {
  it("recognizes Lib's and Tyler's real defensive answers without accepting Blocking", () => {
    const pack = buildSportsFeudPack("nfl", publishedDay);
    const board = pack.mainBoards[0]!;
    expect(board.id).toBe("nfl-main-19-5");

    const expected: Array<[string, string, number]> = [
      ["Speed", "Speed", 2], ["Agility", "Agility", 2],
      ["Interception", "Turnovers", 4], ["Interceptions", "Turnovers", 4],
      ["Force Turnovers", "Turnovers", 4], ["Forced Turnovers", "Turnovers", 4],
      ["Pass Defense", "Coverage", 5], ["Sticky Man Coverage", "Coverage", 5],
    ];
    for (const [input, name, points] of expected) {
      const match = matchFamilyFeudAnswer(pack, board, input);
      expect(match.status, input).toBe("matched");
      if (match.status !== "matched") continue;
      expect(pack.entities.find((e) => e.id === match.entityId)?.displayName).toBe(name);
      const ranked = board.answers.find((row) => row.entityId === match.entityId);
      expect(ranked?.points ?? 2, input).toBe(points);
    }
    expect(matchFamilyFeudAnswer(pack, board, "Blocking").status).toBe("unrecognized");
  });

  it("resolves Tyler's ordered four correct answers at 24 board points", () => {
    const pack = buildSportsFeudPack("nfl", publishedDay);
    let state = createFamilyFeudState();
    for (const answer of ["Run Defense", "Tackling", "Force Turnovers", "Pass Defense"]) {
      const next = submitFamilyFeudMainAnswer(pack, state, answer);
      expect(["board-correct", "board-also-accepted"]).toContain(next.outcome.type);
      state = next.state;
    }
    expect(state.mainBoardIndex).toBe(1);
    expect(state.mainBoards[0]?.strikes).toBe(0);
    expect(familyFeudMainBoardScore(pack, state, 0)).toBe(24);
  });

  it("does not penalize a repeat Interceptions after Force Turnovers", () => {
    const pack = buildSportsFeudPack("nfl", publishedDay);
    let state = createFamilyFeudState();
    for (const input of ["Run Defense", "Tackling", "Force Turnovers"]) {
      state = submitFamilyFeudMainAnswer(pack, state, input).state;
    }
    const repeat = submitFamilyFeudMainAnswer(pack, state, "Interceptions");
    expect(repeat.outcome.type).toBe("already-guessed");
    expect(repeat.state.mainBoards[0]?.strikes).toBe(0);
    const finish = submitFamilyFeudMainAnswer(pack, repeat.state, "Sticky Man Coverage");
    expect(finish.outcome.type).toBe("board-correct");
    expect(familyFeudMainBoardScore(pack, finish.state, 0)).toBe(24);
  });

  it("credits Gronk as Rob Gronkowski for 7 Fast Money points", () => {
    const pack = buildSportsFeudPack("nfl", publishedDay);
    const question = pack.fastMoney.find((row) => row.id === "nfl-fast3-08-2");
    expect(question).toBeDefined();
    if (!question) return;
    const result = matchFamilyFeudAnswer(pack, question, "Gronk");
    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(pack.entities.find((e) => e.id === result.entityId)?.displayName).toBe("Rob Gronkowski");
    expect(question.answers.find((row) => row.entityId === result.entityId)?.points).toBe(7);
  });

  it("keeps the answer improvements in all future authored defensive variants", () => {
    const variants = NFL_SPORTS_FEUD_MAIN.filter((row) => row.collisionGroup === "defense");
    expect(variants).toHaveLength(5);
    for (const q of variants) {
      expect(q.alsoAcceptedAnswers?.some((row) => row.name === "Agility")).toBe(true);
    }
    expect(NFL_SPORTS_FEUD_FAST_3.find((row) => row.id === "nfl-fast3-08-2")
      ?.answers.some((row) => row.name === "Rob Gronkowski")).toBe(true);
  });

  it("guards both official score corrections and preserves immutable originals", () => {
    const sql = readFileSync(resolve(process.cwd(),
      "supabase/migrations/202612310285_oct9_lib_tyler_sports_feud_regrade.sql"), "utf8");
    for (const value of ["LIB", "TYLER", "39", "81", "Gronk",
      "Force Turnovers", "Pass Defense", "Agility", "Immutable", "original_score"]) {
      expect(sql.toLowerCase()).toContain(value.toLowerCase());
    }
    expect(sql).toContain("if v_old=v_score then continue");
    expect(sql).toContain("enable trigger daily_challenge_attempts_immutable");
    expect(sql).toContain("enable trigger daily_challenge_setups_immutable");
  });
});
