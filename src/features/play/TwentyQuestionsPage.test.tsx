// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TWENTY_QUESTIONS_LIMIT,
  TWENTY_QUESTIONS_START_SCORE,
  twentyQuestionsFinalScore,
  twentyQuestionsScoreAfterQuestion,
  twentyQuestionsScoreAfterWrongGuess,
} from "../games/twentyQuestionsEngine";
import { getUfcTwentyQuestionsUniverse } from "../games/twentyQuestionsUfcAuthority";
import TwentyQuestionsPage from "./TwentyQuestionsPage";

function clickQuestion(label: string) {
  const labelNode = screen.getByText(label, { selector: ".twenty-questions-question-list span" });
  const button = labelNode.closest("button");
  expect(button).not.toBeNull();
  fireEvent.click(button!);
}

function chooseGuess(name: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Search identities" }), {
    target: { value: name },
  });
  const nameNode = screen.getByText(name, { selector: ".twenty-questions-guess-list strong" });
  const option = nameNode.closest("button");
  expect(option).not.toBeNull();
  fireEvent.click(option!);
  fireEvent.click(screen.getByRole("button", { name: `GUESS ${name.toUpperCase()}` }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("replayable 20 Questions page", () => {
  it("supports question history, full-universe guessing, penalties, a correct reveal, and replay reset", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const universe = getUfcTwentyQuestionsUniverse();
    const hidden = universe.subjects[0]!;
    const wrong = universe.subjects.find((subject) => subject.id !== hidden.id)!;
    const question = universe.questions[0]!;
    const { container } = render(<TwentyQuestionsPage sport="ufc" />);

    expect(screen.getByText("UFC ROUND")).toBeInTheDocument();
    expect(screen.getByText(/10 questions max/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Round status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    expect(screen.getByLabelText("Round status")).toHaveTextContent("0 / 10");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("100.0");

    clickQuestion(question.label);
    const expectedAfterQuestion = twentyQuestionsScoreAfterQuestion(
      TWENTY_QUESTIONS_START_SCORE,
      question.internalCost,
    );
    expect(screen.getByLabelText("Round status")).toHaveTextContent(expectedAfterQuestion.toFixed(1));
    expect(screen.getByRole("region", { name: "What you know" })).toHaveTextContent(question.label);
    expect(
      [...container.querySelectorAll<HTMLButtonElement>(".twenty-questions-question-list button")]
        .some((button) => button.textContent?.includes(question.label)),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "GUESS" }));
    chooseGuess(wrong.name);
    const expectedAfterWrongGuess = twentyQuestionsScoreAfterWrongGuess(expectedAfterQuestion);
    expect(screen.getByRole("status")).toHaveTextContent(`${wrong.name} is not the answer`);
    expect(screen.getByLabelText("Round status")).toHaveTextContent(expectedAfterWrongGuess.toFixed(1));

    chooseGuess(hidden.name);
    expect(screen.getByText("CORRECT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: hidden.name })).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__score")).toHaveTextContent(
      String(twentyQuestionsFinalScore(expectedAfterWrongGuess)),
    );
    expect(container.querySelector(".twenty-questions-result__stats")).toHaveTextContent("1 questions used");
    expect(container.querySelector(".twenty-questions-result__stats")).toHaveTextContent("1 wrong guesses");

    fireEvent.click(screen.getByRole("button", { name: "PLAY AGAIN" }));
    expect(screen.getByRole("button", { name: "START ROUND" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    expect(screen.getByLabelText("Round status")).toHaveTextContent("0 / 10");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("100.0");
  });

  it("hard-stops and reveals after ten unique questions", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const universe = getUfcTwentyQuestionsUniverse();
    const questions = universe.questions.slice(0, TWENTY_QUESTIONS_LIMIT);
    const { container } = render(<TwentyQuestionsPage sport="ufc" />);

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    for (const question of questions) clickQuestion(question.label);

    expect(screen.getByText("OUT OF QUESTIONS")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__stats")).toHaveTextContent("10 questions used");
    expect(screen.queryByLabelText("Round status")).not.toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-bank")).toBeNull();
  });

  it("discloses the Football league before the first question without exposing narrowing metadata", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.2)
      .mockReturnValue(0.3);
    const { container } = render(<TwentyQuestionsPage sport="football" />);

    expect(screen.getByText("NFL ROUND")).toBeInTheDocument();
    expect(screen.getByText(/League is locked and revealed before the first question/i)).toBeInTheDocument();
    expect(container.textContent?.toLowerCase()).not.toContain("candidate");
    expect(container.textContent?.toLowerCase()).not.toContain("probability");

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    expect(screen.getByText("NFL")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "GUESS" }));
    expect(screen.getByPlaceholderText("Search the full NFL roster…")).toBeInTheDocument();
  });
});
