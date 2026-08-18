import type { ReactNode } from "react";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import { FindLeaderHistoryProvider } from "./FindLeaderHistoryProvider";
import KeepCutPage from "./KeepCutPage";
import PlayPage from "./PlayPage";
import {
  KEEP_CUT_PACKS,
  KEEP_CUT_ROLES,
  createKeepCutLineup,
  keepCutBoardIsCompetitive,
  keepCutTier,
  keepCutRating,
  resolveKeepCutChallenge,
  scoreKeepCutSelection,
} from "./keepCutEngine";
import { getPlayFighter } from "./playFighterPool";

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

function badCount(packId: (typeof KEEP_CUT_PACKS)[number]["id"], seed: string) {
  const lineup = createKeepCutLineup(packId, seed);
  return lineup.fighters.filter((fighter) => keepCutTier(keepCutRating(packId, fighter)) === "bad").length;
}

function makeKeepCutDecision(container: HTMLElement, choice: "keep" | "cut") {
  const button = container.querySelector<HTMLButtonElement>(`.keep-cut-current__actions .${choice}`);
  expect(button).toBeTruthy();
  fireEvent.click(button!);
}

describe("Keep 4, Cut 4 engine", () => {
  it("preserves canonical Play categories and the Keep/Cut-owned board-style owner", () => {
    expect(KEEP_CUT_PACKS).toHaveLength(8);
    expect(KEEP_CUT_ROLES.map((role) => role.id)).toEqual([
      "knife-edge",
      "messy-middle",
      "one-superstar",
      "bottom-grind",
      "classic-spread",
    ]);
  });

  it("builds deterministic unique competitive eight-fighter lineups with no more than two Bad fighters", () => {
    for (const pack of KEEP_CUT_PACKS) {
      const first = createKeepCutLineup(pack.id, `proof-${pack.id}`);
      const second = createKeepCutLineup(pack.id, `proof-${pack.id}`);
      expect(first.fighters.map((fighter) => fighter.id)).toEqual(second.fighters.map((fighter) => fighter.id));
      expect(first.fighters).toHaveLength(8);
      expect(new Set(first.fighters.map((fighter) => fighter.id)).size).toBe(8);
      expect(keepCutBoardIsCompetitive(pack.id, first.fighters)).toBe(true);
      expect(first.attemptsUsed).toBeLessThanOrEqual(36);
      const badFighters = first.fighters.filter((fighter) => keepCutTier(keepCutRating(pack.id, fighter)) === "bad");
      expect(badFighters.length).toBeLessThanOrEqual(2);
    }
  });

  it("keeps bad fighter exposure bounded across repeated boards", () => {
    const counts = Array.from({ length: 120 }, (_, index) => badCount("all-careers", `two-bad-proof-${index}`));
    expect(Math.max(...counts)).toBeLessThanOrEqual(2);
    expect(counts.some((count) => count > 0)).toBe(true);
  });

  it("resolves the exact shared pack and blind reveal order", () => {
    const lineup = createKeepCutLineup("ufc-careers", "shared-proof");
    const resolved = resolveKeepCutChallenge("ufc-careers", lineup.fighters.map((fighter) => fighter.id));
    expect(resolved?.map((fighter) => fighter.id)).toEqual(lineup.fighters.map((fighter) => fighter.id));
  });

  it("uses named UFC eras for the two play-only wildcard fighters", () => {
    expect(getPlayFighter("cm-punk")?.mainEra).toBe("Superstar Era");
    expect(getPlayFighter("kimbo-slice")?.mainEra).toBe("TUF Boom");
  });
});

describe("Final Play game presentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("shows all seven registered games on the legacy Play presentation", () => {
    const { container } = renderAt(<PlayPage />, "/play");
    expect(container.querySelectorAll(".play-games__grid .play-game-card")).toHaveLength(7);
    expect(container.querySelectorAll(".play-games__grid button.play-game-card")).toHaveLength(6);
    expect(container.querySelector(".play-game-card__status.is-preview")).toBeNull();
  });

  it("reveals only one Keep Cut fighter at a time and hides the remaining seven", () => {
    const lineup = createKeepCutLineup("ufc-careers", "thumbnail-proof");
    const query = lineup.fighters.map((fighter) => fighter.id).join(",");
    const { container } = renderAt(<KeepCutPage />, `/play/keep-cut?pack=ufc-careers&lineup=${query}`);
    expect(container.querySelectorAll(".keep-cut-current")).toHaveLength(1);
    expect(container.querySelectorAll(".keep-cut-current__photo")).toHaveLength(1);
    expect(container.querySelector(".keep-cut-current h2")?.textContent).toBe(lineup.fighters[0]?.name);
    expect(container.textContent).toContain("FIGHTER 1 OF 8");
    expect(container.textContent).toContain("you will not see who comes next");
    lineup.fighters.slice(1).forEach((fighter) => expect(container.textContent).not.toContain(fighter.name));
    expect(container.querySelector(".keep-cut-select-card")).toBeNull();
    expect(container.querySelector(".keep-cut-submit")).toBeNull();
  });

  it("locks every decision, forces the remaining side after four, and completes at four keeps and four cuts", () => {
    const lineup = createKeepCutLineup("ufc-careers", "render-keep-cut");
    const query = lineup.fighters.map((fighter) => fighter.id).join(",");
    const { container } = renderAt(<KeepCutPage />, `/play/keep-cut?pack=ufc-careers&lineup=${query}`);

    for (let index = 0; index < 4; index += 1) {
      expect(container.querySelector(".keep-cut-current h2")?.textContent).toBe(lineup.fighters[index]?.name);
      makeKeepCutDecision(container, "keep");
    }

    const forcedKeep = container.querySelector<HTMLButtonElement>(".keep-cut-current__actions .keep");
    const forcedCut = container.querySelector<HTMLButtonElement>(".keep-cut-current__actions .cut");
    expect(forcedKeep?.disabled).toBe(true);
    expect(forcedCut?.disabled).toBe(false);
    expect(container.textContent).toContain("KEEP IS FULL — THIS FIGHTER MUST BE CUT");

    for (let index = 4; index < 8; index += 1) {
      expect(container.querySelector(".keep-cut-current h2")?.textContent).toBe(lineup.fighters[index]?.name);
      makeKeepCutDecision(container, "cut");
    }

    const expected = scoreKeepCutSelection(
      "ufc-careers",
      lineup.fighters,
      lineup.fighters.slice(0, 4).map((fighter) => fighter.id),
    );
    expect(container.textContent).toContain("EIGHT CALLS LOCKED");
    expect(container.textContent).toContain(`${expected.score}/100`);
    expect(container.textContent).toContain(`${expected.modelTopFourKept} OF OCTAGON HQ’S TOP 4 KEPT`);
    expect(container.textContent).toContain("OCTAGON HQ TOP 4");
    expect(container.querySelectorAll(".keep-cut-top-four__fighter")).toHaveLength(4);
    expect(container.textContent).toContain("YOUR BOARD");
    expect(container.querySelectorAll(".keep-cut-result-fighter")).toHaveLength(8);
    expect(container.textContent).not.toMatch(/OF 16 COMPARISONS/i);
    expect(container.textContent).not.toMatch(/COMPARISONS WON/i);
    expect(container.querySelectorAll(".keep-cut-result-group")).toHaveLength(0);
    const actions = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actions).toEqual(["CHALLENGE SOMEONE", "REPLAY CHALLENGE", "ALL GAMES"]);
  });

  it("replays a curated Keep Cut challenge through the same blind reveal order", () => {
    const lineup = createKeepCutLineup("all-careers", "replay-proof");
    const ids = lineup.fighters.map((fighter) => fighter.id);
    const { container } = renderAt(<KeepCutPage />, `/play/keep-cut?pack=all-careers&lineup=${ids.join(",")}`);
    for (let index = 0; index < 8; index += 1) {
      makeKeepCutDecision(container, index < 4 ? "keep" : "cut");
    }
    fireEvent.click([...container.querySelectorAll<HTMLButtonElement>(".game-result-actions button")][1]!);
    expect(container.textContent).toContain("FIGHTER 1 OF 8");
    expect(container.querySelector(".keep-cut-current h2")?.textContent).toBe(lineup.fighters[0]?.name);
    ids.slice(1).forEach((id) => expect(container.textContent).not.toContain(getPlayFighter(id)?.name));
  });
});
