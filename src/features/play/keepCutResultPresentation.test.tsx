import type { ReactNode } from "react";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import { FindLeaderHistoryProvider } from "./FindLeaderHistoryProvider";
import KeepCutPage from "./KeepCutPage";
import { OfficialTodayChallengeView } from "./OfficialTodayChallengePage";
import { createKeepCutLineup, scoreKeepCutSelection } from "./keepCutEngine";
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

function presentedFighter(id: string) {
  return {
    id,
    name: `Fighter ${id}`,
    gender: "men",
    divisions: ["Lightweight"],
    main_era: "Modern",
    thumb_url: `/fighters/${id}.png`,
    profile_url: `/fighters/${id}-profile.png`,
  };
}

function officialProjection(): TodayChallengeProjection {
  const kept = ["one", "two", "three", "four"].map(presentedFighter);
  const cut = ["five", "six", "seven", "eight"].map(presentedFighter);
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
      kept,
      cut,
      current_fighter: null,
      reveal: { model_top_four_ids: ["one", "two", "three", "five"] },
    },
    revealSetup: { model_top_four_ids: ["one", "two", "three", "five"] },
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
  expect(container.textContent).toContain("Your four keeps are graded against the strongest four fighters on this board.");
  expect(container.textContent).not.toMatch(/OF 16 COMPARISONS/i);
  expect(container.textContent).not.toMatch(/COMPARISONS WON/i);
  expect(container.textContent).not.toContain("Every kept fighter is compared with every cut fighter");
}

describe("Keep 4, Cut 4 result presentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("keeps the normal result focused on the /100 score and Octagon HQ top four", () => {
    const { container } = renderAt(<KeepCutPage />, "/play/keep-cut?pack=ufc-careers");
    finishFirstFourKept(container);
    expectVisibleResultContract(container);
    expect(container.textContent).not.toContain("OFFICIAL RESULT");
  });

  it("uses the same visible contract for a shared friend challenge while preserving the score math", () => {
    const lineup = createKeepCutLineup("ufc-careers", "result-copy-friend");
    const query = lineup.fighters.map((fighter) => fighter.id).join(",");
    const expected = scoreKeepCutSelection(
      "ufc-careers",
      lineup.fighters,
      lineup.fighters.slice(0, 4).map((fighter) => fighter.id),
    );
    const { container } = renderAt(<KeepCutPage />, `/play/keep-cut?pack=ufc-careers&lineup=${query}`);
    finishFirstFourKept(container);
    expect(container.textContent).toContain(`${expected.score}/100`);
    expectVisibleResultContract(container, expected.modelTopFourKept);
  });

  it("keeps the official Today’s Challenge result aligned without exposing its hidden comparison count", () => {
    const { container } = render(
      <OfficialTodayChallengeView
        projection={officialProjection()}
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