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

  it("keeps fighter values hidden until the required picks lock, then reveals the Price Is Right result", () => {
    const { container } = renderGame();
    const pickCount = selectRequiredFighters(container);

    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(0);
    const lock = screen.getByRole("button", { name: "LOCK PICKS" });
    expect(lock).toBeEnabled();
    fireEvent.click(lock);

    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(pickCount);
    expect(container.querySelector(".hit-number-result")).not.toBeNull();
    expect(container.querySelector(".hit-number-result")?.textContent).toMatch(/PERFECT|BUST|\d+ OFF/);
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
  });

  it("switches to a deterministic twelve-fighter Random Pool without leaking stat values", () => {
    const { container } = renderGame();
    fireEvent.click(screen.getByRole("button", { name: "RANDOM POOL" }));

    expect(container.querySelectorAll(".hit-number-fighter-card")).toHaveLength(12);
    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(0);
    expect(container.textContent).toContain("12-fighter pool");
  });

  it("auto-filters Open Roster boards to the selected division", () => {
    const { container } = renderGame();
    const select = container.querySelector<HTMLSelectElement>('select[name="division"]')!;
    expect([...select.options].some((option) => option.value === "Lightweight")).toBe(true);
    fireEvent.change(select, { target: { value: "Lightweight" } });

    const fighters = [...container.querySelectorAll<HTMLButtonElement>(".hit-number-fighter-card")];
    expect(fighters.length).toBeGreaterThanOrEqual(4);
    fighters.forEach((fighter) => expect(fighter.dataset.divisions?.split("|")).toContain("Lightweight"));
    expect(container.textContent).toContain("LIGHTWEIGHT ONLY");
  });

  it("searches the full eligible Open Roster and starts a fresh board through shared lineup history", () => {
    const { container } = renderGame();
    const firstCard = container.querySelector<HTMLButtonElement>(".hit-number-fighter-card")!;
    const firstName = firstCard.querySelector("strong")!.textContent!;
    const search = screen.getByPlaceholderText("Search by name");
    fireEvent.change(search, { target: { value: firstName } });
    expect(container.querySelectorAll(".hit-number-fighter-card")).toHaveLength(1);

    const firstChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");
    fireEvent.click(screen.getByRole("button", { name: "NEW BOARD" }));
    const secondChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");
    expect(secondChallengeId).not.toBe(firstChallengeId);
    expect(screen.getByPlaceholderText("Search by name")).toHaveValue("");
  });
});
