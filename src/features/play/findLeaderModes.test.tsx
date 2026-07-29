import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import PlayPage from "./PlayPage";

function renderPlay(path = "/play") {
  return render(
    <IdentityProvider gateway={null}>
      <ChallengeProvider repository={null}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/play" element={<PlayPage />} />
            <Route path="/play/find-leader" element={<PlayPage />} />
          </Routes>
        </MemoryRouter>
      </ChallengeProvider>
    </IdentityProvider>,
  );
}

describe("Find the Leader entry modes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("keeps the hero card as the fixed official daily challenge", () => {
    const { container } = renderPlay();
    fireEvent.click(container.querySelector<HTMLButtonElement>(".play-daily__challenge")!);
    expect(container.querySelector(".find-game__hero .eyebrow")?.textContent).toBe("TODAY’S CHALLENGE");
  });

  it("opens the All Games card as a separate replayable casual game", () => {
    const { container } = renderPlay();
    const allGamesFindLeader = container.querySelector<HTMLButtonElement>(".play-games__grid .play-game-card");
    fireEvent.click(allGamesFindLeader!);
    expect(container.querySelector(".find-game__hero .eyebrow")?.textContent).toBe("CASUAL GAME");
    expect(container.textContent).not.toContain("REPLAY TODAY");
  });
});
