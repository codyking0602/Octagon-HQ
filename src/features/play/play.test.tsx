import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import { FindLeaderHistoryProvider } from "./FindLeaderHistoryProvider";
import PlayPage from "./PlayPage";
import {
  dailyFindLeaderBoard,
  findLeaderAudit,
  findLeaderQuestions,
  scheduledFindLeaderDefinition,
} from "./findLeaderEngine";
import {
  loadFindLeaderHistory,
  recordFindLeaderAttempt,
} from "./findLeaderStorage";
import { playGames } from "./playRegistry";

function renderPlay(path = "/play") {
  return render(
    <IdentityProvider gateway={null}>
      <FindLeaderHistoryProvider repository={null}>
        <ChallengeProvider repository={null}>
          <MemoryRouter initialEntries={[path]}>
            <PlayPage />
          </MemoryRouter>
        </ChallengeProvider>
      </FindLeaderHistoryProvider>
    </IdentityProvider>,
  );
}

describe("Play registry", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = vi.fn();
  });

  it("preserves the approved game order and explanatory descriptions", () => {
    expect(playGames.map((game) => game.id)).toEqual([
      "auction",
      "hit-the-number",
      "find-leader",
      "wavelength",
      "blind-resume",
      "blind-rank",
      "keep-cut",
    ]);
    expect(playGames.find((game) => game.id === "hit-the-number")?.description).toContain("without going over");
    expect(playGames.find((game) => game.id === "wavelength")?.description).toContain("hidden 1–100 rating");
    expect(playGames.find((game) => game.id === "blind-resume")?.description).toContain("UFC career");
    expect(playGames.find((game) => game.id === "blind-resume")?.description).not.toContain("UFC-only career");
    expect(playGames.find((game) => game.id === "blind-rank")?.description).toContain("slot is locked");
  });

  it("renders every game and opens the routed ten-fighter daily board", () => {
    const { container } = renderPlay();
    const titles = [...container.querySelectorAll(".play-game-card > strong")].map((node) => node.textContent);
    expect(titles).toEqual(playGames.map((game) => game.title));

    const daily = container.querySelector<HTMLButtonElement>(".play-daily__challenge");
    expect(daily).not.toBeNull();
    fireEvent.click(daily!);
    expect(container.querySelectorAll(".find-card")).toHaveLength(10);
  });

  it("supports a real horizontal swipe between the daily challenge and leaderboard", () => {
    const { container } = renderPlay();
    const carousel = container.querySelector<HTMLElement>(".play-daily");
    expect(carousel).not.toBeNull();
    fireEvent.touchStart(carousel!, { touches: [{ clientX: 280 }] });
    fireEvent.touchEnd(carousel!, { changedTouches: [{ clientX: 120 }] });
    expect(container.textContent).toContain("Find the LeaderLeaderboard");
  });

  it("deep-links to an exact dated board, shows the normalized score, and preserves shared result actions", () => {
    const day = "2026-07-24";
    const board = dailyFindLeaderBoard(day)!;
    const leaderIndex = board.candidates.findIndex((fighter) => fighter.id === board.leaderId);
    const { container } = renderPlay(`/play/find-leader?day=${day}`);
    const fighterCards = container.querySelectorAll<HTMLButtonElement>(".find-card");
    expect(fighterCards).toHaveLength(10);
    fireEvent.click(fighterCards[leaderIndex]);

    expect(container.querySelector(".find-result-hero h1")?.textContent).toBe("10/100");
    expect(container.querySelector(".find-reveal .section-heading > strong")?.textContent).toBe("1/10");

    const actionLabels = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actionLabels).toEqual(["CHALLENGE SOMEONE", "REPLAY CHALLENGE", "ALL GAMES"]);
  });

  it("offers New Lineup during replayable play and regenerates through the existing replay owner", () => {
    const { container } = renderPlay("/play/find-leader?mode=replayable");
    const firstGame = container.querySelector<HTMLElement>(".find-game");
    const firstChallengeId = firstGame?.dataset.challengeId;
    const newLineup = [...container.querySelectorAll<HTMLButtonElement>(".find-game__hero button")]
      .find((button) => button.textContent === "NEW LINEUP");

    expect(firstChallengeId).toBeTruthy();
    expect(newLineup).toBeDefined();
    fireEvent.click(newLineup!);

    const refreshedGame = container.querySelector<HTMLElement>(".find-game");
    expect(refreshedGame?.dataset.challengeId).toBeTruthy();
    expect(refreshedGame?.dataset.challengeId).not.toBe(firstChallengeId);
    expect(container.querySelectorAll(".find-card")).toHaveLength(10);

    const refreshedCards = [...container.querySelectorAll<HTMLButtonElement>(".find-card")];
    for (const card of refreshedCards) {
      fireEvent.click(card);
      if (container.querySelector(".game-result-actions")) break;
    }

    expect(container.querySelector(".find-result-hero h1")?.textContent)
      .toMatch(/^(?:10|20|30|40|50|60|70|80|90|100)\/100$/);
    const actionLabels = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actionLabels).toEqual(["CHALLENGE SOMEONE", "NEW LINEUP", "ALL GAMES"]);
  });

  it("keeps New Lineup off fixed daily boards", () => {
    const { container } = renderPlay("/play/find-leader");
    const labels = [...container.querySelectorAll<HTMLButtonElement>(".find-game__hero button")].map((button) => button.textContent);
    expect(labels).not.toContain("NEW LINEUP");
  });
});

describe("Find the Leader engine", () => {
  it("owns at least eighty varied UFC-only question definitions", () => {
    expect(findLeaderQuestions.length).toBeGreaterThanOrEqual(80);
    expect(new Set(findLeaderQuestions.map((question) => question.id)).size).toBe(findLeaderQuestions.length);
    expect(new Set(findLeaderQuestions.map((question) => question.family)).size).toBeGreaterThanOrEqual(11);
  });

  it("builds one deterministic ten-fighter daily board with a unique group leader", () => {
    const first = dailyFindLeaderBoard("2026-07-24");
    const second = dailyFindLeaderBoard("2026-07-24");
    expect(first).toEqual(second);
    expect(first).not.toBeNull();
    expect(first!.candidates).toHaveLength(10);
    expect(new Set(first!.candidates.map((fighter) => fighter.id)).size).toBe(10);

    const maximum = Math.max(...first!.candidates.map((fighter) => fighter.value));
    const leaders = first!.candidates.filter((fighter) => fighter.value === maximum);
    expect(leaders).toHaveLength(1);
    expect(leaders[0].id).toBe(first!.leaderId);
    expect(first!.question).toMatch(/^Who leads this group in /);
  });

  it("keeps a broad playable bank and avoids immediate daily repeats", () => {
    const audit = findLeaderAudit();
    expect(audit.validCount).toBeGreaterThanOrEqual(35);

    const days = Array.from({ length: 14 }, (_, index) => `2026-07-${String(16 + index).padStart(2, "0")}`);
    const ids = days.map((day) => scheduledFindLeaderDefinition(day)?.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Find the Leader history", () => {
  beforeEach(() => window.localStorage.clear());

  it("locks the first completed attempt as official while preserving replay best", () => {
    recordFindLeaderAttempt("2026-07-24", 6);
    recordFindLeaderAttempt("2026-07-24", 10);
    const rows = loadFindLeaderHistory();
    expect(rows).toEqual([
      expect.objectContaining({
        day: "2026-07-24",
        officialScore: 6,
        bestScore: 10,
        attempts: 2,
      }),
    ]);
  });
});