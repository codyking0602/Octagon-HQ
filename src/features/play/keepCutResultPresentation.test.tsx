import type { ReactNode } from "react";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import { FindLeaderHistoryProvider } from "./FindLeaderHistoryProvider";
import KeepCutPage from "./KeepCutPage";
import { OfficialTodayChallengeView } from "./OfficialTodayChallengePage";
import { createKeepCutLineup, keepCutRating, scoreKeepCutSelection } from "./keepCutEngine";
import type { PlayFighter } from "./playFighterPool";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

function renderAt(element: ReactNode, path: string) {
  return render(
    <IdentityProvider gateway={null}>
      <FindLeaderHistoryProvider repository={null}>
        <ChallengeProvider repository={null}>
          <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
        </ChallengeProvider>
      </FindLeaderHistoryProvider>
    </IdentityProvider>,
  );
}

function makeDecision(container: HTMLElement, choice: "keep" | "cut") {
  const button = container.querySelector<HTMLButtonElement>(`.keep-cut-current__actions .${choice}`);
  expect(button).toBeTruthy();
  fireEvent.click(button!);
}

function finishFirstFourKept(container: HTMLElement) {
  for (let index = 0; index < 4; index += 1) makeDecision(container, "keep");
  for (let index = 0; index < 4; index += 1) makeDecision(container, "cut");
}

function rankedLineup(seed: string) {
  const lineup = createKeepCutLineup("ufc-careers", seed);
  return [...lineup.fighters].sort((left, right) => {
    const ratingDifference = keepCutRating("ufc-careers", right) - keepCutRating("ufc-careers", left);
    return ratingDifference || left.id.localeCompare(right.id);
  });
}

function threeOfFourBoard(seed: string) {
  const ranked = rankedLineup(seed);
  const board = [ranked[0]!, ranked[1]!, ranked[2]!, ranked[7]!, ranked[3]!, ranked[4]!, ranked[5]!, ranked[6]!];
  return { board, ranked, kept: board.slice(0, 4), cut: board.slice(4) };
}

function presentedFighter(fighter: PlayFighter) {
  return {
    id: fighter.id,
    name: fighter.name,
    gender: fighter.gender,
    divisions: fighter.divisions,
    main_era: fighter.mainEra,
    thumb_url: fighter.thumbUrl,
    profile_url: fighter.profileUrl,
  };
}

function officialProjection(): TodayChallengeProjection {
  const { board, ranked, kept, cut } = threeOfFourBoard("result-breakdown-official");
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-08-18",
    scheduleVersion: "play-rotation-v3",
    gameType: "keep_4_cut_4",
    setupKey: "keep_4_cut_4:test",
    contentVersion: "keep-cut-v3",
    scoringVersion: "play-official-score-v1",
    fallbackReason: null,
    publicSetup: {
      pack: {
        id: "ufc-careers",
        group: "Careers",
        name: "UFC Careers",
        prompt: "Keep four UFC careers. Cut four.",
        description: "UFC-only career value.",
      },
    },
    progressRevision: 8,
    publicState: {
      complete: true,
      reveal_index: 8,
      kept: kept.map(presentedFighter),
      cut: cut.map(presentedFighter),
      current_fighter: null,
      reveal: { model_top_four_ids: ranked.slice(0, 4).map((fighter) => fighter.id) },
    },
    revealSetup: {
      fighters: board.map(presentedFighter),
      model_top_four_ids: ranked.slice(0, 4).map((fighter) => fighter.id),
    },
    officialAttempt: {
      nativeScore: 12,
      normalizedScore: 75,
      completedAt: "2026-08-18T05:15:00Z",
      publicResult: {
        kept_ids: kept.map((fighter) => fighter.id),
        correct_comparisons: 12,
      },
    },
    deploymentSha: "test-sha",
  };
}

function expectVisibleResultContract(container: HTMLElement, topFourKept?: number) {
  expect(container.textContent).toMatch(/\d+\/100/);
  if (topFourKept === undefined) {
    expect(container.textContent).toMatch(/\d OF OCTAGON HQ’S TOP 4 KEPT/);
  } else {
    expect(container.textContent).toContain(`${topFourKept} OF OCTAGON HQ’S TOP 4 KEPT`);
  }
  expect(container.textContent).toContain("OCTAGON HQ TOP 4");
  expect(container.querySelectorAll(".keep-cut-top-four__fighter")).toHaveLength(4);
  expect(container.textContent).toContain("YOUR BOARD");
  expect(container.textContent).toContain("FINAL CALLS");
  expect(container.querySelectorAll(".keep-cut-result-fighter")).toHaveLength(8);
  expect(container.querySelectorAll(".keep-cut-result-group")).toHaveLength(0);
  expect(container.textContent).not.toMatch(/OF 16 COMPARISONS/i);
  expect(container.textContent).not.toMatch(/COMPARISONS WON/i);
  expect(container.textContent).not.toContain("Every kept fighter is compared with every cut fighter");
}

describe("Keep 4, Cut 4 result presentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("shows the normal result with the actual top four in a compact final board", () => {
    const { container } = renderAt(<KeepCutPage />, "/play/keep-cut?pack=ufc-careers");
    finishFirstFourKept(container);
    expectVisibleResultContract(container);
    expect(container.textContent).not.toContain("OFFICIAL RESULT");
  });

  it("explains a friend-challenge miss while preserving the existing score math", () => {
    const { board, ranked } = threeOfFourBoard("result-breakdown-friend");
    const query = board.map((fighter) => fighter.id).join(",");
    const expected = scoreKeepCutSelection(
      "ufc-careers",
      board,
      board.slice(0, 4).map((fighter) => fighter.id),
    );
    const { container } = renderAt(<KeepCutPage />, `/play/keep-cut?pack=ufc-careers&lineup=${query}`);
    finishFirstFourKept(container);
    expect(container.textContent).toContain(`${expected.score}/100`);
    expectVisibleResultContract(container, 3);
    expect(container.textContent).toContain(`You kept ${ranked[7]!.name} over ${ranked[3]!.name}.`);
    expect(container.querySelector(".keep-cut-miss")?.textContent).toMatch(/rating|tiebreak/i);
  });

  it("uses the same breakdown for official Today without exposing its hidden comparison count", () => {
    const projection = officialProjection();
    const { container } = render(
      <OfficialTodayChallengeView
        projection={projection}
        busy={false}
        onAdvance={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(container.textContent).toContain("75/100 · OFFICIAL RESULT");
    expectVisibleResultContract(container, 3);
    expect(container.textContent).not.toContain("12 OF 16");
  });
});