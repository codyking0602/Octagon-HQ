import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MlbWavelengthChallenge from "./MlbWavelengthChallenge";
import { MLB_PLAY_NEXT_CHALLENGE_KEY } from "./mlbPlayChallenge";

function renderPage() {
  return render(
    <MemoryRouter>
      <MlbWavelengthChallenge />
    </MemoryRouter>,
  );
}

function lockFour(getByRole: ReturnType<typeof renderPage>["getByRole"]) {
  for (let index = 0; index < 4; index += 1) {
    fireEvent.click(getByRole("button", {
      name: index === 3 ? /lock final guess/i : /lock guess & reveal next clue/i,
    }));
  }
}

describe("MLB Wavelength challenge", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("uses the established Football Wavelength presentation with MLB identity and no test language", () => {
    const { container } = renderPage();

    expect(container.querySelector(".football-wavelength-page")).toBeTruthy();
    expect(container.querySelector(".wavelength-topline")).toBeTruthy();
    expect(container.querySelector(".wavelength-intro")).toBeTruthy();
    expect(container.querySelector(".wavelength-progress")).toBeTruthy();
    expect(container.querySelector(".wavelength-clue--hero")).toBeTruthy();
    expect(container.querySelector(".wavelength-guess-panel")).toBeTruthy();
    expect(container.querySelector(".wavelength-path")).toBeTruthy();
    expect(container.querySelector(".wavelength-page--mlb")).toBeTruthy();
    expect(container.textContent).toContain("GAME 1 OF 2");
    expect(container.textContent).not.toMatch(/preview|demo|test|tuning|prototype/i);
  });

  it("plays two four-clue games and averages them into one final score", () => {
    const page = renderPage();

    lockFour(page.getByRole);
    expect(page.container.querySelector(".football-debate-result-hero")).toBeTruthy();
    expect(page.container.textContent).toContain("GAME 1 COMPLETE");

    fireEvent.click(page.getByRole("button", { name: /next game/i }));
    expect(page.container.textContent).toContain("GAME 2 OF 2");

    lockFour(page.getByRole);
    expect(page.container.querySelector(".mlb-wavelength-final-score")).toBeTruthy();
    expect(page.container.textContent).toContain("FINAL SCORE");
    expect(page.container.textContent).toContain("GAME 1");
    expect(page.container.textContent).toContain("GAME 2");

    const raw = window.localStorage.getItem(`octagon:mlb-play-preview:${MLB_PLAY_NEXT_CHALLENGE_KEY}`);
    expect(raw).toBeTruthy();
    const stored = JSON.parse(raw!);
    expect(stored.game_type).toBe("wavelength");
    expect(stored.public_result.round_scores).toHaveLength(2);
    expect(stored.result_detail.rounds).toHaveLength(2);
  });
});
