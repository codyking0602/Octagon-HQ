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
});
