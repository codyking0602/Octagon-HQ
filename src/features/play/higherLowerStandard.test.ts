import { describe, expect, it } from "vitest";
import shared from "./HigherLowerStandard.tsx?raw";
import css from "../../styles/higher-lower-standard.css?raw";
import football from "../back-room/FootballHigherLowerPage.tsx?raw";
import nba from "../nba/NbaHigherLowerPage.tsx?raw";
import ufc from "./UfcHigherLowerPage.tsx?raw";
import footballDaily from "./OfficialFootballHigherLowerDailyView.tsx?raw";
import ufcDaily from "./OfficialUfcHigherLowerDailyView.tsx?raw";
import { createUfcHigherLowerBoard } from "./ufcHigherLowerModel";
import { createNbaHigherLowerBoard } from "../nba/nbaHigherLowerModel";
import { createFootballHigherLowerBoard } from "../back-room/footballHigherLowerModel";

describe("Higher or Lower presentation parity across three sports", () => {
  it("shares Casual opening, score, progress, stat, buttons and feedback", () => {
    for (const page of [football, nba, ufc]) {
      for (const component of ["HigherLowerIntro", "HigherLowerRoundHeader",
        "HigherLowerPrompt", "HigherLowerChoices", "HigherLowerFeedback"]) {
        expect(page).toContain("<" + component);
      }
      expect(page).toContain('higher-lower-standard.css');
    }
    for (const page of [footballDaily, ufcDaily]) {
      for (const component of ["HigherLowerRoundHeader", "HigherLowerPrompt",
        "HigherLowerChoices"]) expect(page).toContain("<" + component);
      expect(page).toContain('higher-lower-standard.css');
    }
  });
  it("never shows 0/0, uses accessible completed progress, and excludes difficulty/cutoff metadata from the opener", () => {
    expect(shared).toContain('{correct}/{maximum}');
    expect(shared).toContain('aria-valuenow={progress}');
    expect(shared).toContain('10 matchups. Pick who has more.');
    expect(ufc).not.toContain('3 approachable, 5 competitive, 2 tough.');
    expect(ufc).not.toContain('Fights through August 18');
    expect(css).toContain('.ufc-higher-lower .higher-lower-progress i');
  });
  it("never forces a tie into an unfair higher/lower choice", () => {
    const boards = [
      createUfcHigherLowerBoard("standard-ufc").questions,
      createNbaHigherLowerBoard("standard-nba").questions,
      createFootballHigherLowerBoard("standard-football", "MIXED").questions,
    ];
    for (const questions of boards) {
      expect(questions).toHaveLength(10);
      for (const question of questions) {
        expect(question.known.value).not.toBe(question.hidden.value);
        expect(question.answer).toBe(question.hidden.value > question.known.value ? "higher" : "lower");
      }
    }
  });
});
