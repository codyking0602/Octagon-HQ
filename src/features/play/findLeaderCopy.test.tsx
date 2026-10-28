import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import { FindLeaderHistoryProvider } from "./FindLeaderHistoryProvider";
import PlayPage from "./PlayPage";

function renderFindLeader(path: string) {
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

describe("Find the Leader copy", () => {
  it("uses clear unique-opponent wording without repeating the stat in the helper", () => {
    const { container } = renderFindLeader(
      "/play/find-leader?definition=unique-opponents-finished&seed=copy-clarity&day=2026-08-19",
    );

    expect(container.querySelector(".find-game__hero h1")?.textContent)
      .toBe("Who has finished the most unique UFC opponents?");
    expect(container.querySelector(".find-game__hero > div > p:not(.eyebrow)")?.textContent)
      .toBe("Eliminate fighters until only the leader remains.");
    expect(container.textContent).not.toContain("different UFC opponents finished");
  });
});
