import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MillionaireCasualPage from "./MillionaireCasualPage";
import { createNbaMillionaireRun } from "../nba/nbaMillionaireBank";
import { MILLIONAIRE_ANSWER_REVEAL_HOLD_MS, MILLIONAIRE_REVEAL_DELAY_MS, NBA_MILLIONAIRE_HOST_ROTATION_KEY } from "./MillionaireCasualModel";

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({ status: "ready", profile: { id: "owner", canControlPicks: true } }),
}));
vi.mock("../nba/NbaWhoAmIOwnerGate", () => ({ canPreviewNbaWhoAmI: () => true }));

const ids = ["A", "B", "C", "D"] as const;

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.removeItem(NBA_MILLIONAIRE_HOST_ROTATION_KEY);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("NBA Millionaire money-run elimination and full-board recovery", () => {
  it.each([
    { missIndex: 0, lockedMoney: 0 },
    { missIndex: 5, lockedMoney: 5_000 },
    { missIndex: 6, lockedMoney: 100_000 },
  ])("stops NBA's money ladder at Q$missIndex, shows Finish the Board, then completes Q8", ({ missIndex, lockedMoney }) => {
    const run = createNbaMillionaireRun("nba-finish-the-board-ui-" + missIndex);
    const settled = vi.fn();
    render(<MemoryRouter><MillionaireCasualPage scope="nba" runOverride={run} onSettled={settled} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /start game/i }));
    const getAnswers = () => [...document.body.querySelectorAll<HTMLButtonElement>(".millionaire-answers button")];

    for (let index = 0; index < 8; index++) {
      expect(document.body.textContent).toContain(run[index]!.prompt);
      expect(getAnswers()).toHaveLength(4);
      const correct = run[index]!.correctChoiceId;
      const wrong = ids.find((id) => id !== correct)!;
      fireEvent.click(getAnswers()[ids.indexOf(index === missIndex ? wrong : correct)]!);
      act(() => vi.advanceTimersByTime(MILLIONAIRE_REVEAL_DELAY_MS[run[index]!.level] + MILLIONAIRE_ANSWER_REVEAL_HOLD_MS + 50));

      if (index === missIndex) {
        expect(settled).not.toHaveBeenCalled();
        expect(screen.getByRole("region", { name: "Millionaire run ended" }).textContent).toContain("Your money run is over");
        const continueButton = screen.getByRole("button", { name: /finish the board/i });
        expect(getAnswers().every(button => button.disabled)).toBe(true);
        expect(document.body.querySelectorAll(".millionaire-ladder .is-missed")).toHaveLength(1);
        expect(document.body.querySelectorAll(".millionaire-ladder .is-current")).toHaveLength(0);
        expect(screen.getByLabelText("Locked winnings — money run ended").textContent).toContain(
          lockedMoney === 100_000 ? "$100,000" : lockedMoney === 5_000 ? "$5,000" : "$0",
        );
        // The prompt is an acknowledgement, not a result: recovery starts only on click.
        fireEvent.click(continueButton);
        expect(document.body.querySelector(".millionaire-elimination")).toBeNull();
      } else if (index > missIndex && index < 7) {
        expect(document.body.querySelectorAll(".millionaire-ladder .is-missed")).toHaveLength(1);
        expect(document.body.querySelectorAll(".millionaire-ladder .is-current")).toHaveLength(0);
        expect(screen.getByLabelText("Locked winnings — money run ended").textContent).toContain(
          lockedMoney === 100_000 ? "$100,000" : lockedMoney === 5_000 ? "$5,000" : "$0",
        );
      }
      if (index < 7) {
        expect(settled).not.toHaveBeenCalled();
        expect(document.body.querySelector(".millionaire-results")).toBeNull();
      }
    }

    expect(settled).toHaveBeenCalledTimes(1);
    expect(settled.mock.calls[0]![0]).toMatchObject({
      outcome: "lost",
      completedQuestions: 7,
      firstMissQuestion: missIndex + 1,
      finalMoney: lockedMoney,
    });
    expect(document.body.querySelector(".millionaire-results")).toBeTruthy();
  });

  it("advances to a new real NBA host on PLAY AGAIN without changing money-run rules", () => {
    const run = createNbaMillionaireRun("nba-host-restart");
    render(<MemoryRouter><MillionaireCasualPage scope="nba" runOverride={run} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /start game/i }));
    const first = document.body.querySelector<HTMLImageElement>(".millionaire-nba-host");
    expect(first?.getAttribute("src")).toBe("/assets/millionaire/NBA 1.webp");
    expect(document.body.querySelector(".millionaire-stage-background")?.getAttribute("src")).toBe("/assets/millionaire/nba-clean-studio.webp");
    expect(document.body.querySelector(".millionaire-nba-host-stage")).toBeNull();
    for (let index = 0; index < 8; index++) {
      const btns = [...document.body.querySelectorAll<HTMLButtonElement>(".millionaire-answers button")];
      const key = run[index]!.correctChoiceId;
      fireEvent.click(btns[ids.indexOf(key)]!);
      act(() => vi.advanceTimersByTime(MILLIONAIRE_REVEAL_DELAY_MS[run[index]!.level] + MILLIONAIRE_ANSWER_REVEAL_HOLD_MS + 50));
      if (index === 6) {
        expect(document.body.querySelector(".millionaire-decision")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: /play for/i }));
      }
    }
    fireEvent.click(screen.getByRole("button", { name: /play again/i }));
    const second = document.body.querySelector<HTMLImageElement>(".millionaire-nba-host");
    expect(second?.getAttribute("src")).toBe("/assets/millionaire/NBA 2.webp");
  });
});
