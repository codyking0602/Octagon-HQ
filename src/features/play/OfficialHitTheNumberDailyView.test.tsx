import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OfficialHitTheNumberDailyView } from "./OfficialHitTheNumberDailyView";
import {
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
} from "./todaysChallengeRuntime";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

const scheduleVersion = "test-hit-number-daily-view-v1";

function dayAt(index: number) {
  return new Date(Date.UTC(2027, 4, index + 1)).toISOString().slice(0, 10);
}

function oneFromEachSetup() {
  for (let index = 0; index < 180; index += 1) {
    const day = dayAt(index);
    const setup = buildOfficialDailySetup("hit_the_number", day, scheduleVersion);
    const format = setup.publicSetup.format as Record<string, unknown> | undefined;
    if (format?.formatId === "one-from-each") return { day, setup };
  }
  throw new Error("No deterministic One From Each Daily seed found.");
}

function randomPoolSetup() {
  for (let index = 0; index < 180; index += 1) {
    const day = dayAt(index);
    const setup = buildOfficialDailySetup("hit_the_number", day, scheduleVersion);
    if (setup.publicSetup.boardType === "random-pool") return { day, setup };
  }
  throw new Error("No deterministic Random Pool Daily seed found.");
}

function projection(
  day: string,
  setup: ReturnType<typeof buildOfficialDailySetup>,
  publicSetup = setup.publicSetup,
): TodayChallengeProjection {
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: day,
    scheduleVersion,
    gameType: "hit_the_number",
    setupKey: setup.setupKey,
    contentVersion: setup.contentVersion,
    scoringVersion: setup.scoringVersion,
    fallbackReason: null,
    publicSetup,
    progressRevision: 0,
    publicState: initialOfficialDailyPublicState(publicSetup),
    revealSetup: setup.revealSetup,
    officialAttempt: null,
    deploymentSha: "test-daily-format-sha",
  };
}

describe("OfficialHitTheNumberDailyView formats", () => {
  it("renders canonical role slots and sends the active slot index to the one Daily runtime", () => {
    const { day, setup } = oneFromEachSetup();
    const onAdvance = vi.fn();
    const { container } = render(
      <OfficialHitTheNumberDailyView
        projection={projection(day, setup)}
        busy={false}
        onAdvance={onAdvance}
      />,
    );
    const slots = [...container.querySelectorAll<HTMLButtonElement>(".hit-number-role-slot")];

    expect(slots).toHaveLength(5);
    expect(container.querySelector(".hit-number-slots")).toBeNull();
    fireEvent.click(slots[2]!);

    const fighter = container.querySelector<HTMLButtonElement>(".hit-number-fighter-card")!;
    expect(fighter).not.toBeNull();
    fireEvent.click(fighter);

    expect(onAdvance).toHaveBeenCalledWith({
      fighter_id: fighter.dataset.fighterId,
      slot_index: 2,
    });
  });

  it("renders an already-materialized board without format metadata as legacy Classic", () => {
    const { day, setup } = oneFromEachSetup();
    const publicSetup = { ...setup.publicSetup };
    delete publicSetup.format;
    const { container } = render(
      <OfficialHitTheNumberDailyView
        projection={projection(day, setup, publicSetup)}
        busy={false}
        onAdvance={vi.fn()}
      />,
    );

    expect(container.querySelector(".hit-number-role-slots")).toBeNull();
    expect(container.querySelector(".hit-number-slots")).not.toBeNull();
  });

  it("reveals every completed Random Pool value from the official server result", () => {
    const { day, setup } = randomPoolSetup();
    const fighterIds = setup.publicSetup.fighterIds as string[];
    const pickCount = Number(setup.publicSetup.pickCount);
    const target = Number(setup.publicSetup.target);
    const poolValues = Object.fromEntries(
      fighterIds.map((fighterId, index) => [fighterId, index + 3]),
    );
    const completed = projection(day, setup);
    completed.officialAttempt = {
      nativeScore: 80,
      normalizedScore: 80,
      completedAt: `${day}T18:00:00.000Z`,
      publicResult: {
        status: "under",
        target,
        total: target - 1,
        distance: 1,
        score: 80,
        selections: fighterIds.slice(0, pickCount).map((fighterId) => ({
          fighterId,
          value: poolValues[fighterId],
        })),
        poolValues,
      },
    };

    const { container } = render(
      <OfficialHitTheNumberDailyView
        projection={completed}
        busy={false}
        onAdvance={vi.fn()}
      />,
    );
    const cards = [...container.querySelectorAll<HTMLElement>(".hit-number-fighter-card")];

    expect(cards).toHaveLength(fighterIds.length);
    for (const card of cards) {
      const fighterId = card.dataset.fighterId!;
      expect(card.querySelector(".hit-number-fighter-card__value")?.textContent)
        .toBe(String(poolValues[fighterId]));
    }
    expect(container.textContent).toContain("All values revealed");
  });
});
