import type { ReactNode } from "react";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BetterThanPage from "./BetterThanPage";
import KeepCutPage from "./KeepCutPage";
import PlayPage from "./PlayPage";
import {
  BETTER_THAN_LENSES,
  betterThanEligible,
  compareBetterThanClaims,
  resolveBetterThanChallenge,
} from "./betterThanEngine";
import {
  KEEP_CUT_PACKS,
  KEEP_CUT_ROLES,
  createKeepCutLineup,
  keepCutTier,
  keepCutRating,
  resolveKeepCutChallenge,
} from "./keepCutEngine";
import { getPlayFighter } from "./playFighterPool";

function renderAt(element: ReactNode, path: string) {
  return render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);
}

describe("Keep 4, Cut 4 engine", () => {
  it("preserves the fourteen category packs and eight weighted lineup roles", () => {
    expect(KEEP_CUT_PACKS).toHaveLength(14);
    expect(KEEP_CUT_ROLES).toHaveLength(8);
    expect(KEEP_CUT_ROLES.find((role) => role.id === "wildcard")?.weights.bad).toBe(0.1);
  });

  it("builds deterministic unique eight-fighter lineups with at most one Bad fighter", () => {
    for (const pack of KEEP_CUT_PACKS) {
      const first = createKeepCutLineup(pack.id, `proof-${pack.id}`);
      const second = createKeepCutLineup(pack.id, `proof-${pack.id}`);
      expect(first.fighters.map((fighter) => fighter.id)).toEqual(second.fighters.map((fighter) => fighter.id));
      expect(first.fighters).toHaveLength(8);
      expect(new Set(first.fighters.map((fighter) => fighter.id)).size).toBe(8);
      const badFighters = first.fighters.filter((fighter) => keepCutTier(keepCutRating(pack.id, fighter)) === "bad");
      expect(badFighters.length).toBeLessThanOrEqual(1);
    }
  });

  it("resolves the exact shared pack and lineup", () => {
    const lineup = createKeepCutLineup("ufc-careers", "shared-proof");
    const resolved = resolveKeepCutChallenge("ufc-careers", lineup.fighters.map((fighter) => fighter.id));
    expect(resolved?.map((fighter) => fighter.id)).toEqual(lineup.fighters.map((fighter) => fighter.id));
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

  it("compares shared and split names without creating an official verdict", () => {
    const target = getPlayFighter("charles-oliveira")!;
    const eligible = betterThanEligible(target.id, "all");
    const creator = resolveBetterThanChallenge({
      targetId: target.id,
      lensId: "striking",
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

  it("shows all six Play Hub cards as live buttons", () => {
    const { container } = renderAt(<PlayPage />, "/play");
    expect(container.querySelectorAll(".play-games__grid .play-game-card")).toHaveLength(6);
    expect(container.querySelectorAll(".play-games__grid button.play-game-card")).toHaveLength(6);
  });

  it("locks eight Keep Cut decisions and finishes with the shared result actions", () => {
    const lineup = createKeepCutLineup("ufc-careers", "render-keep-cut");
    const query = lineup.fighters.map((fighter) => fighter.id).join(",");
    const { container, getByRole } = renderAt(<KeepCutPage />, `/play/keep-cut?pack=ufc-careers&lineup=${query}`);
    for (let index = 0; index < 4; index += 1) fireEvent.click(getByRole("button", { name: "KEEP" }));
    for (let index = 0; index < 4; index += 1) fireEvent.click(getByRole("button", { name: "CUT" }));
    expect(container.textContent).toContain("YOUR KEEP/CUT CARD");
    const actions = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actions).toEqual(["CHALLENGE SOMEONE", "REPLAY", "ALL GAMES"]);
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
    fireEvent.click(container.querySelector<HTMLButtonElement>(".better-than-lock")!);
    expect(container.textContent).toContain("CLAIMS REVEALED");
    const actions = [...container.querySelectorAll(".game-result-actions button")].map((button) => button.textContent);
    expect(actions).toEqual(["CHALLENGE SOMEONE", "REPLAY", "ALL GAMES"]);
  });
});
