import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGeneratedHitTheNumberBoard } from "./hitTheNumberEngine";
import HitTheNumberPage from "./HitTheNumberPage";

const challengeHarness = vi.hoisted(() => ({
  beginChallenge: vi.fn(),
  submitResult: vi.fn(),
  match: {
    challenge: null,
    creator: null,
    isRecipient: false,
  } as {
    challenge: null | { code: string; responderResult: unknown };
    creator: null | { displayName: string };
    isRecipient: boolean;
  },
}));

vi.mock("../challenges/ChallengeProvider", () => ({
  usePlayChallenges: () => ({ beginChallenge: challengeHarness.beginChallenge }),
}));

vi.mock("../challenges/challengeRuntime", () => ({
  useProfileChallengeMatch: () => ({
    ...challengeHarness.match,
    submitResult: challengeHarness.submitResult,
  }),
}));

function renderGame(initialEntry = "/play/hit-the-number") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <HitTheNumberPage />
    </MemoryRouter>,
  );
}

function selectRequiredFighters(container: HTMLElement) {
  const pickCount = container.querySelectorAll(".hit-number-slot").length;
  const fighters = [...container.querySelectorAll<HTMLButtonElement>(".hit-number-fighter-card")];
  expect(fighters.length).toBeGreaterThanOrEqual(pickCount);
  fighters.slice(0, pickCount).forEach((fighter) => fireEvent.click(fighter));
  return pickCount;
}

describe("Hit the Number casual game", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), configurable: true });
    challengeHarness.beginChallenge.mockReset();
    challengeHarness.beginChallenge.mockResolvedValue("CHOOSE AN OCTAGON HQ PROFILE");
    challengeHarness.submitResult.mockReset();
    challengeHarness.match.challenge = null;
    challengeHarness.match.creator = null;
    challengeHarness.match.isRecipient = false;
  });

  it("keeps fighter values hidden until lock, then reveals the result and normalized score", () => {
    const { container } = renderGame();
    const pickCount = selectRequiredFighters(container);

    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(0);
    const lock = screen.getByRole("button", { name: /LOCK PICKS/ });
    expect(lock).toBeEnabled();
    fireEvent.click(lock);

    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(pickCount);
    expect(container.querySelector(".hit-number-result")?.textContent).toMatch(/PERFECT|BUST|\d+ OFF/);
    expect(container.querySelector(".hit-number-result__score")?.textContent).toMatch(/SCORE\d+\/100/);
    expect(container.querySelector(".hit-number-roster")).toBeNull();
    expect(screen.getByRole("button", { name: "CHALLENGE SOMEONE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW LINEUP" })).toBeInTheDocument();
  });

  it("sends the completed exact board through the canonical profile challenge composer", async () => {
    const { container } = renderGame();
    selectRequiredFighters(container);
    fireEvent.click(screen.getByRole("button", { name: /LOCK PICKS/ }));
    fireEvent.click(screen.getByRole("button", { name: "CHALLENGE SOMEONE" }));

    await waitFor(() => expect(challengeHarness.beginChallenge).toHaveBeenCalledTimes(1));
    const draft = challengeHarness.beginChallenge.mock.calls[0]![0] as {
      gameId: string;
      gameVersion: string;
      gameTitle: string;
      setup: { seed: string; boardType: string; publicSetup: { target: number; fighterIds: string[] } };
      creatorResult: { score: number; selections: unknown[] };
      shareUrl: string;
    };
    const shareUrl = new URL(draft.shareUrl);

    expect(draft.gameId).toBe("hit-the-number");
    expect(draft.gameVersion).toBe("hit-the-number-v1");
    expect(draft.gameTitle).toBe("Hit the Number");
    expect(draft.setup.seed).not.toBe("");
    expect(draft.setup.boardType).toBe("open-roster");
    expect(draft.setup.publicSetup.target).toBeGreaterThan(0);
    expect(draft.creatorResult.score).toBeGreaterThanOrEqual(0);
    expect(draft.creatorResult.selections.length).toBeGreaterThanOrEqual(4);
    expect(shareUrl.pathname).toBe("/play/hit-the-number");
    expect(shareUrl.searchParams.get("challenge")).toBe(draft.setup.seed);
    expect(shareUrl.searchParams.get("board")).toBe("open-roster");
  });

  it("loads the recipient on the exact deterministic board and submits the result", async () => {
    const seed = "profile-hit-number-exact-board";
    const expectedBoard = createGeneratedHitTheNumberBoard({ seed, boardType: "random-pool" });
    challengeHarness.match.challenge = { code: "HTN12345", responderResult: null };
    challengeHarness.match.creator = { displayName: "SHANE" };
    challengeHarness.match.isRecipient = true;

    const { container } = renderGame(
      `/play/hit-the-number?challenge=${encodeURIComponent(seed)}&board=random-pool&match=HTN12345`,
    );

    expect(screen.getByText(/SHANE sent this exact Hit the Number board/i)).toBeInTheDocument();
    expect(container.querySelectorAll(".hit-number-fighter-card"))
      .toHaveLength(expectedBoard.publicSetup.fighterIds.length);
    expect(container.querySelector(".hit-number-target strong")?.textContent)
      .toBe(String(expectedBoard.publicSetup.target));
    expect(screen.queryByRole("button", { name: "OPEN ROSTER" })).not.toBeInTheDocument();

    selectRequiredFighters(container);
    fireEvent.click(screen.getByRole("button", { name: /LOCK PICKS/ }));

    await waitFor(() => expect(challengeHarness.submitResult).toHaveBeenCalledTimes(1));
    const submitted = challengeHarness.submitResult.mock.calls[0]![0] as { score: number; target: number };
    expect(submitted.target).toBe(expectedBoard.publicSetup.target);
    expect(submitted.score).toBeGreaterThanOrEqual(0);
    expect(screen.getByRole("button", { name: "REPLAY CHALLENGE" })).toBeInTheDocument();
  });

  it("lets the player choose only Open Roster versus Random Pool", () => {
    const { container } = renderGame();

    expect(screen.getByRole("button", { name: "OPEN ROSTER" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "RANDOM POOL" })).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelectorAll("select")).toHaveLength(0);
    expect(container.textContent).not.toContain("ROSTER FILTER");
  });

  it("switches to a bounded Random Pool and generates a fresh lineup", () => {
    const { container } = renderGame();
    const firstChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");

    fireEvent.click(screen.getByRole("button", { name: "RANDOM POOL" }));

    const pickCount = container.querySelectorAll(".hit-number-slot").length;
    const fighterCount = container.querySelectorAll(".hit-number-fighter-card").length;
    expect(fighterCount).toBeGreaterThanOrEqual(pickCount);
    expect(fighterCount).toBeLessThanOrEqual(12);
    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(0);
    expect(container.textContent).toContain(`${fighterCount}-fighter pool`);
    expect(screen.getByRole("button", { name: "RANDOM POOL" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id"))
      .not.toBe(firstChallengeId);
  });

  it("searches the generated Open Roster and NEW LINEUP clears the search with a fresh identity", () => {
    const { container } = renderGame();
    const firstCard = container.querySelector<HTMLButtonElement>(".hit-number-fighter-card")!;
    const firstName = firstCard.querySelector("strong")!.textContent!;
    const search = screen.getByPlaceholderText("Search by name");
    fireEvent.change(search, { target: { value: firstName } });
    expect(container.querySelectorAll(".hit-number-fighter-card")).toHaveLength(1);

    const firstChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");
    fireEvent.click(screen.getByRole("button", { name: "NEW LINEUP" }));
    const secondChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");
    expect(secondChallengeId).not.toBe(firstChallengeId);
    expect(screen.getByPlaceholderText("Search by name")).toHaveValue("");
  });

  it("keeps every selected fighter in the one canonical slot grid", () => {
    const { container } = renderGame();
    const pickCount = selectRequiredFighters(container);
    const slots = container.querySelector(".hit-number-slots");
    expect(slots).not.toBeNull();
    expect(slots?.querySelectorAll(".hit-number-slot.is-filled")).toHaveLength(pickCount);
  });
});
