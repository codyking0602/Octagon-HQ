// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatTwentyQuestionsScoreImpact,
  TWENTY_QUESTIONS_LIMIT,
  TWENTY_QUESTIONS_START_SCORE,
  twentyQuestionsFinalScore,
  twentyQuestionsScoreAfterQuestion,
  twentyQuestionsScoreAfterWrongGuess,
} from "../games/twentyQuestionsEngine";
import { getUfcTwentyQuestionsUniverse } from "../games/twentyQuestionsUfcAuthority";
import FootballTwentyQuestionsPage from "./FootballTwentyQuestionsPage";
import UfcTwentyQuestionsPage from "./UfcTwentyQuestionsPage";

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
    const { container } = render(<UfcTwentyQuestionsPage />);

    expect(screen.getByText("UFC ROUND")).toBeInTheDocument();
    expect(screen.getByLabelText("20 Questions scoring rules")).toHaveTextContent("10 questions max");
    expect(screen.queryByLabelText("Round status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    expect(screen.getByLabelText("Round status")).toHaveTextContent("0 / 10");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("100.0");

    const questionButton = container.querySelector<HTMLButtonElement>(".twenty-questions-question-list button");
    const questionLabel = questionButton?.querySelector("span")?.textContent ?? "";
    const question = universe.questions.find((candidate) => candidate.label === questionLabel);
    expect(questionButton).not.toBeNull();
    expect(question).toBeTruthy();
    expect(questionButton).toHaveTextContent(formatTwentyQuestionsScoreImpact(question!.internalCost));
    expect(questionButton).not.toHaveTextContent(/cost/i);

    clickQuestion(question!.label);
    const expectedAfterQuestion = twentyQuestionsScoreAfterQuestion(
      TWENTY_QUESTIONS_START_SCORE,
      question!.internalCost,
    );
    expect(screen.getByLabelText("Round status")).toHaveTextContent(expectedAfterQuestion.toFixed(1));
    expect(screen.getByRole("region", { name: "What you know" })).toHaveTextContent(question!.label);
    expect(screen.getByRole("region", { name: "What you know" })).toHaveTextContent(formatTwentyQuestionsScoreImpact(question!.internalCost));
    expect(screen.getByRole("region", { name: "What you know" })).not.toHaveTextContent(/cost/i);
    expect(
      [...container.querySelectorAll<HTMLButtonElement>(".twenty-questions-question-list button")]
        .some((button) => button.textContent?.includes(question!.label)),
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
    const { container } = render(<UfcTwentyQuestionsPage />);

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    for (let index = 0; index < TWENTY_QUESTIONS_LIMIT; index += 1) {
      const questionButton = container.querySelector<HTMLButtonElement>(".twenty-questions-question-list button");
      expect(questionButton).not.toBeNull();
      fireEvent.click(questionButton!);
    }

    expect(screen.getByText("OUT OF QUESTIONS")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__stats")).toHaveTextContent("10 questions used");
    expect(screen.queryByLabelText("Round status")).not.toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-bank")).toBeNull();
  });

  it("discloses the Football league before the first question without exposing narrowing metadata", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.2)
      .mockReturnValue(0.3);
    const { container } = render(<FootballTwentyQuestionsPage />);

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
