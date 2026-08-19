import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import { FindLeaderHistoryProvider } from "./FindLeaderHistoryProvider";
import PlayPage from "./PlayPage";

function renderPlay(path = "/play") {
  return render(
    <IdentityProvider gateway={null}>
      <ChallengeProvider repository={null}>
        <FindLeaderHistoryProvider repository={null}>
          <MemoryRouter initialEntries={[path]}>
            <PlayPage />
          </MemoryRouter>
        </FindLeaderHistoryProvider>
      </ChallengeProvider>
    </IdentityProvider>,
  );
}

function finishCurrentBoard(container: HTMLElement) {
  for (let index = 0; index < 10; index += 1) {
    if (container.querySelector(".find-result-hero")) return;
    const next = [...container.querySelectorAll<HTMLButtonElement>(".find-card")]
      .find((button) => !button.disabled);
    if (!next) break;
    fireEvent.click(next);
  }
  expect(container.querySelector(".find-result-hero")).toBeTruthy();
}

function boardSignature(container: HTMLElement) {
  const question = container.querySelector(".find-game__hero h1")?.textContent ?? "";
  const fighters = [...container.querySelectorAll(".find-card__name strong")]
    .map((node) => node.textContent)
    .join("|");
  return `${question}:${fighters}`;
}

describe("Find the Leader entry modes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("keeps the large Play Hub card as the fixed official daily", () => {
    const { container } = renderPlay();
    fireEvent.click(container.querySelector<HTMLButtonElement>(".play-daily__challenge")!);

    expect(container.querySelector(".find-game__hero .eyebrow")?.textContent).toBe("TODAY’S CHALLENGE");
    finishCurrentBoard(container);
    const actions = [...container.querySelectorAll(".game-result-actions button")]
      .map((button) => button.textContent);
    expect(actions).toContain("REPLAY TODAY");
  });

  it("opens the All Games card as replayable and generates a new board on New Lineup", () => {
    const { container } = renderPlay();
    const allGamesCard = [...container.querySelectorAll<HTMLButtonElement>(".play-games__grid .play-game-card")]
      .find((button) => button.textContent?.includes("Find the Leader"));
    fireEvent.click(allGamesCard!);

    expect(container.querySelector(".find-game__hero .eyebrow")?.textContent).toBe("REPLAYABLE GAME");
    const firstBoard = boardSignature(container);
    finishCurrentBoard(container);

    const newLineup = [...container.querySelectorAll<HTMLButtonElement>(".game-result-actions button")]
      .find((button) => button.textContent === "NEW LINEUP");
    fireEvent.click(newLineup!);

    expect(container.querySelector(".find-game__hero .eyebrow")?.textContent).toBe("REPLAYABLE GAME");
    expect(boardSignature(container)).not.toBe(firstBoard);
  });
});