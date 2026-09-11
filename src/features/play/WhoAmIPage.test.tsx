import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";
import WhoAmIPage from "./WhoAmIPage";

const subjects: readonly WhoAmISubject[] = [
  { id: "alpha", name: "Alpha Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "bravo", name: "Bravo Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "charlie", name: "Charlie Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "delta", name: "Delta Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "echo", name: "Echo Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "foxtrot", name: "Foxtrot Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
];

function round(): WhoAmIRound {
  const bands = [
    "broad", "broad",
    "helpful", "helpful", "helpful",
    "strong", "strong", "strong",
    "giveaway", "giveaway",
  ] as const;

  return {
    sport: "ufc",
    league: "UFC",
    subjects,
    hiddenSubject: subjects[0]!,
    clues: bands.map((band, index) => ({
      id: `clue-${index + 1}`,
      text: `Clue ${index + 1}`,
      band,
    })),
  };
}

function renderRound() {
  return render(<WhoAmIPage sport="ufc" createRound={round} />);
}

function revealAllClues() {
  for (let index = 0; index < 4; index += 1) {
    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE CLUES" }));
  }
}

function guess(name: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Search identities" }), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${name} Fighter`, "i") }));
  fireEvent.click(screen.getByRole("button", { name: `GUESS ${name.toUpperCase()} FIGHTER` }));
}

describe("Who Am I endgame recovery UX", () => {
  it("gives two natural final guesses before the reduced-point recovery board", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    revealAllClues();

    expect(screen.getByText("FINAL GUESS 1 OF 2")).toBeInTheDocument();
    expect(screen.getByText("All 10 clues are out. You get 2 final guesses. The four-choice recovery is worth 30 pts.")).toBeInTheDocument();

    guess("Bravo");

    expect(screen.getByText("Bravo Fighter is not the answer. One final guess remains. −15 pts.")).toBeInTheDocument();
    expect(screen.getByText("FINAL GUESS 2 OF 2")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-scorebar div:nth-child(3) strong")?.textContent).toBe("45");

    guess("Charlie");

    expect(screen.getByText("RECOVERY BOARD")).toBeInTheDocument();
    expect(screen.getByText("One of these four similar identities is the answer. Solving here is worth fewer points than a natural final guess.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Alpha Fighter/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Bravo Fighter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Charlie Fighter/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Alpha Fighter/i }));

    expect(screen.getByText("RESCUED")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__score")?.textContent).toBe("30");
  });

  it("makes prior wrong guesses visibly reduce the recovery value", () => {
    renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    fireEvent.click(screen.getByRole("button", { name: "GUESS" }));
    guess("Bravo");
    revealAllClues();

    expect(screen.getByText("FINAL GUESS 1 OF 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SHOW 4 CHOICES — 15 PTS" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SHOW 4 CHOICES — 15 PTS" }));

    expect(screen.getByText("RECOVERY BOARD")).toBeInTheDocument();
    expect(screen.getByText("15 pts")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Bravo Fighter/i })).not.toBeInTheDocument();
  });
});
