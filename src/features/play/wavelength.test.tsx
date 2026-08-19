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
  WAVELENGTH_TARGET_MAX,
  WAVELENGTH_TARGET_MIN,
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
  it("uses every hidden target from 20 through 95 with no learnable gaps", () => {
    expect(WAVELENGTH_TARGET_MIN).toBe(20);
    expect(WAVELENGTH_TARGET_MAX).toBe(95);
    expect(wavelengthTargets).toEqual(Array.from({ length: 76 }, (_, index) => 20 + index));
    expect(wavelengthTargets.filter((target) => target >= 20 && target <= 39)).toHaveLength(20);
    expect(wavelengthTargets.filter((target) => target >= 40 && target <= 59)).toHaveLength(20);
    expect(wavelengthTargets.filter((target) => target >= 60 && target <= 79)).toHaveLength(20);
    expect(wavelengthTargets.filter((target) => target >= 80 && target <= 95)).toHaveLength(16);
  });

  it("keeps the expanded approved clue catalog dense around every target", () => {
    expect(wavelengthClues).toHaveLength(500);
    expect(new Set(wavelengthClues.map((clue) => clue.id)).size).toBe(500);
    expect(Math.min(...wavelengthClues.map((clue) => clue.rating))).toBe(2);
    expect(Math.max(...wavelengthClues.map((clue) => clue.rating))).toBe(99);
    for (const target of wavelengthTargets) {
      expect(wavelengthClues.some((clue) => Math.abs(clue.rating - target) <= 3)).toBe(true);
    }
  });

  it("avoids the previous target and adjusts later clues toward the hidden number", () => {
    const random = vi.fn(() => 0);
    const round = createWavelengthRound(20, random);
    expect(round.target).not.toBe(20);
    expect(round.clues).toHaveLength(1);

    const highTarget = { target: 91, clues: [wavelengthClues.find((clue) => clue.rating === 89)!] };
    const next = nextWavelengthClue(highTarget, 40, 1, () => 0);
    expect(next.rating).toBeGreaterThan(40);
    expect(next.id).not.toBe(highTarget.clues[0].id);
  });

  it("uses strong, moderate, and confirming adaptive clue calibration", () => {
    expect(desiredWavelengthCorrection(80, 60, 1, () => 0)).toBe(90);
    expect(desiredWavelengthCorrection(80, 60, 2, () => 0)).toBe(93);
    expect(desiredWavelengthCorrection(80, 60, 3, () => 0)).toBe(94);
    expect(desiredWavelengthCorrection(80, 100, 1, () => 0)).toBe(70);

    expect(desiredWavelengthCorrection(80, 72, 1, () => 0)).toBe(84);
    expect(desiredWavelengthCorrection(80, 72, 2, () => 0)).toBe(85);
    expect(desiredWavelengthCorrection(80, 72, 3, () => 0)).toBe(86);

    expect(desiredWavelengthCorrection(80, 77, 1, () => 0)).toBe(81);
    expect(desiredWavelengthCorrection(80, 78, 2, () => 0)).toBe(81);
    expect(desiredWavelengthCorrection(80, 79, 3, () => 0)).toBe(80);
    expect(desiredWavelengthCorrection(80, 80, 3, () => 0)).toBe(80);
    expect(desiredWavelengthCorrection(80, 81, 3, () => 0)).toBe(80);
  });

  it("keeps an exact read near the target instead of introducing avoidable doubt", () => {
    const opening = wavelengthClues.find((clue) => clue.rating === 77)!;
    const confirming = nextWavelengthClue({ target: 80, clues: [opening] }, 80, 1, () => 0);
    expect(Math.abs(confirming.rating - 80)).toBeLessThanOrEqual(2);
    expect(confirming.id).not.toBe(opening.id);
  });

  it("scores only distance from the final guess", () => {
    expect(wavelengthScore(75, 75)).toBe(100);
    expect(wavelengthScore(68, 75)).toBe(86);
    expect(wavelengthScore(55, 75)).toBe(60);
    expect(wavelengthScore(25, 75)).toBe(0);
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
