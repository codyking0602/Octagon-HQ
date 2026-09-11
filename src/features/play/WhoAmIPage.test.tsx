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
      text: `Detail ${index + 1}`,
      band,
    })),
  };
}

function renderRound() {
  return render(<WhoAmIPage sport="ufc" createRound={round} />);
}

function revealAllClues() {
  for (let index = 0; index < 4; index += 1) {
    fireEvent.click(screen.getByRole("button", { name: /REVEAL 2 ·/ }));
  }
}

function guess(name: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Search identities" }), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${name} Fighter`, "i") }));
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^SUBMIT ${name.toUpperCase()} FIGHTER · \\d+ PTS$`) }));
}

function rescueChoiceButtons() {
  return screen.getAllByRole("button").filter((button) => button.closest(".twenty-questions-recovery-list"));
}

describe("Who Am I mature gameplay loop", () => {
  it("keeps Guess Now and the next reveal score persistently clear while making guessing frictionless", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));

    expect(screen.getByRole("button", { name: "GUESS NOW · 100" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REVEAL 2 · 95" })).toBeInTheDocument();
    expect(screen.queryByText("WINDOW")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "GUESS NOW · 100" }));
    expect(screen.getByRole("textbox", { name: "Search identities" })).toHaveFocus();

    guess("Bravo");

    expect(screen.getByText("MISS · −10 PTS")).toBeInTheDocument();
    expect(screen.getByText("Bravo Fighter isn't the answer. Solve value now 90 pts.")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-scorebar__stat:nth-child(2) strong")?.textContent).toBe("1");
    expect(container.querySelector(".twenty-questions-scorebar__stat:nth-child(3) strong")?.textContent).toBe("90");
    expect(screen.getByRole("button", { name: "REVEAL 2 · 85" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Search identities" })).not.toBeInTheDocument();
  });

  it("keeps the newest clue pair visually active while previous clues stay compact and available", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));

    expect(container.querySelectorAll(".who-am-i-clue-stack article.is-latest")).toHaveLength(2);
    expect(container.querySelectorAll(".who-am-i-clue-stack article.is-previous")).toHaveLength(0);
    expect(screen.queryByText("Clue 1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 · 95" }));

    expect(container.querySelectorAll(".who-am-i-clue-stack article.is-latest")).toHaveLength(2);
    expect(container.querySelectorAll(".who-am-i-clue-stack article.is-previous")).toHaveLength(2);
    expect(screen.getByText("Detail 1")).toBeInTheDocument();
    expect(screen.getByText("Detail 4")).toBeInTheDocument();
  });

  it("uses one final natural guess before a five-name, two-pick 45-to-30 recovery", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    revealAllClues();

    expect(screen.getByText("LAST CHANCE · ONE NATURAL GUESS")).toBeInTheDocument();
    expect(screen.getByText("One natural guess for 70 pts. Miss and the five-name Recovery Board takes over.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FINAL GUESS · 70" })).toBeInTheDocument();

    guess("Bravo");

    expect(screen.getByText("RECOVERY BOARD · PICK 1 OF 2")).toBeInTheDocument();
    expect(screen.getByText("Five names. Two picks.")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(rescueChoiceButtons()).toHaveLength(5);
    expect(screen.queryByRole("button", { name: /Bravo Fighter/i })).not.toBeInTheDocument();

    const firstWrong = rescueChoiceButtons().find((button) => !button.textContent?.includes("Alpha Fighter"));
    expect(firstWrong).toBeDefined();
    fireEvent.click(firstWrong!);

    expect(screen.getByText("RECOVERY BOARD · PICK 2 OF 2")).toBeInTheDocument();
    expect(screen.getByText("One pick left.")).toBeInTheDocument();
    expect(screen.getByText("MISS · 30 PTS LEFT")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(firstWrong).toBeDisabled();
    expect(firstWrong).toHaveTextContent("Eliminated");

    fireEvent.click(screen.getByRole("button", { name: /Alpha Fighter/i }));

    expect(container.querySelector(".twenty-questions-result > .eyebrow")?.textContent).toBe("RECOVERED");
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

    expect(container.querySelector(".twenty-questions-result > .eyebrow")?.textContent).toBe("MISS");
    expect(screen.getByText("Both recovery picks missed.")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-result__score")?.textContent).toBe("0");
  });

  it("makes result review show the clue progression as compact reveal pairs", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    fireEvent.click(screen.getByRole("button", { name: "GUESS NOW · 100" }));
    guess("Alpha");

    expect(container.querySelector(".twenty-questions-result > .eyebrow")?.textContent).toBe("NATURAL SOLVE");
    expect(container.querySelector(".twenty-questions-result__score")?.textContent).toBe("100");

    fireEvent.click(screen.getByRole("button", { name: "REVIEW ALL CLUES" }));

    expect(screen.getByText("CLUES 1–2")).toBeInTheDocument();
    expect(screen.getByText("CLUES 9–10")).toBeInTheDocument();
    expect(container.querySelectorAll(".twenty-questions-review-pair")).toHaveLength(5);
    expect(screen.getByText("Detail 10")).toBeInTheDocument();
  });
});
