import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  OfficialBlindRankCanonicalOrder,
  OfficialBlindRankScoreSummary,
} from "./OfficialBlindRankResult";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

function fighter(id: string, name: string, tier: string) {
  return {
    id,
    name,
    gender: "men",
    divisions: ["Heavyweight"],
    main_era: "Modern",
    thumb_url: `/fighters/${id}.png`,
    profile_url: `/fighters/${id}-profile.png`,
    tier,
  };
}

function completedBlindRankProjection(): TodayChallengeProjection {
  const canonicalOrder = [
    fighter("alpha", "Alpha Fighter", "elite"),
    fighter("bravo", "Bravo Fighter", "great"),
    fighter("charlie", "Charlie Fighter", "good"),
    fighter("delta", "Delta Fighter", "average"),
    fighter("echo", "Echo Fighter", "below-average"),
  ];

  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-08-17",
    scheduleVersion: "play-rotation-v1",
    gameType: "blind_rank_5",
    setupKey: "blind-rank-v3:test",
    contentVersion: "blind-rank-v3",
    scoringVersion: "play-official-score-v1",
    fallbackReason: null,
    publicSetup: {
      pack: {
        id: "heavyweight",
        name: "Heavyweight Careers",
        prompt: "Rank their UFC careers",
        intro: "Place each fighter before the next reveal.",
      },
    },
    progressRevision: 5,
    publicState: {
      complete: true,
      reveal_index: 5,
      slots: canonicalOrder,
      current_fighter: null,
    },
    revealSetup: { canonical_order: canonicalOrder },
    officialAttempt: {
      nativeScore: 7,
      normalizedScore: 70,
      completedAt: "2026-08-17T11:30:00Z",
      publicResult: {
        ordered_ids: ["alpha", "charlie", "bravo", "delta", "echo"],
        correct_comparisons: 7,
      },
    },
    deploymentSha: "test-sha",
  };
}

describe("official Blind Rank result details", () => {
  it("shows the official score, comparison count, canonical order, and broad tiers", () => {
    const projection = completedBlindRankProjection();
    const { container } = render(
      <>
        <OfficialBlindRankScoreSummary projection={projection} />
        <OfficialBlindRankCanonicalOrder projection={projection} />
      </>,
    );

    expect(screen.getByRole("heading", { name: "70/100 · OFFICIAL RESULT" })).toBeInTheDocument();
    expect(screen.getByText("7 OF 10 COMPARISONS CORRECT")).toBeInTheDocument();
    expect(screen.getByText("OCTAGON HQ ORDER")).toBeInTheDocument();
    expect(container.querySelectorAll(".blind-rank-results article")).toHaveLength(5);
    expect(screen.getByText("Heavyweight · ELITE")).toBeInTheDocument();
    expect(screen.getByText("Heavyweight · BELOW AVERAGE")).toBeInTheDocument();
  });

  it("does not render result-only details before Blind Rank is complete", () => {
    const projection = completedBlindRankProjection();
    const incomplete = { ...projection, officialAttempt: null };
    const { container } = render(
      <>
        <OfficialBlindRankScoreSummary projection={incomplete} />
        <OfficialBlindRankCanonicalOrder projection={incomplete} />
      </>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
