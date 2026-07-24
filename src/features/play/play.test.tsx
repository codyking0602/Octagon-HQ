import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
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
    <ChallengeProvider>
      <MemoryRouter initialEntries={[path]}>
        <PlayPage />
      </MemoryRouter>
    </ChallengeProvider>,
  );
}

describe("Play registry", () => {
  beforeEach(() => window.localStorage.clear());

  it("preserves the approved six-game order and explanatory descriptions", () => {
    expect(playGames.map((game) => game.id)).toEqual([
      "find-leader",
      "wavelength",
      "blind-resume",
      "blind-rank",
      "keep-cut",
      "better-than",
    ]);
    expect(playGames.find((game) => game.id === "wavelength")?.description).toContain("hidden 1–100 rating");
    expect(playGames.find((game) => game.id === "blind-resume")?.description).toContain("UFC career");
    expect(playGames.find((game) => game.id === "blind-resume")?.description).not.toContain("UFC-only career");
    expect(playGames.find((game) => game.id === "blind-rank")?.description).toContain("slot is locked");
  });

  it("renders all six games and opens the routed ten-fighter daily board", () => {
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

  it("deep-links to an exact dated board and shows the shared result actions", () => {
    const day = "2026-07-24";
    const board = dailyFindLeaderBoard(day)!;
    const leaderIndex = board.candidates.findIndex((fighter) => fighter.id === board.leaderId);
    const { container } = renderPlay(`/play/find-leader?day=${day}`);
    const fighterCards = container.querySelectorAll<HTMLButtonElement>(".find-card");
    expect(fighterCards).toHaveLength(10);
    fireEvent.click(fighterCards[leaderIndex]);

    const actionLabels = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actionLabels).toEqual(["CHALLENGE SOMEONE", "REPLAY", "ALL GAMES"]);
  });
});

describe("Find the Leader engine", () => {
  it("owns fifty varied UFC-only question definitions", () => {
    expect(findLeaderQuestions).toHaveLength(50);
    expect(new Set(findLeaderQuestions.map((question) => question.id)).size).toBe(50);
    expect(new Set(findLeaderQuestions.map((question) => question.family)).size).toBeGreaterThanOrEqual(8);
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
