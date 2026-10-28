// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NbaBarTriviaOwnerPreviewPage from "./NbaBarTriviaOwnerPreviewPage";
import { buildNbaBarTriviaDailyBoard } from "./nbaBarTriviaDailyRotation";

describe("NBA Bar Trivia owner-only Daily visual parity", () => {
  it("uses the real Football/UFC Daily presentation from intro through receipt", () => {
    const board = buildNbaBarTriviaDailyBoard(0);
    render(
      <MemoryRouter initialEntries={["/nba/bar-trivia?mode=daily&slot=0"]}>
        <NbaBarTriviaOwnerPreviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "BAR TRIVIA" })).toBeInTheDocument();
    expect(screen.getByText("OCTAGON HQ PRESENTS")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "PULL UP A STOOL" }));

    for (let index = 0; index < board.questions.length; index++) {
      if (index === 0 || index === 3 || index === 6) {
        expect(screen.getByRole("heading", { name: /Around the Association|Deep Cuts|Playoff Pressure/ })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /START (DOUBLE ROUND|ROUND)/ }));
      }
      if (index === 9) {
        expect(screen.getByRole("heading", { name: "PUT SOMETHING ON IT." })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /LOCK WAGER/ }));
      }

      const question = board.questions[index]!;
      expect(screen.getByRole("heading", { name: question.prompt })).toBeInTheDocument();
      const answerButton = screen.getByText(question.answer).closest("button");
      expect(answerButton).not.toBeNull();
      fireEvent.click(answerButton!);
      expect(screen.getByText("THAT'S RIGHT")).toBeInTheDocument();
      const nextLabel = index === 9 ? "CLOSE THE TAB"
        : index === 8 ? "LAST CALL →"
        : index === 2 || index === 5 ? "NEXT ROUND →"
        : "NEXT QUESTION →";
      fireEvent.click(screen.getByRole("button", { name: nextLabel }));
    }

    expect(screen.getByText("TAB CLOSED · NBA")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /100/ })).toBeInTheDocument();
    expect(screen.getByText("CORRECT")).toBeInTheDocument();
    expect(screen.getByText("STREAK HEAT")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "BACK TO GAMES" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "RUN IT BACK" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "PLAY CASUAL" })).not.toBeInTheDocument();
  });
});
