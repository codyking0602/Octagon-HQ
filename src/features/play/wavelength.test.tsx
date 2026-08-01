import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import WavelengthGame from "./WavelengthGame";
import {
  createChallengeWavelengthRound,
  nextChallengeWavelengthClue,
} from "./wavelengthChallenge";
import {
  createWavelengthRound,
  desiredWavelengthCorrection,
  nextWavelengthClue,
  wavelengthClues,
  wavelengthScore,
  wavelengthTargets,
} from "./wavelengthEngine";

function renderWavelength() {
  return render(
    <IdentityProvider gateway={null}><ChallengeProvider>
      <MemoryRouter initialEntries={["/play/wavelength?challenge=rendered-challenge"]}>
        <WavelengthGame challengeSeed="rendered-challenge" onExit={() => undefined} />
      </MemoryRouter>
    </ChallengeProvider></IdentityProvider>,
  );
}

describe("Wavelength engine", () => {
  it("preserves the complete V1 target and expanded clue banks", () => {
    expect(wavelengthTargets).toHaveLength(22);
    expect(wavelengthClues).toHaveLength(96);
    expect(new Set(wavelengthClues.map((clue) => clue.id)).size).toBe(96);
    expect(Math.min(...wavelengthClues.map((clue) => clue.rating))).toBe(2);
    expect(Math.max(...wavelengthClues.map((clue) => clue.rating))).toBe(99);
  });

  it("avoids the previous target and adjusts later clues toward the hidden number", () => {
    const random = vi.fn(() => 0);
    const round = createWavelengthRound(18, random);
    expect(round.target).not.toBe(18);
    expect(round.clues).toHaveLength(1);

    const highTarget = { target: 91, clues: [wavelengthClues.find((clue) => clue.rating === 89)!] };
    const next = nextWavelengthClue(highTarget, 40, 1, () => 0);
    expect(next.rating).toBeGreaterThan(40);
    expect(next.id).not.toBe(highTarget.clues[0].id);
  });

  it("scores only distance from the final guess", () => {
    expect(wavelengthScore(75, 75)).toBe(100);
    expect(wavelengthScore(68, 75)).toBe(93);
    expect(desiredWavelengthCorrection(80, 40, 2, () => 0)).toBeGreaterThan(80);
  });

  it("recreates the same challenge and the same adaptive clue for an identical guess path", () => {
    const seed = "same-wavelength-challenge";
    const first = createChallengeWavelengthRound(seed);
    const second = createChallengeWavelengthRound(seed);
    expect(second).toEqual(first);

    const firstNext = nextChallengeWavelengthClue(first, 50, 1, seed, []);
    const secondNext = nextChallengeWavelengthClue(second, 50, 1, seed, []);
    expect(secondNext).toEqual(firstNext);
  });
});

describe("Wavelength game", () => {
  beforeEach(() => window.localStorage.clear());

  it("locks four guesses and reveals the standard challenge, replay, and all-games actions", () => {
    renderWavelength();
    expect(screen.getByText("CLUE 1 OF 4")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
    expect(screen.getByText("CLUE 2 OF 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
    expect(screen.getByText("CLUE 3 OF 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
    expect(screen.getByText("CLUE 4 OF 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "LOCK FINAL GUESS" }));

    expect(screen.getByText("FINAL SCORE")).toBeInTheDocument();
    expect(screen.getByText("HIDDEN NUMBER")).toBeInTheDocument();
    expect(document.querySelectorAll(".wavelength-reveal__row")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "CHALLENGE SOMEONE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REPLAY CHALLENGE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ALL GAMES" })).toBeInTheDocument();
  });
});
