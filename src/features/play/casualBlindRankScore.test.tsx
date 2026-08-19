import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import BlindRankPage from "./BlindRankPage";
import { createBlindRankLineup } from "./blindRankEngine";
import { scoreBlindRankOrderedRatings } from "./officialScoreContract";
import { blindRankRating } from "./playFighterPool";

function renderBlindRank(path: string) {
  return render(
    <IdentityProvider gateway={null}><ChallengeProvider>
      <MemoryRouter initialEntries={[path]}>
        <BlindRankPage />
      </MemoryRouter>
    </ChallengeProvider></IdentityProvider>,
  );
}

describe("casual Blind Rank score", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("mirrors the official ten-comparison rule including the one-point rating tolerance", () => {
    expect(scoreBlindRankOrderedRatings([80, 81, 70, 60, 50])).toEqual({
      correctComparisons: 10,
      normalizedScore: 100,
    });
    expect(scoreBlindRankOrderedRatings([79, 81, 70, 60, 50])).toEqual({
      correctComparisons: 9,
      normalizedScore: 90,
    });
    expect(scoreBlindRankOrderedRatings([50, 60, 70, 80, 90])).toEqual({
      correctComparisons: 0,
      normalizedScore: 0,
    });
    expect(() => scoreBlindRankOrderedRatings([80, 70, 60, 50])).toThrow(RangeError);
  });

  it("shows the 0–100 score and Octagon HQ order after the fifth casual placement", () => {
    const packId = "ufc-careers" as const;
    const lineup = [...createBlindRankLineup(packId, "casual-score-proof").fighters]
      .sort((left, right) => blindRankRating(right, packId) - blindRankRating(left, packId));
    const query = lineup.map((fighter) => fighter.id).join(",");
    const { container } = renderBlindRank(`/play/blind-rank?pack=${packId}&lineup=${query}`);

    expect(container.querySelector('[aria-label="Blind Rank score"]')).toBeNull();

    for (let placement = 0; placement < 5; placement += 1) {
      fireEvent.click(container.querySelector<HTMLButtonElement>(".blind-rank-slot:not(.is-filled)")!);
    }

    const score = container.querySelector('[aria-label="Blind Rank score"]');
    expect(score?.textContent).toContain("100/100");
    expect(score?.textContent).toContain("FIVE PLACEMENTS GRADED AGAINST OCTAGON HQ");
    expect(container.textContent).toContain("YOUR FINAL RANKING");
    expect(container.textContent).toContain("OCTAGON HQ ORDER");
    expect(container.querySelectorAll('[aria-label="Your final ranking"] article')).toHaveLength(5);
    expect(container.querySelectorAll('[aria-label="Octagon HQ order"] article')).toHaveLength(5);
  });
});
