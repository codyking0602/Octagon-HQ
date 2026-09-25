import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MlbFeaturedChallengePage, {
  MLB_FIND_LEADER_BURNED_CONTENT,
  MLB_FIND_LEADER_PREVIEW_BOARDS,
} from "./MlbFeaturedChallengePage";
import { mlbTeamAssetByAbbreviation } from "./mlbTeamAssets";

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    status: "ready",
    profile: { id: "test-profile", displayName: "CODY", initials: "C", canControlPicks: true },
  }),
}));

vi.mock("./useMlbPlayChallengeOverview", () => ({
  useMlbPlayChallengeOverview: () => ({
    overview: { unlocked: false, playerCount: 0, ownResult: null, entries: [] },
    loading: false,
    error: "",
    reload: vi.fn(async () => undefined),
  }),
}));

vi.mock("./mlbPlayChallenge", () => ({
  MLB_PLAY_CURRENT_CHALLENGE_KEY: "mlb-2026-play-01",
  recordMlbPlayChallengeResult: vi.fn(async () => ({
    rawScore: 10,
    gameType: "find_leader",
    publicResult: { game_scores: [10, 10], average_score: 10 },
    resultDetail: {},
    completedAt: "2026-09-29T12:00:00-05:00",
  })),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <MlbFeaturedChallengePage />
    </MemoryRouter>,
  );
}

function leaderFor(board: (typeof MLB_FIND_LEADER_PREVIEW_BOARDS)[number]) {
  return board.candidates.reduce((leader, candidate) => (
    (candidate.value ?? 0) > (leader.value ?? 0) ? candidate : leader
  ));
}

describe("MLB Find the Leader format preview", () => {
  it("locks both tuning boards as burned content and keeps ten players per board", () => {
    expect(MLB_FIND_LEADER_PREVIEW_BOARDS).toHaveLength(2);
    expect(MLB_FIND_LEADER_PREVIEW_BOARDS.every((board) => board.candidates.length === 10)).toBe(true);

    const ids = MLB_FIND_LEADER_PREVIEW_BOARDS.flatMap((board) => board.candidates.map((candidate) => candidate.id));
    expect(MLB_FIND_LEADER_BURNED_CONTENT.questionIds).toEqual(
      MLB_FIND_LEADER_PREVIEW_BOARDS.map((board) => board.id),
    );
    expect(MLB_FIND_LEADER_BURNED_CONTENT.candidateIds).toEqual([...new Set(ids)]);
    expect(MLB_FIND_LEADER_PREVIEW_BOARDS.every((board) => board.candidates.every((candidate) => (
      Boolean(mlbTeamAssetByAbbreviation(candidate.teamAbbreviation))
    )))).toBe(true);
  });

  it("reuses the locked Football presentation without visible prototype language", () => {
    const { container } = renderPage();

    expect(container.querySelector(".football-find-hero")).toBeTruthy();
    expect(container.querySelector(".football-find-hero__status")).toBeTruthy();
    expect(container.querySelector(".football-find-grid")).toBeTruthy();
    expect(container.querySelectorAll(".football-find-card")).toHaveLength(10);
    expect(container.querySelector(".mlb-find-leader-page")).toBeTruthy();
    expect(container.textContent).toContain("GAME 1 OF 2");
    expect(container.textContent).not.toMatch(/demo|owner design|disposable/i);
  });

  it("runs two boards back to back and averages their scores", () => {
    const { container, getByRole } = renderPage();
    const firstLeader = leaderFor(MLB_FIND_LEADER_PREVIEW_BOARDS[0]);

    const playerButton = (name: string) => [...container.querySelectorAll<HTMLButtonElement>(".football-find-card")]
      .find((button) => button.textContent?.includes(name));

    fireEvent.click(playerButton(firstLeader.name)!);
    expect(container.textContent).toContain("GAME 1 COMPLETE");
    expect(container.textContent).toContain("10/100");

    fireEvent.click(getByRole("button", { name: /next game/i }));
    expect(container.textContent).toContain("GAME 2 OF 2");

    const secondLeader = leaderFor(MLB_FIND_LEADER_PREVIEW_BOARDS[1]);
    fireEvent.click(playerButton(secondLeader.name)!);

    expect(container.querySelector(".mlb-find-final-score")?.textContent).toContain("10/100");
    expect(container.querySelector(".mlb-find-final-score")?.textContent).toContain("GAME 1 10");
    expect(container.querySelector(".mlb-find-final-score")?.textContent).toContain("GAME 2 10");
    expect(container.querySelector(".mlb-find-final-score")?.textContent).toContain("average");
  });
});
