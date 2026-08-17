import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import HitTheNumberPage from "./HitTheNumberPage";

function renderGame() {
  return render(
    <MemoryRouter initialEntries={["/play/hit-the-number"]}>
      <HitTheNumberPage />
    </MemoryRouter>,
  );
}

function selectRequiredFighters(container: HTMLElement) {
  const pickCount = container.querySelectorAll(".hit-number-slot").length;
  const fighters = [...container.querySelectorAll<HTMLButtonElement>(".hit-number-fighter-card")];
  expect(fighters.length).toBeGreaterThanOrEqual(pickCount);
  fighters.slice(0, pickCount).forEach((fighter) => fireEvent.click(fighter));
  return pickCount;
}

describe("Hit the Number casual game", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps fighter values hidden until lock, then reveals the result and normalized score", () => {
    const { container } = renderGame();
    const pickCount = selectRequiredFighters(container);

    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(0);
    const lock = screen.getByRole("button", { name: /LOCK PICKS/ });
    expect(lock).toBeEnabled();
    fireEvent.click(lock);

    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(pickCount);
    expect(container.querySelector(".hit-number-result")?.textContent).toMatch(/PERFECT|BUST|\d+ OFF/);
    expect(container.querySelector(".hit-number-result__score")?.textContent).toMatch(/SCORE\d+\/100/);
    expect(container.querySelector(".hit-number-roster")).toBeNull();
    expect(screen.getByRole("button", { name: "NEW LINEUP" })).toBeInTheDocument();
  });

  it("lets the player choose only Open Roster versus Random Pool", () => {
    const { container } = renderGame();

    expect(screen.getByRole("button", { name: "OPEN ROSTER" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "RANDOM POOL" })).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelectorAll("select")).toHaveLength(0);
    expect(container.textContent).not.toContain("ROSTER FILTER");
  });

  it("switches to a bounded Random Pool and generates a fresh lineup", () => {
    const { container } = renderGame();
    const firstChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");

    fireEvent.click(screen.getByRole("button", { name: "RANDOM POOL" }));

    const pickCount = container.querySelectorAll(".hit-number-slot").length;
    const fighterCount = container.querySelectorAll(".hit-number-fighter-card").length;
    expect(fighterCount).toBeGreaterThanOrEqual(pickCount);
    expect(fighterCount).toBeLessThanOrEqual(12);
    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(0);
    expect(container.textContent).toContain(`${fighterCount}-fighter pool`);
    expect(screen.getByRole("button", { name: "RANDOM POOL" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id"))
      .not.toBe(firstChallengeId);
  });

  it("searches the generated Open Roster and NEW LINEUP clears the search with a fresh identity", () => {
    const { container } = renderGame();
    const firstCard = container.querySelector<HTMLButtonElement>(".hit-number-fighter-card")!;
    const firstName = firstCard.querySelector("strong")!.textContent!;
    const search = screen.getByPlaceholderText("Search by name");
    fireEvent.change(search, { target: { value: firstName } });
    expect(container.querySelectorAll(".hit-number-fighter-card")).toHaveLength(1);

    const firstChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");
    fireEvent.click(screen.getByRole("button", { name: "NEW LINEUP" }));
    const secondChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");
    expect(secondChallengeId).not.toBe(firstChallengeId);
    expect(screen.getByPlaceholderText("Search by name")).toHaveValue("");
  });

  it("keeps every selected fighter in the one canonical slot grid", () => {
    const { container } = renderGame();
    const pickCount = selectRequiredFighters(container);
    const slots = container.querySelector(".hit-number-slots");
    expect(slots).not.toBeNull();
    expect(slots?.querySelectorAll(".hit-number-slot.is-filled")).toHaveLength(pickCount);
  });
});
