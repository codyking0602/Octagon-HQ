import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FootballKeepCutPage from "./FootballKeepCutPage";
import FootballRankFivePage from "./FootballRankFivePage";
import FootballWavelengthPage from "./FootballWavelengthPage";
import {
  buildFootballKeepCutLineup,
  footballKeepCutBoardIsCompetitive,
  footballKeepCutPacks,
  scoreFootballKeepCutSelection,
} from "./footballKeepCutModel";
import {
  FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS,
  createFootballWavelengthRound,
  footballWavelengthClues,
  nextFootballWavelengthClue,
} from "./footballWavelengthModel";
import { footballRankFivePacks, getFootballRankFivePack } from "./footballRankFiveModel";

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

describe("Football HQ debate games", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("reuses the Football Rank 5 item owner for all Keep 4 / Cut 4 rooms", () => {
    expect(footballKeepCutPacks).toHaveLength(footballRankFivePacks.length);
    for (const pack of footballKeepCutPacks) {
      const ratedPack = getFootballRankFivePack(pack.id);
      expect(pack.items.length).toBeGreaterThanOrEqual(8);
      for (const item of pack.items) expect(ratedPack.items).toContain(item);

      const first = buildFootballKeepCutLineup(pack.id, "keep-cut-proof");
      const second = buildFootballKeepCutLineup(pack.id, "keep-cut-proof");
      expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
      expect(first).toHaveLength(8);
      expect(new Set(first.map((item) => item.id)).size).toBe(8);
      expect(footballKeepCutBoardIsCompetitive(first, pack.items)).toBe(true);

      const ordered = [...first].sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id));
      const perfect = scoreFootballKeepCutSelection(first, ordered.slice(0, 4).map((item) => item.id));
      expect(perfect.score).toBe(100);
      expect(perfect.topFourKept).toBe(4);
    }
  });

  it("uses one UFC-style 1-100 scale instead of switching between opposing axes", () => {
    const categories = new Set(footballWavelengthClues.map((clue) => clue.category));
    expect(categories).toEqual(new Set(FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS.map((anchor) => anchor.category)));
    expect(categories.size).toBe(27);
    expect(footballWavelengthClues).toHaveLength(540);
    expect(footballWavelengthClues.some((clue) => clue.category === "GUNSLINGER" && clue.text === "Patrick Mahomes")).toBe(true);
    expect(footballWavelengthClues.every((clue) => Number.isInteger(clue.rating) && clue.rating >= 1 && clue.rating <= 100)).toBe(true);

    const round = createFootballWavelengthRound("wavelength-proof");
    expect(createFootballWavelengthRound("wavelength-proof")).toEqual(round);
    const lowCorrection = nextFootballWavelengthClue(round, round.target - 15, 1, "wavelength-proof", []);
    const highCorrection = nextFootballWavelengthClue(round, round.target + 15, 1, "wavelength-proof", []);
    expect(lowCorrection.rating).toBeGreaterThan(round.target);
    expect(highCorrection.rating).toBeLessThan(round.target);
    expect(lowCorrection.id).not.toBe(round.clues[0]!.id);
    expect(highCorrection.id).not.toBe(round.clues[0]!.id);
  });

  it("switches Blind Rank Five to a different category through the existing pack owner", () => {
    render(
      <MemoryRouter>
        <FootballRankFivePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("BLIND RANK 5 · FOOTBALL HQ")).toBeInTheDocument();
    const categoryPanel = screen.getByText("CURRENT CATEGORY").parentElement;
    expect(categoryPanel).not.toBeNull();
    const initialCategory = categoryPanel?.querySelector("strong")?.textContent;
    expect(initialCategory).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "SWITCH CATEGORY" }));

    expect(categoryPanel?.querySelector("strong")?.textContent).not.toBe(initialCategory);
  });

  it("switches Keep Four / Cut Four to a different category through the existing pack owner", () => {
    render(
      <MemoryRouter>
        <FootballKeepCutPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("KEEP 4 / CUT 4 · FOOTBALL HQ")).toBeInTheDocument();
    const categoryPanel = screen.getByText("CURRENT CATEGORY").parentElement;
    expect(categoryPanel).not.toBeNull();
    const initialCategory = categoryPanel?.querySelector("strong")?.textContent;
    expect(initialCategory).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "SWITCH CATEGORY" }));

    expect(categoryPanel?.querySelector("strong")?.textContent).not.toBe(initialCategory);
  });

  it("locks eight Keep/Cut calls and reveals the score against the same football ratings", () => {
    render(
      <MemoryRouter>
        <FootballKeepCutPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Keep four from/i)).toBeInTheDocument();
    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "KEEP" }));
    }
    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "CUT" }));
    }

    expect(screen.getByText("YOUR FOUR")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL HQ FOUR")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
  });

  it("plays Football Wavelength through the same four adaptive guess locks as UFC", () => {
    render(
      <MemoryRouter>
        <FootballWavelengthPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("WAVELENGTH · REPLAYABLE GAME")).toBeInTheDocument();
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "LOCK FINAL GUESS" }));

    expect(screen.getByText("FOOTBALL WAVELENGTH · FINAL SCORE")).toBeInTheDocument();
    expect(screen.getByText("HIDDEN NUMBER")).toBeInTheDocument();
    expect(screen.getByText("CLUE REVEAL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
  });
});
