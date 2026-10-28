import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OfficialMillionaireDailyView } from "./OfficialMillionaireDailyView";
import officialSource from "./OfficialMillionaireDailyView.tsx?raw";
import casualSource from "./MillionaireCasualPage.tsx?raw";
import nbaStyles from "../../styles/nba-millionaire.css?raw";

type DailyProjection = Parameters<typeof OfficialMillionaireDailyView>[0]["projection"];

function makeProjection(league: "nba" | "ufc", hostNumber: number): DailyProjection {
  return {
    sport: league,
    centralDay: "2026-10-25",
    progressRevision: 1, // Skip the instructions overlay; inspect the actual game stage.
    officialAttempt: null,
    publicSetup: {
      league,
      host_number: hostNumber,
      questions: [{
        id: "test-q1",
        prompt: "Which team won?",
        money: 500,
        choices: [
          { id: "A", text: "Team A" },
          { id: "B", text: "Team B" },
          { id: "C", text: "Team C" },
          { id: "D", text: "Team D" },
        ],
      }],
    },
    publicState: {
      status: "playing",
      current_question_index: 0,
      completed_questions: 0,
      time_remaining_ms: 120_000,
      question_state: {},
      lifelines_used: {},
    },
  } as unknown as DailyProjection;
}

afterEach(cleanup);

describe("Official Millionaire stage parity", () => {
  it.each([1, 2, 3])("renders NBA host %i over the same clean stage as NBA Casual", (host) => {
    render(<OfficialMillionaireDailyView projection={makeProjection("nba", host)} busy onAdvance={() => {}} />);
    const stage = document.body.querySelector<HTMLImageElement>(".millionaire-stage-background");
    const foreground = document.body.querySelector<HTMLImageElement>(".millionaire-nba-host");

    expect(stage?.getAttribute("src")).toBe("/assets/millionaire/nba-clean-studio.webp");
    expect(foreground?.getAttribute("src")).toBe(`/assets/millionaire/NBA ${host}.webp`);
    expect(foreground?.parentElement).toBe(stage?.parentElement);
    expect(document.body.querySelector(".millionaire-shell--nba")).not.toBeNull();
  });

  it("preserves the existing single-plate rendering for UFC", () => {
    render(<OfficialMillionaireDailyView projection={makeProjection("ufc", 2)} busy onAdvance={() => {}} />);
    expect(document.body.querySelector(".millionaire-stage-background")?.getAttribute("src"))
      .toBe("/assets/millionaire/Ufc2.png");
    expect(document.body.querySelector(".millionaire-nba-host")).toBeNull();
  });

  it("uses the exact NBA host layer and stylesheet shared by Casual and Official Daily", () => {
    for (const page of [officialSource, casualSource]) {
      expect(page).toContain('import "../../styles/nba-millionaire.css"');
      expect(page).toContain('className="millionaire-nba-host"');
      expect(page).toContain("MILLIONAIRE_NBA_STUDIO_ASSET");
    }
    expect(nbaStyles).toContain(".millionaire-shell--nba.millionaire-shell--fixed-stage .millionaire-nba-host");
  });
});
