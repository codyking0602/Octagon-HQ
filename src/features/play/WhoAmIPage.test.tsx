import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("remembers recently shown subjects across unmounts and feeds them back into selection", () => {
    const exclusions: Array<ReadonlySet<string> | undefined> = [];
    const createRound = (
      excludedSubjectIdsByLeague: Partial<Record<"UFC" | "NFL" | "CFB", ReadonlySet<string>>>,
    ) => {
      exclusions.push(excludedSubjectIdsByLeague.UFC);
      return round();
    };

    const firstRender = render(<WhoAmIPage sport="ufc" createRound={createRound} />);
    expect(exclusions[0]).toBeUndefined();
    firstRender.unmount();

    render(<WhoAmIPage sport="ufc" createRound={createRound} />);

    expect(exclusions[1]?.has("alpha")).toBe(true);
  });


  it("keeps the intro and round decisions clear while making guessing frictionless", () => {
    const { container } = renderRound();

    expect(container.querySelector(".twenty-questions-rules")?.textContent).toContain("2 clues per reveal");
    expect(container.querySelector(".twenty-questions-rules")?.textContent).toContain("10 total clues");
    expect(container.querySelector(".twenty-questions-rules")?.textContent).toContain("100 max points");
    expect(container.querySelector(".twenty-questions-rules")?.textContent).not.toContain("45→30");

    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));

    expect(screen.getByRole("button", { name: "GUESS NOW · 100 PTS" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REVEAL 2 · 95 PTS" })).toBeInTheDocument();
    expect(screen.queryByText("WINDOW")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "GUESS NOW · 100 PTS" }));
    expect(screen.getByRole("textbox", { name: "Search identities" })).toHaveFocus();

    guess("Bravo");

    expect(screen.getByText("MISS · −10 PTS")).toBeInTheDocument();
    expect(screen.getByText("Bravo Fighter isn't the answer. Solve value now 90 pts.")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-scorebar__stat:nth-child(2) strong")?.textContent).toBe("1");
    expect(container.querySelector(".twenty-questions-scorebar__stat:nth-child(3) strong")?.textContent).toBe("90");
    expect(screen.getByRole("button", { name: "REVEAL 2 · 85 PTS" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Search identities" })).not.toBeInTheDocument();
  });

  it("keeps the newest clue pair visually active while previous clues stay compact and available", () => {
    const { container } = renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));

    expect(container.querySelectorAll(".who-am-i-clue-stack article.is-latest")).toHaveLength(2);
    expect(container.querySelectorAll(".who-am-i-clue-stack article.is-previous")).toHaveLength(0);
    expect(screen.queryByText("Clue 1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 · 95 PTS" }));

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
    expect(screen.getByText("PAIR 5 OF 5")).toBeInTheDocument();
    expect(container.querySelector(".twenty-questions-final-alert")?.textContent).toContain("One final open guess for 70 points.");
    expect(container.querySelector(".twenty-questions-final-alert")?.textContent).toContain("Recovery Board at 45 points.");
    expect(screen.getByRole("button", { name: "FINAL GUESS · 70 PTS" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SKIP TO RECOVERY · 45 PTS" })).toBeInTheDocument();

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

  it("lets the player skip the final open guess into the 45-point Recovery Board", () => {
    renderRound();
    fireEvent.click(screen.getByRole("button", { name: "START ROUND" }));
    revealAllClues();

    fireEvent.click(screen.getByRole("button", { name: "SKIP TO RECOVERY · 45 PTS" }));

    expect(screen.getByText("RECOVERY BOARD · PICK 1 OF 2")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(rescueChoiceButtons()).toHaveLength(5);
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
    fireEvent.click(screen.getByRole("button", { name: "GUESS NOW · 100 PTS" }));
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
