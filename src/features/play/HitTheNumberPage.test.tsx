import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createHitTheNumberFormatPlan,
  hitTheNumberSlotAcceptsFighter,
  type HitTheNumberFormatId,
} from "./hitTheNumberFormats";
import HitTheNumberPage from "./HitTheNumberPage";

const challengeHarness = vi.hoisted(() => ({
  beginChallenge: vi.fn(),
  submitResult: vi.fn(),
  match: {
    challenge: null,
    creator: null,
    isRecipient: false,
  } as {
    challenge: null | { code: string; responderResult: unknown; setup?: unknown };
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

function seedForFormat(formatId: HitTheNumberFormatId, boardType: "open-roster" | "random-pool" = "open-roster") {
  for (let index = 0; index < 800; index += 1) {
    const seed = `page-${formatId}-${index}`;
    const plan = createHitTheNumberFormatPlan({ seed, boardType });
    if (plan.format.formatId === formatId) return { seed, plan };
  }
  throw new Error(`No deterministic ${formatId} seed found.`);
}

function challengeEntry(seed: string, boardType: "open-roster" | "random-pool", match?: string) {
  const params = new URLSearchParams({ challenge: seed, board: boardType });
  if (match) params.set("match", match);
  return `/play/hit-the-number?${params.toString()}`;
}

function selectFighterIds(container: HTMLElement, fighterIds: readonly string[]) {
  for (const fighterId of fighterIds) {
    const fighter = container.querySelector<HTMLButtonElement>(`[data-fighter-id="${fighterId}"]`);
    expect(fighter, fighterId).not.toBeNull();
    fireEvent.click(fighter!);
  }
}

function visibleFighterIds(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(".hit-number-fighter-card")]
    .map((card) => card.dataset.fighterId)
    .filter((fighterId): fighterId is string => Boolean(fighterId));
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
    const { seed, plan } = seedForFormat("classic");
    const { container } = renderGame(challengeEntry(seed, "open-roster"));
    selectFighterIds(container, plan.solutionFighterIds);

    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(0);
    const lock = screen.getByRole("button", { name: /LOCK PICKS/ });
    expect(lock).toBeEnabled();
    fireEvent.click(lock);

    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(plan.pickCount);
    expect(container.querySelector(".hit-number-result")?.textContent).toContain("PERFECT");
    expect(container.querySelector(".hit-number-result__score")?.textContent).toMatch(/SCORE100\/100/);
    expect(container.querySelector(".hit-number-roster")).toBeNull();
    expect(screen.getByRole("button", { name: "CHALLENGE SOMEONE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REPLAY CHALLENGE" })).toBeInTheDocument();
  });

  it("sends the exact generated format through the canonical profile challenge composer", async () => {
    const { seed, plan } = seedForFormat("themed-lineup");
    const { container } = renderGame(challengeEntry(seed, "open-roster"));
    selectFighterIds(container, plan.solutionFighterIds);
    fireEvent.click(screen.getByRole("button", { name: /LOCK PICKS/ }));
    fireEvent.click(screen.getByRole("button", { name: "CHALLENGE SOMEONE" }));

    await waitFor(() => expect(challengeHarness.beginChallenge).toHaveBeenCalledTimes(1));
    const draft = challengeHarness.beginChallenge.mock.calls[0]![0] as {
      gameId: string;
      gameVersion: string;
      gameTitle: string;
      summary: string;
      setup: {
        seed: string;
        boardType: string;
        format: { formatId: string; configurationId: string | null };
        publicSetup: { target: number; fighterIds: string[] };
      };
      creatorResult: { score: number; selections: unknown[] };
      shareUrl: string;
    };
    const shareUrl = new URL(draft.shareUrl);

    expect(draft.gameId).toBe("hit-the-number");
    expect(draft.gameVersion).toBe("hit-the-number-v1");
    expect(draft.gameTitle).toBe("Hit the Number");
    expect(draft.setup.seed).toBe(seed);
    expect(draft.setup.boardType).toBe("open-roster");
    expect(draft.setup.format.formatId).toBe("themed-lineup");
    expect(draft.setup.format.configurationId).toBe(plan.format.configurationId);
    expect(draft.setup.publicSetup.target).toBe(plan.target);
    expect(draft.summary).toContain(plan.format.configurationLabel!);
    expect(draft.creatorResult.score).toBe(100);
    expect(draft.creatorResult.selections).toHaveLength(plan.pickCount);
    expect(shareUrl.pathname).toBe("/play/hit-the-number");
    expect(shareUrl.searchParams.get("challenge")).toBe(seed);
    expect(shareUrl.searchParams.get("board")).toBe("open-roster");
  });

  it("loads the recipient on the exact stored Build the Team board and submits the result", async () => {
    const { seed, plan } = seedForFormat("build-the-team", "random-pool");
    challengeHarness.match.challenge = {
      code: "HTN12345",
      responderResult: null,
      setup: {
        seed,
        boardType: plan.boardType,
        format: plan.format,
        publicSetup: {
          version: "hit-the-number-v1",
          statId: plan.statId,
          boardType: plan.boardType,
          target: plan.target,
          pickCount: plan.pickCount,
          filter: {},
          fighterIds: [...plan.fighterIds],
        },
      },
    };
    challengeHarness.match.creator = { displayName: "SHANE" };
    challengeHarness.match.isRecipient = true;

    const { container } = renderGame(challengeEntry(seed, "random-pool", "HTN12345"));

    expect(screen.getByText(/SHANE sent this exact Hit the Number board/i)).toBeInTheDocument();
    expect(container.querySelector(".hit-number-page")).toHaveAttribute("data-format-id", "build-the-team");
    expect(container.querySelector(".hit-number-target strong")?.textContent).toBe(String(plan.target));
    expect(container.textContent).toContain(plan.format.configurationLabel!.toUpperCase());
    expect(screen.queryByRole("button", { name: "OPEN ROSTER" })).not.toBeInTheDocument();

    selectFighterIds(container, plan.solutionFighterIds);
    fireEvent.click(screen.getByRole("button", { name: /LOCK PICKS/ }));

    await waitFor(() => expect(challengeHarness.submitResult).toHaveBeenCalledTimes(1));
    const submitted = challengeHarness.submitResult.mock.calls[0]![0] as { score: number; target: number };
    expect(submitted.target).toBe(plan.target);
    expect(submitted.score).toBe(100);
    expect(screen.getByRole("button", { name: "REPLAY CHALLENGE" })).toBeInTheDocument();
  });

  it("lets the player choose only Open Roster versus Random Pool while the format is generated", () => {
    const { container } = renderGame();

    expect(screen.getByRole("button", { name: "OPEN ROSTER" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "RANDOM POOL" })).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelectorAll("select")).toHaveLength(0);
    expect(container.textContent).not.toContain("ROSTER FILTER");
    expect(container.querySelector(".hit-number-page")?.getAttribute("data-format-id"))
      .toMatch(/classic|themed-lineup|one-from-each|build-the-team/);
  });

  it("switches to a bounded Random Pool and generates a fresh lineup", () => {
    const { container } = renderGame();
    const firstChallengeId = container.querySelector(".hit-number-page")?.getAttribute("data-challenge-id");

    fireEvent.click(screen.getByRole("button", { name: "RANDOM POOL" }));

    const pickCount = Number(container.querySelector(".hit-number-target")?.closest(".hit-number-heading")
      ?.querySelector(".hit-number-meta span")?.textContent?.replace("PICK ", ""));
    const fighterCount = container.querySelectorAll(".hit-number-fighter-card").length;
    expect(pickCount).toBeGreaterThanOrEqual(4);
    expect(pickCount).toBeLessThanOrEqual(7);
    expect(fighterCount).toBeGreaterThan(0);
    expect(fighterCount).toBeLessThanOrEqual(12);
    expect(container.querySelectorAll(".hit-number-stat-value")).toHaveLength(0);
    expect(container.textContent).toContain("RANDOM POOL");
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

  it("builds One From Each through explicit eligible slots and auto-advances", () => {
    const { seed, plan } = seedForFormat("one-from-each");
    const { container } = renderGame(challengeEntry(seed, "open-roster"));
    const roleSlots = [...container.querySelectorAll<HTMLButtonElement>(".hit-number-role-slot")];

    expect(container.querySelector(".hit-number-page")).toHaveAttribute("data-format-id", "one-from-each");
    expect(container.textContent).toContain("ONE FROM EACH");
    expect(container.textContent).toContain(plan.format.configurationLabel!.toUpperCase());
    expect(roleSlots).toHaveLength(5);
    plan.format.slots.forEach((slot, index) => {
      expect(roleSlots[index]?.textContent).toContain(slot.label);
    });
    expect(roleSlots[0]).toHaveClass("is-active");
    expect(visibleFighterIds(container).every(
      (fighterId) => hitTheNumberSlotAcceptsFighter(plan.format.slots[0]!, fighterId),
    )).toBe(true);

    selectFighterIds(container, [plan.solutionFighterIds[0]!]);
    expect(roleSlots[0]).toHaveClass("is-filled");
    expect(roleSlots[1]).toHaveClass("is-active");
    expect(visibleFighterIds(container).every(
      (fighterId) => hitTheNumberSlotAcceptsFighter(plan.format.slots[1]!, fighterId),
    )).toBe(true);

    selectFighterIds(container, plan.solutionFighterIds.slice(1));
    expect(screen.getByRole("button", { name: /LOCK PICKS/ })).toBeEnabled();
  });

  it("builds the team through named roles and lets the player choose another unfinished slot", () => {
    const { seed, plan } = seedForFormat("build-the-team");
    const { container } = renderGame(challengeEntry(seed, "open-roster"));
    const roleSlots = [...container.querySelectorAll<HTMLButtonElement>(".hit-number-role-slot")];

    expect(container.querySelector(".hit-number-page")).toHaveAttribute("data-format-id", "build-the-team");
    expect(container.textContent).toContain("BUILD THE TEAM");
    expect(roleSlots).toHaveLength(5);
    plan.format.slots.forEach((slot, index) => {
      expect(roleSlots[index]?.textContent).toContain(slot.label);
    });

    fireEvent.click(roleSlots[2]!);
    expect(roleSlots[2]).toHaveClass("is-active");
    expect(visibleFighterIds(container).every(
      (fighterId) => hitTheNumberSlotAcceptsFighter(plan.format.slots[2]!, fighterId),
    )).toBe(true);

    fireEvent.click(container.querySelector<HTMLButtonElement>(
      `[data-fighter-id="${plan.solutionFighterIds[2]}"]`,
    )!);
    expect(roleSlots[2]).toHaveClass("is-filled");
    expect(roleSlots[3]).toHaveClass("is-active");
  });

  it("keeps every assigned fighter in the one canonical named role grid", () => {
    const { seed, plan } = seedForFormat("build-the-team");
    const { container } = renderGame(challengeEntry(seed, "open-roster"));
    selectFighterIds(container, plan.solutionFighterIds);
    const slots = container.querySelector(".hit-number-role-slots");
    expect(slots).not.toBeNull();
    expect(slots?.querySelectorAll(".hit-number-role-slot.is-filled")).toHaveLength(plan.pickCount);
    expect(container.querySelector(".hit-number-slots")).toBeNull();
  });
});
