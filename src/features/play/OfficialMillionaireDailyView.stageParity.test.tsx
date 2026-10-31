import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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


  it.each(["nba", "ufc", "nfl"] as const)("conceals the %s Q8 board until the walk decision is made", (league) => {
    const fixture = makeProjection(league === "nfl" ? "ufc" : league, 1);
    const q7State = {
      ...fixture,
      sport: league === "nfl" ? "football" : league,
      publicSetup: {
        ...fixture.publicSetup,
        league,
        questions: Array.from({ length: 8 }, (_, index) => ({
          id: `q${index + 1}`,
          prompt: index === 7 ? "Q8 SECRET QUESTION" : `Question ${index + 1}`,
          money: index === 7 ? 1_000_000 : 500,
          choices: [
            { id: "A", text: "Secret candidate A" },
            { id: "B", text: "Secret candidate B" },
            { id: "C", text: "Secret candidate C" },
            { id: "D", text: "Secret candidate D" },
          ],
        })),
      },
      publicState: {
        ...fixture.publicState,
        current_question_index: 6,
        completed_questions: 6,
      },
    } as DailyProjection;
    const onAdvance = () => {};
    const { rerender } = render(<OfficialMillionaireDailyView projection={q7State} busy={false} onAdvance={onAdvance} />);
    expect(document.body.querySelector(".millionaire-answers")).not.toBeNull();

    // Advancing into Q8 must not flash the next question before the prompt opens.
    const q8State = {
      ...q7State,
      publicState: { ...q7State.publicState, current_question_index: 7, completed_questions: 7 },
    } as DailyProjection;
    rerender(<OfficialMillionaireDailyView projection={q8State} busy={false} onAdvance={onAdvance} />);
    expect(screen.getByLabelText("Walk away decision")).toBeTruthy();
    expect(document.body.querySelector(".millionaire-question")).toBeNull();
    expect(document.body.querySelector(".millionaire-answers")).toBeNull();
    expect(document.body.textContent).not.toContain("Q8 SECRET QUESTION");
    expect(document.body.textContent).not.toContain("Secret candidate A");

    fireEvent.click(screen.getByRole("button", { name: /play for/i }));
    expect(screen.queryByLabelText("Walk away decision")).toBeNull();
    expect(screen.getByText("Q8 SECRET QUESTION")).toBeTruthy();
    expect(document.body.querySelectorAll(".millionaire-answers button")).toHaveLength(4);
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
