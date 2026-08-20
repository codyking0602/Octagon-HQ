import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HitTheNumberGameView } from "./HitTheNumberGameView";
import {
  HIT_THE_NUMBER_VERSION,
  type HitTheNumberPublicSetup,
  type HitTheNumberResult,
} from "./hitTheNumberEngine";
import { playFighters } from "./playFighterPool";

const fighters = playFighters.slice(0, 8);
const fighterIds = fighters.map((fighter) => fighter.id);
const revealedPoolValues = new Map(
  fighterIds.map((fighterId, index) => [fighterId, index + 4]),
);
const result: HitTheNumberResult = {
  status: "under",
  target: 30,
  total: 22,
  distance: 8,
  score: 60,
  selections: fighterIds.slice(0, 4).map((fighterId, index) => ({
    fighterId,
    value: index + 4,
  })),
};

function setup(boardType: HitTheNumberPublicSetup["boardType"]): HitTheNumberPublicSetup {
  return {
    version: HIT_THE_NUMBER_VERSION,
    statId: "ufc-wins",
    boardType,
    target: 30,
    pickCount: 4,
    filter: {},
    fighterIds,
  };
}

function renderView(boardType: HitTheNumberPublicSetup["boardType"], completed: boolean) {
  return render(
    <HitTheNumberGameView
      setup={setup(boardType)}
      selectedIds={fighterIds.slice(0, 4)}
      result={completed ? result : null}
      revealedPoolValues={completed ? revealedPoolValues : undefined}
      search=""
      onSearchChange={vi.fn()}
      onToggleFighter={vi.fn()}
      onLock={vi.fn()}
    />,
  );
}

describe("Hit the Number Random Pool result reveal", () => {
  it("keeps pool values hidden before lock", () => {
    const { container } = renderView("random-pool", false);

    expect(container.querySelectorAll(".hit-number-fighter-card")).toHaveLength(8);
    expect(container.querySelectorAll(".hit-number-fighter-card__value")).toHaveLength(0);
  });

  it("reveals every Random Pool value after lock and keeps the player's picks marked", () => {
    const { container } = renderView("random-pool", true);
    const cards = [...container.querySelectorAll<HTMLElement>(".hit-number-fighter-card")];
    const values = [...container.querySelectorAll<HTMLElement>(".hit-number-fighter-card__value")];

    expect(cards).toHaveLength(8);
    expect(values).toHaveLength(8);
    expect(values.map((node) => node.textContent)).toEqual(
      fighterIds.map((fighterId) => String(revealedPoolValues.get(fighterId))),
    );
    expect(container.querySelectorAll(".hit-number-fighter-card.is-selected")).toHaveLength(4);
    expect(container.textContent).toContain("All values revealed");
    expect(container.textContent).toContain("YOUR PICK");
  });

  it("does not reveal the full Open Roster after completion", () => {
    const { container } = renderView("open-roster", true);

    expect(container.querySelector(".hit-number-roster")).toBeNull();
    expect(container.querySelectorAll(".hit-number-fighter-card__value")).toHaveLength(0);
  });

  it("keeps factual pool-value lookup in the Casual page instead of the reusable Daily-ready view", () => {
    const page = readFileSync("src/features/play/HitTheNumberPage.tsx", "utf8");
    const view = readFileSync("src/features/play/HitTheNumberGameView.tsx", "utf8");

    expect(page).toContain("hitTheNumberStatRows");
    expect(page).toContain("revealedPoolValues={revealedPoolValues}");
    expect(view).not.toContain("hitTheNumberStatRows");
  });
});
