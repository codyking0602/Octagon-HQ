import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TwentyQuestionsUniverse } from "../games/twentyQuestionsEngine";
import type { TwentyQuestionsRound } from "../games/twentyQuestionsRuntime";
import TwentyQuestionsPage from "./TwentyQuestionsPage";

const universe: TwentyQuestionsUniverse = {
  league: "UFC",
  subjects: [
    { id: "alpha", name: "Alpha Fighter", kind: "fighter", league: "UFC" },
    { id: "bravo", name: "Bravo Fighter", kind: "fighter", league: "UFC" },
    { id: "charlie", name: "Charlie Fighter", kind: "fighter", league: "UFC" },
  ],
  questions: [
    {
      id: "era:alpha-only",
      label: "Was this fighter active in the Alpha era?",
      internalCost: 6,
      answer: (id) => id === "alpha",
    },
    {
      id: "division:bravo-charlie",
      label: "Did this fighter compete in the B/C division?",
      internalCost: 6,
      answer: (id) => id !== "alpha",
    },
  ],
};

function round(): TwentyQuestionsRound {
  return { sport: "ufc", universe, hiddenSubject: universe.subjects[0]! };
}

function renderRound() {
  return render(<TwentyQuestionsPage sport="ufc" createRound={round} />);
}

describe("20 Questions round UX", () => {
  it("keeps the final remaining identity hidden until the player guesses or forfeits", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    fireEvent.click(screen.getByRole("button", { name: /Was this fighter active in the Alpha era/i }));

    expect(container.querySelector(".twenty-questions-scorebar div:nth-child(2) strong")?.textContent).toBe("1");
    expect(screen.queryByText("Alpha Fighter")).not.toBeInTheDocument();
    expect(screen.getByText("One identity remains. Guess or reveal the answer.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GUESS" })).toBeInTheDocument();
  });

  it("forfeits through the normal result reveal path and counts as not solved", () => {
    renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    fireEvent.click(screen.getByRole("button", { name: "GUESS" }));
    fireEvent.click(screen.getByRole("button", { name: "FORFEIT / REVEAL ANSWER" }));

    expect(screen.getByText("FORFEITED")).toBeInTheDocument();
    expect(screen.getByText("Alpha Fighter")).toBeInTheDocument();
    expect(screen.getByText("You revealed the hidden identity.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
  });

  it("preserves wrong-guess elimination without ending the round", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    fireEvent.click(screen.getByRole("button", { name: "GUESS" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Search identities" }), { target: { value: "Bravo" } });
    fireEvent.click(screen.getByRole("button", { name: /Bravo Fighter/i }));
    fireEvent.click(screen.getByRole("button", { name: "GUESS BRAVO FIGHTER" }));

    expect(screen.getByText("Bravo Fighter is not the answer. −10 pts.")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-scorebar div:nth-child(2) strong")?.textContent).toBe("2");
    expect(screen.queryByText("NOT SOLVED")).not.toBeInTheDocument();
  });
});
