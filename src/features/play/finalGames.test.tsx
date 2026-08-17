import type { ReactNode } from "react";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import { IdentityProvider } from "../identity/IdentityProvider";
import { FindLeaderHistoryProvider } from "./FindLeaderHistoryProvider";
import BetterThanPage from "./BetterThanPage";
import KeepCutPage from "./KeepCutPage";
import PlayPage from "./PlayPage";
import {
  BETTER_THAN_LENSES,
  betterThanEligible,
  betterThanLens,
  betterThanPool,
  betterThanStatement,
  compareBetterThanClaims,
  resolveBetterThanChallenge,
} from "./betterThanEngine";
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
  it("preserves canonical Blind Rank categories and the shared lineup archetype owner", () => {
    expect(KEEP_CUT_PACKS).toHaveLength(8);
    expect(KEEP_CUT_ROLES.map((role) => role.id)).toContain("middle-cluster");
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

describe("Better Than engine", () => {
  it("preserves all eleven debate lenses and exact frozen challenge claims", () => {
    expect(BETTER_THAN_LENSES).toHaveLength(11);
    const target = getPlayFighter("charles-oliveira")!;
    const selections = betterThanEligible(target.id, "all").slice(0, 3);
    const resolved = resolveBetterThanChallenge({
      targetId: target.id,
      lensId: "overall",
      poolId: "all",
      claimCount: "3",
      selectionIds: selections.map((fighter) => fighter.id).join(","),
    });
    expect(resolved?.target.id).toBe(target.id);
    expect(resolved?.selections.map((fighter) => fighter.id)).toEqual(selections.map((fighter) => fighter.id));
  });

  it("writes natural debate copy for division-specific claims", () => {
    const target = getPlayFighter("charles-oliveira")!;
    expect(betterThanStatement(
      target,
      betterThanLens("kickboxing"),
      betterThanPool(target, "division:Flyweight"),
      5,
    )).toBe("I can name 5 UFC flyweights who are better kickboxers than Charles Oliveira.");
  });

  it("compares shared and split names without creating an official verdict", () => {
    const target = getPlayFighter("charles-oliveira")!;
    const eligible = betterThanEligible(target.id, "all");
    const creator = resolveBetterThanChallenge({
      targetId: target.id,
      lensId: "overall",
      poolId: "all",
      claimCount: "3",
      selectionIds: eligible.slice(0, 3).map((fighter) => fighter.id).join(","),
    })!;
    const comparison = compareBetterThanClaims(creator, 3, [eligible[0], eligible[2], eligible[3]]);
    expect(comparison.shared.map((fighter) => fighter.id)).toEqual([eligible[0].id, eligible[2].id]);
    expect(comparison.creatorOnly).toHaveLength(1);
    expect(comparison.responderOnly).toHaveLength(1);
    expect(comparison.narrower).toBe("same");
  });
});

describe("Final Play game presentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  it("shows all eight registered games on the legacy Play presentation", () => {
    const { container } = renderAt(<PlayPage />, "/play");
    expect(container.querySelectorAll(".play-games__grid .play-game-card")).toHaveLength(8);
    expect(container.querySelectorAll(".play-games__grid button.play-game-card")).toHaveLength(7);
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
    expect(container.textContent).toContain(`${expected.modelTopFourKept} OF MODEL TOP 4 KEPT`);
    expect(container.textContent).toContain(`${expected.correctComparisons} OF 16 COMPARISONS WON`);
    expect(container.querySelectorAll(".keep-cut-result-group--keep .keep-cut-fighter")).toHaveLength(4);
    expect(container.querySelectorAll(".keep-cut-result-group--cut .keep-cut-fighter")).toHaveLength(4);
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

  it("keeps the original Better Than list hidden until the counterclaim locks", () => {
    const target = getPlayFighter("charles-oliveira")!;
    const eligible = betterThanEligible(target.id, "all");
    const creatorIds = eligible.slice(0, 3).map((fighter) => fighter.id).join(",");
    const { container } = renderAt(
      <BetterThanPage />,
      `/play/better-than?target=${target.id}&lens=overall&pool=all&count=3&selections=${creatorIds}`,
    );
    expect(container.textContent).toContain("The original exact list stays hidden");
    const candidates = [...container.querySelectorAll<HTMLButtonElement>(".better-than-grid .better-than-fighter")].slice(0, 3);
    candidates.forEach((candidate) => fireEvent.click(candidate));
    const lockButton = container.querySelector<HTMLButtonElement>(".better-than-lock")!;
    expect(lockButton.classList.contains("is-ready")).toBe(true);
    fireEvent.click(lockButton);
    expect(container.textContent).toContain("CLAIMS REVEALED");
    expect(container.querySelector(".better-than-result-list")?.textContent).not.toContain("ADD");
    const actions = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actions).toEqual(["CHALLENGE SOMEONE", "REPLAY CHALLENGE", "ALL GAMES"]);
  });
});
