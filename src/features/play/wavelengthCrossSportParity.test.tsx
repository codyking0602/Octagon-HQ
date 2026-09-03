import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FootballWavelengthPage from "../back-room/FootballWavelengthPage";
import {
  FOOTBALL_WAVELENGTH_CALIBRATION_VERSION,
  FOOTBALL_WAVELENGTH_CATALOG_VERSION,
  FOOTBALL_WAVELENGTH_TARGET_POLICY_VERSION,
  createFootballWavelengthRound,
  nextFootballWavelengthClue,
  type FootballWavelengthRound,
} from "../back-room/footballWavelengthModel";
import { GAME_SOURCE_AUTHORITY } from "../games/gameSourceAuthority";
import WavelengthGame from "./WavelengthGame";
import { seededLineupRandom } from "./lineupModel";
import {
  WAVELENGTH_CALIBRATION_VERSION,
  WAVELENGTH_CATALOG_VERSION,
} from "./wavelengthCatalog";
import {
  WAVELENGTH_CONTRACT_VERSIONS,
  WAVELENGTH_OPINION_DISCLOSURE,
  WAVELENGTH_TARGET_POLICY_VERSION,
  clampWavelength,
  createWavelengthRound,
  nextWavelengthClue,
  wavelengthTargets,
  type WavelengthRound,
} from "./wavelengthEngine";

vi.mock("../challenges/ChallengeProvider", () => ({
  usePlayChallenges: () => ({ beginChallenge: vi.fn(async () => "") }),
}));

vi.mock("../challenges/challengeRuntime", () => ({
  useProfileChallengeMatch: () => ({
    code: "",
    challenge: null,
    creator: null,
    isRecipient: false,
    activeProfile: null,
    submitResult: vi.fn(),
  }),
}));

function completedUfcRound(index: number): WavelengthRound {
  let round = createWavelengthRound({ random: seededLineupRandom("pr5", "ufc", index) });
  const guesses = [
    clampWavelength(round.target - 18),
    clampWavelength(round.target + 14),
    clampWavelength(round.target - 6),
  ];
  guesses.forEach((guess, clueIndex) => {
    const clue = nextWavelengthClue(
      round,
      guess,
      clueIndex + 1,
      seededLineupRandom("pr5", "ufc-clue", index, clueIndex),
    );
    round = { ...round, clues: [...round.clues, clue] };
  });
  return round;
}

function completedFootballRound(index: number): FootballWavelengthRound {
  const seed = `pr5-football-${index}`;
  let round = createFootballWavelengthRound(seed);
  const guesses = [
    clampWavelength(round.target - 18),
    clampWavelength(round.target + 14),
    clampWavelength(round.target - 6),
  ];
  guesses.forEach((guess, clueIndex) => {
    const clue = nextFootballWavelengthClue(round, guess, clueIndex + 1, seed, guesses.slice(0, clueIndex));
    round = { ...round, clues: [...round.clues, clue] };
  });
  return round;
}

function assertHealthyTargetSample(targets: readonly number[]) {
  expect(Math.min(...targets)).toBeLessThanOrEqual(3);
  expect(Math.max(...targets)).toBeGreaterThanOrEqual(98);
  expect(new Set(targets).size).toBeGreaterThanOrEqual(95);
  for (let lower = 1; lower <= 91; lower += 10) {
    const upper = lower + 9;
    expect(targets.filter((target) => target >= lower && target <= upper).length).toBeGreaterThanOrEqual(120);
  }
}

function finishVisibleRound() {
  for (let index = 0; index < 3; index += 1) {
    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
  }
  fireEvent.click(screen.getByRole("button", { name: "LOCK FINAL GUESS" }));
}

describe("Wavelength cross-sport source and calibration parity", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps exactly one approved subjective catalog owner per sport with explicit versions", () => {
    expect(GAME_SOURCE_AUTHORITY.wavelength.UFC).toMatchObject({
      kind: "subjective-catalog",
      owners: ["ufc-wavelength-catalog"],
      eligibility: "approved-catalog-only",
    });
    expect(GAME_SOURCE_AUTHORITY.wavelength.Football).toMatchObject({
      kind: "subjective-catalog",
      owners: ["football-wavelength-catalog"],
      eligibility: "approved-catalog-only",
    });
    expect(WAVELENGTH_CONTRACT_VERSIONS.catalog).toBe(WAVELENGTH_CATALOG_VERSION);
    expect(WAVELENGTH_CONTRACT_VERSIONS.calibration).toBe(WAVELENGTH_CALIBRATION_VERSION);
    expect(WAVELENGTH_CONTRACT_VERSIONS.targetPolicy).toBe(WAVELENGTH_TARGET_POLICY_VERSION);
    expect(FOOTBALL_WAVELENGTH_CATALOG_VERSION).toBe("football-wavelength-catalog-v3");
    expect(FOOTBALL_WAVELENGTH_CALIBRATION_VERSION).toBe("football-wavelength-calibration-v2");
    expect(FOOTBALL_WAVELENGTH_TARGET_POLICY_VERSION).toBe(WAVELENGTH_TARGET_POLICY_VERSION);
    expect(wavelengthTargets).toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
  });

  it("uses the full target scale without clustering and prevents item/category repeats across 2,000 deterministic rounds per sport", () => {
    const ufcTargets: number[] = [];
    const footballTargets: number[] = [];

    for (let index = 0; index < 2000; index += 1) {
      const ufc = completedUfcRound(index);
      const football = completedFootballRound(index);
      ufcTargets.push(ufc.target);
      footballTargets.push(football.target);

      expect(ufc.clues).toHaveLength(4);
      expect(new Set(ufc.clues.map((clue) => clue.id)).size, `UFC seed ${index}`).toBe(4);
      expect(new Set(ufc.clues.map((clue) => clue.category)).size, `UFC seed ${index}`).toBe(4);

      expect(football.clues).toHaveLength(4);
      expect(new Set(football.clues.map((clue) => clue.id)).size, `Football seed ${index}`).toBe(4);
      expect(new Set(football.clues.map((clue) => clue.category)).size, `Football seed ${index}`).toBe(4);
    }

    assertHealthyTargetSample(ufcTargets);
    assertHealthyTargetSample(footballTargets);
  });

  it("presents the same four-lock opinion-game family and standard result actions in UFC and Football", () => {
    const ufc = render(
      <MemoryRouter>
        <WavelengthGame challengeSeed="pr5-ui-ufc" onExit={() => undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/calibrated 1–100 UFC opinion scale/i)).toBeInTheDocument();
    expect(screen.getByText(/1 · LOW/)).toBeInTheDocument();
    expect(screen.getByText(/50 · MIDDLE/)).toBeInTheDocument();
    expect(screen.getByText(/100 · HIGH/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(WAVELENGTH_OPINION_DISCLOSURE, "i"))).toBeInTheDocument();
    finishVisibleRound();
    expect(screen.getByText("HIDDEN NUMBER")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CHALLENGE SOMEONE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REPLAY CHALLENGE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ALL GAMES" })).toBeInTheDocument();
    ufc.unmount();

    render(
      <MemoryRouter>
        <FootballWavelengthPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/calibrated 1–100 football opinion scale/i)).toBeInTheDocument();
    expect(screen.getByText(/1 · LOW/)).toBeInTheDocument();
    expect(screen.getByText(/50 · MIDDLE/)).toBeInTheDocument();
    expect(screen.getByText(/100 · HIGH/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(WAVELENGTH_OPINION_DISCLOSURE, "i"))).toBeInTheDocument();
    finishVisibleRound();
    expect(screen.getByText("HIDDEN NUMBER")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CHALLENGE SOMEONE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ALL GAMES" })).toBeInTheDocument();
  });
});
