import type { ReactNode } from "react";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import BlindRankPage from "./BlindRankPage";
import KeepCutPage from "./KeepCutPage";

function renderGame(element: ReactNode, path: string) {
  return render(
    <IdentityProvider gateway={null}>
      <ChallengeProvider repository={null}>
        <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
      </ChallengeProvider>
    </IdentityProvider>,
  );
}

describe("random category lineup controls", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("gives Blind Rank casual players only New Lineup and rerolls the category", () => {
    const { container } = renderGame(<BlindRankPage />, "/play/blind-rank?pack=lightweight");

    expect(container.querySelector("select")).toBeNull();
    const button = container.querySelector<HTMLButtonElement>(".blind-rank-controls button");
    expect(button?.textContent).toBe("NEW LINEUP");
    const firstCategory = container.querySelector(".blind-rank-game > header span")?.textContent;
    expect(firstCategory).toBeTruthy();

    fireEvent.click(button!);

    const nextCategory = container.querySelector(".blind-rank-game > header span")?.textContent;
    expect(nextCategory).toBeTruthy();
    expect(nextCategory).not.toBe(firstCategory);
  });

  it("gives Keep 4 Cut 4 casual players only New Lineup and rerolls the category", () => {
    const { container } = renderGame(<KeepCutPage />, "/play/keep-cut?pack=ufc-careers");

    expect(container.querySelector("select")).toBeNull();
    const button = container.querySelector<HTMLButtonElement>(".keep-cut-new-lineup");
    expect(button?.textContent).toBe("NEW LINEUP");
    const firstCategory = container.querySelector(".keep-cut-progress span")?.textContent;
    expect(firstCategory).toBeTruthy();

    fireEvent.click(button!);

    const nextCategory = container.querySelector(".keep-cut-progress span")?.textContent;
    expect(nextCategory).toBeTruthy();
    expect(nextCategory).not.toBe(firstCategory);
  });
});
