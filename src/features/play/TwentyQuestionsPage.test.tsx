// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatTwentyQuestionsScoreImpact,
  TWENTY_QUESTIONS_LIMIT,
  TWENTY_QUESTIONS_START_SCORE,
  twentyQuestionsFinalScore,
  twentyQuestionsScoreAfterQuestion,
  twentyQuestionsScoreAfterWrongGuess,
  type TwentyQuestionsUniverse,
} from "../games/twentyQuestionsEngine";
import { getUfcTwentyQuestionsUniverse } from "../games/twentyQuestionsUfcAuthority";
import FootballTwentyQuestionsPage from "./FootballTwentyQuestionsPage";
import TwentyQuestionsPage from "./TwentyQuestionsPage";
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
  it("supports recommended questions, narrowing counts, history, guessing, penalties, a correct reveal, and replay reset", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const universe = getUfcTwentyQuestionsUniverse();
    const hidden = universe.subjects[0]!;
    const wrong = universe.subjects.find((subject) => subject.id !== hidden.id)!;
    const { container } = render(<UfcTwentyQuestionsPage />);

    expect(screen.getByText("UFC ROUND")).toBeInTheDocument();
    expect(screen.getByLabelText("20 Questions scoring rules")).toHaveTextContent("10 questions max");
    expect(screen.queryByLabelText("Round status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    expect(screen.getByLabelText("Round status")).toHaveTextContent("QUESTIONS LEFT");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("10");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("FIGHTERS LEFT");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("100.0");
    expect(screen.getByRole("region", { name: "Recommended" })).toBeInTheDocument();

    const questionButton = container.querySelector<HTMLButtonElement>(".twenty-questions-recommended .twenty-questions-question-list button");
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
    const expectedRemaining = universe.subjects.filter(
      (subject) => question!.answer(subject.id) === question!.answer(hidden.id),
    ).length;
    expect(screen.getByLabelText("Round status")).toHaveTextContent(expectedAfterQuestion.toFixed(1));
    expect(screen.getByLabelText("Round status")).toHaveTextContent(String(expectedRemaining));
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
    expect(screen.getByText("SOLVED")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: hidden.name })).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__score")).toHaveTextContent(
      String(twentyQuestionsFinalScore(expectedAfterWrongGuess)),
    );
    expect(container.querySelector(".twenty-questions-result__stats")).toHaveTextContent("1 questions used");
    expect(container.querySelector(".twenty-questions-result__stats")).toHaveTextContent("1 wrong guesses");
    expect(screen.getByRole("button", { name: "REVIEW CLUES" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PLAY AGAIN" }));
    expect(screen.getByRole("button", { name: "START ROUND" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    expect(screen.getByLabelText("Round status")).toHaveTextContent("QUESTIONS LEFT");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("10");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("100.0");
  });

  it("removes a wrong candidate guess from the remaining pool and prevents guessing it again", () => {
    const subjects = [
      { id: "fighter-alpha", name: "Alpha Fighter", kind: "fighter" as const, league: "UFC" as const },
      { id: "fighter-bravo", name: "Bravo Fighter", kind: "fighter" as const, league: "UFC" as const },
      { id: "fighter-charlie", name: "Charlie Fighter", kind: "fighter" as const, league: "UFC" as const },
    ];
    const universe: TwentyQuestionsUniverse = {
      league: "UFC",
      subjects,
      questions: [{
        id: "career:alpha-or-bravo",
        label: "Is this Alpha or Bravo?",
        internalCost: 5,
        answer: (subjectId: string) => subjectId !== "fighter-charlie",
      }],
    };
    render(
      <TwentyQuestionsPage
        sport="ufc"
        createRound={() => ({ sport: "ufc", universe, hiddenSubject: subjects[0]! })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    clickQuestion("Is this Alpha or Bravo?");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("FIGHTERS LEFT2");

    fireEvent.click(screen.getByRole("button", { name: "GUESS" }));
    chooseGuess("Bravo Fighter");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("FIGHTERS LEFT1");
    expect(screen.getByRole("status")).toHaveTextContent("Bravo Fighter is not the answer");

    fireEvent.change(screen.getByRole("textbox", { name: "Search identities" }), {
      target: { value: "Bravo Fighter" },
    });
    expect(screen.queryByText("Bravo Fighter", { selector: ".twenty-questions-guess-list strong" })).not.toBeInTheDocument();
  });

  it("forces one final guess after the tenth question instead of revealing the identity", () => {
    const subjects = Array.from({ length: 12 }, (_, index) => ({
      id: `fighter-${index}`,
      name: `Fighter ${index}`,
      kind: "fighter" as const,
      league: "UFC" as const,
    }));
    const universe: TwentyQuestionsUniverse = {
      league: "UFC",
      subjects,
      questions: Array.from({ length: TWENTY_QUESTIONS_LIMIT }, (_, index) => ({
        id: `career:filter-${index + 1}`,
        label: `Is this Fighter ${index + 1}?`,
        internalCost: 5 as const,
        answer: (subjectId: string) => subjectId === `fighter-${index + 1}`,
      })),
    };
    const hidden = subjects[0]!;
    const wrong = subjects[11]!;
    const { container } = render(
      <TwentyQuestionsPage
        sport="ufc"
        createRound={() => ({ sport: "ufc", universe, hiddenSubject: hidden })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    for (let index = 0; index < TWENTY_QUESTIONS_LIMIT; index += 1) {
      const questionButton = container.querySelector<HTMLButtonElement>(".twenty-questions-question-list button");
      expect(questionButton).not.toBeNull();
      fireEvent.click(questionButton!);
    }

    expect(screen.getByLabelText("Round status")).toHaveTextContent("QUESTIONS LEFT0");
    expect(screen.getByText("10 questions used. Who is it?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FINAL GUESS" })).toBeInTheDocument();
    expect(screen.queryByText("NOT SOLVED")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: hidden.name })).not.toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-bank")).toBeNull();

    chooseGuess(wrong.name);
    expect(screen.getByText("NOT SOLVED")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: hidden.name })).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__stats")).toHaveTextContent("10 questions used");
    expect(container.querySelector(".twenty-questions-result__stats")).toHaveTextContent("1 wrong guesses");
  });

  it("starts categories at five questions and expands them five at a time", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<UfcTwentyQuestionsPage />);

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    const era = screen.getByRole("region", { name: "Era & UFC Tenure" });
    expect(era.querySelectorAll(".twenty-questions-question-list button").length).toBe(5);

    fireEvent.click(within(era).getByRole("button", { name: "SHOW 5 MORE" }));
    expect(era.querySelectorAll(".twenty-questions-question-list button").length).toBe(10);
  });

  it("uses singular wording for one title-fight win", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    expect(universe.questions.some((question) => question.label === "Does this fighter have at least one UFC title-fight win?")).toBe(true);
    expect(universe.questions.some((question) => question.label.includes("1 UFC title-fight wins"))).toBe(false);
  });

  it("discloses the Football league before the first question and starts directly in the football universe", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.2)
      .mockReturnValue(0.3);
    render(<FootballTwentyQuestionsPage />);

    expect(screen.getByText("NFL ROUND")).toBeInTheDocument();
    expect(screen.getByText(/League is locked and revealed before the first question/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    expect(screen.getByText("NFL")).toBeInTheDocument();
    expect(screen.getByLabelText("Round status")).toHaveTextContent("QUESTIONS LEFT");
    expect(screen.getByLabelText("Round status")).toHaveTextContent("PEOPLE LEFT");
    expect(screen.getByRole("region", { name: "Recommended" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "GUESS" }));
    expect(screen.getByPlaceholderText("Search the full NFL roster…")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Search the full UFC roster…")).not.toBeInTheDocument();
  });
});
