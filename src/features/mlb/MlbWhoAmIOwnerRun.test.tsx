import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import MlbWhoAmIOwnerRun, { MLB_WHO_AM_I_OWNER_ROUNDS } from "./MlbWhoAmIOwnerRun";

afterEach(() => cleanup());

function solveCurrentRound(name: string) {
  fireEvent.click(screen.getByRole("button", { name: /guess now/i }));
  fireEvent.change(screen.getByRole("textbox", { name: /search identities/i }), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: new RegExp(name, "i") }));
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`submit ${name}`, "i") }));
}

describe("MLB Who Am I owner run", () => {
  it("uses two disposable MLB identities with ten progressive clues each", () => {
    expect(MLB_WHO_AM_I_OWNER_ROUNDS).toHaveLength(2);
    expect(new Set(MLB_WHO_AM_I_OWNER_ROUNDS.map((round) => round.hiddenSubject.id)).size).toBe(2);
    expect(MLB_WHO_AM_I_OWNER_ROUNDS.every((round) => (
      round.sport === "mlb"
      && round.league === "MLB"
      && round.clues.length === 10
      && round.subjects.length >= 20
    ))).toBe(true);
  });

  it("looks like the real MLB challenge and averages the two round scores", () => {
    render(<MlbWhoAmIOwnerRun />);

    expect(document.body.textContent).toContain("TODAY’S CHALLENGE · MLB");
    expect(document.body.textContent).toContain("ROUND 1 OF 2");
    expect(document.body.textContent).not.toMatch(/preview|demo|test|tuning|prototype/i);
    expect(document.querySelector('.who-am-i-page[data-sport="mlb"]')).toBeTruthy();

    solveCurrentRound(MLB_WHO_AM_I_OWNER_ROUNDS[0].hiddenSubject.name);
    expect(document.body.textContent).toContain("ROUND SCORE");
    expect(document.body.textContent).toContain("100");
    expect(document.querySelector(".official-daily-result-actions.is-mlb")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /continue to round 2/i }));

    expect(document.body.textContent).toContain("ROUND 2 OF 2");
    fireEvent.click(screen.getByRole("button", { name: /reveal 2/i }));
    solveCurrentRound(MLB_WHO_AM_I_OWNER_ROUNDS[1].hiddenSubject.name);

    expect(document.body.textContent).toContain("DAILY SCORE · 98/100");
    expect(document.body.textContent).toContain("ROUND 1 · 100/100");
    expect(document.body.textContent).toContain("ROUND 2 · 95/100");
  });
});
