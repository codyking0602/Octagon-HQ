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
  { id: "golf", name: "Golf Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "hotel", name: "Hotel Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
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
    fireEvent.click(screen.getByRole("button", { name: /REVEAL 2 MORE/ }));
  }
}

function guess(name: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Search identities" }), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${name} Fighter`, "i") }));
  fireEvent.click(screen.getByRole("button", { name: `GUESS ${name.toUpperCase()} FIGHTER` }));
}

function rescueChoiceButtons() {
  return screen.getAllByRole("button").filter((button) => button.closest(".twenty-questions-guess-list"));
}

describe("Who Am I mature gameplay loop", () => {
  it("makes guessing the primary decision and shows the score cost of another clue pair", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));

    expect(screen.getByRole("button", { name: "GUESS NOW — 100 PTS" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REVEAL 2 MORE — NEXT SCORE 95" })).toBeInTheDocument();
    expect(screen.queryByText("WINDOW")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "GUESS NOW — 100 PTS" }));
    guess("Bravo");

    expect(screen.getByText("Bravo Fighter is not the answer. −10 pts. Current solve value: 90 pts.")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-scorebar div:nth-child(2) strong")?.textContent).toBe("1");
    expect(container.querySelector(".twenty-questions-scorebar div:nth-child(3) strong")?.textContent).toBe("90");
    expect(screen.getByRole("button", { name: "REVEAL 2 MORE — NEXT SCORE 85" })).toBeInTheDocument();
  });

  it("uses one final natural guess before a five-name, two-pick 45-to-30 recovery", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    revealAllClues();

    expect(screen.getByText("LAST CHANCE · FINAL GUESS")).toBeInTheDocument();
    expect(screen.getByText(/one final natural guess worth 70 pts/i)).toBeInTheDocument();
    expect(screen.queryByText(/FINAL GUESS 2/i)).not.toBeInTheDocument();

    guess("Bravo");

    expect(screen.getByText("RECOVERY BOARD")).toBeInTheDocument();
    expect(screen.getByText("Five names. Two picks.")).toBeInTheDocument();
    expect(screen.getByText("45 pts")).toBeInTheDocument();
    expect(rescueChoiceButtons()).toHaveLength(5);
    expect(screen.queryByRole("button", { name: /Bravo Fighter/i })).not.toBeInTheDocument();

    const firstWrong = rescueChoiceButtons().find((button) => !button.textContent?.includes("Alpha Fighter"));
    expect(firstWrong).toBeDefined();
    fireEvent.click(firstWrong!);

    expect(screen.getByText("One pick left.")).toBeInTheDocument();
    expect(screen.getByText("30 pts")).toBeInTheDocument();
    expect(firstWrong).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Alpha Fighter/i }));

    expect(screen.getByText("RESCUED")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__score")?.textContent).toBe("30");
  });

  it("ends the round at zero after both recovery picks miss", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    revealAllClues();
    guess("Bravo");

    const firstWrong = rescueChoiceButtons().find((button) => !button.textContent?.includes("Alpha Fighter"));
    expect(firstWrong).toBeDefined();
    fireEvent.click(firstWrong!);

    const secondWrong = rescueChoiceButtons().find((button) => (
      !button.textContent?.includes("Alpha Fighter") && !button.hasAttribute("disabled")
    ));
    expect(secondWrong).toBeDefined();
    fireEvent.click(secondWrong!);

    expect(screen.getByText("NOT SOLVED")).toBeInTheDocument();
    expect(screen.getByText("Both recovery picks missed. This was the hidden identity.")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__score")?.textContent).toBe("0");
  });
});
