import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FootballRankFivePage from "./FootballRankFivePage";
import { footballSubjectAssetPath } from "./FootballSubjectVisual";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
} from "./footballRankFiveModel";

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

describe("Football Blind Rank 5", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("owns the mature comparison universe across both leagues", () => {
    expect(footballRankFivePacks).toHaveLength(13);
    expect(footballRankFivePacks.filter((pack) => pack.items.every((item) => item.league === "NFL"))).toHaveLength(8);
    expect(footballRankFivePacks.filter((pack) => pack.items.every((item) => item.league === "CFB"))).toHaveLength(5);

    const subjects = footballRankFivePacks.flatMap((pack) => pack.items);
    expect(subjects.length).toBeGreaterThanOrEqual(350);
    expect(new Set(subjects.map((item) => item.id)).size).toBe(subjects.length);

    for (const pack of footballRankFivePacks) {
      expect(pack.items.length).toBeGreaterThanOrEqual(15);
      expect(new Set(pack.items.map((item) => item.id)).size).toBe(pack.items.length);
      expect(pack.items.every((item) => Number.isInteger(item.rating) && item.rating >= 0 && item.rating <= 100)).toBe(true);
    }
  });

  it("builds deterministic five-item lineups with non-flat rating separation", () => {
    for (const pack of footballRankFivePacks) {
      const first = buildFootballRankFiveLineup(pack.id, "rank-five-proof");
      const second = buildFootballRankFiveLineup(pack.id, "rank-five-proof");
      expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
      expect(first).toHaveLength(5);
      expect(new Set(first.map((item) => item.id)).size).toBe(5);
      const ratings = first.map((item) => item.rating);
      expect(Math.max(...ratings) - Math.min(...ratings)).toBeGreaterThanOrEqual(4);
    }
  });

  it("uses one canonical football asset path convention for the expanded packs", () => {
    expect(footballSubjectAssetPath("patrick-mahomes", "nfl-quarterbacks"))
      .toBe("/images/football/players/patrick-mahomes.webp");
    expect(footballSubjectAssetPath("jerry-rice", "nfl-wide-receivers"))
      .toBe("/images/football/players/jerry-rice.webp");
    expect(footballSubjectAssetPath("lawrence-taylor", "nfl-defensive-players"))
      .toBe("/images/football/players/lawrence-taylor.webp");
    expect(footballSubjectAssetPath("1985-chicago-bears", "nfl-team-seasons"))
      .toBe("/images/football/teams/1985-chicago-bears.webp");
    expect(footballSubjectAssetPath("nick-saban-cfb", "college-head-coaches"))
      .toBe("/images/football/coaches/nick-saban-cfb.webp");
    expect(footballSubjectAssetPath("alabama-2009-2020", "college-program-eras"))
      .toBe("/images/football/programs/alabama-2009-2020.webp");
  });

  it("locks all five placements and reveals the final score and canonical order", () => {
    render(
      <MemoryRouter>
        <FootballRankFivePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("BLIND RANK 5")).toBeInTheDocument();
    for (let rank = 1; rank <= 5; rank += 1) {
      fireEvent.click(screen.getByRole("button", { name: `Place current item at rank ${rank}` }));
    }

    expect(screen.getByLabelText("Football Blind Rank 5 score")).toHaveTextContent("/100");
    expect(screen.getByText("YOUR FINAL RANKING")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL HQ ORDER")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
  });
});
