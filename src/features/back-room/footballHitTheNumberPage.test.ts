import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballHitTheNumberPage.tsx"),
  "utf8",
);

describe("Football Hit the Number selection presentation", () => {
  it("uses board and subject-aware language instead of player-only lineup copy", () => {
    expect(pageSource).toContain("NEW BOARD");
    expect(pageSource).not.toContain("NEW LINEUP");
    expect(pageSource).not.toContain('subject?.name ?? "Choose player"');
    expect(pageSource).toContain("`Choose ${poolNoun}`");
    expect(pageSource).toContain("`${poolNoun.toUpperCase()} POOL`");
  });

  it("keeps the active progression pool focused on unused eligible choices through the canonical model owner", () => {
    expect(pageSource).toContain(
      "const displayedSubjectIds = result || !slotProgression ? plan.subjectIds : availableSubjectIds;",
    );
    expect(pageSource).not.toContain("[...selectedIds, ...availableSubjectIds]");
    expect(pageSource).toContain("footballHitTheNumberActiveProgressionSlot(plan, selectedSubjectIds)");
    expect(pageSource).toContain("footballHitTheNumberAvailableProgressionSubjectIds(plan, selectedSubjectIds)");
    expect(pageSource).not.toContain("oneFromEachSlotAccepts");
    expect(pageSource).not.toContain("oneFromEachSlotSeasonRange");
  });

  it("keeps Football choices readable and Football-themed on narrow screens", () => {
    expect(pageSource).toContain('style={{ gridTemplateColumns: "1fr" }}');
    expect(pageSource).toContain("activeFootballSlotStyle");
    expect(pageSource).toContain('background: "rgba(var(--football-accent-rgb), .14)"');
    expect(pageSource).toContain('whiteSpace: "normal"');
    expect(pageSource).toContain("subjectDisplayName(subject)");
    expect(pageSource).toContain("subjectDisplaySubtitle(subject, plan.metricId)");
  });

  it("honors canonical light-backplate media treatment on the dark HTN surface", () => {
    expect(pageSource).toContain('asset.darkSurfaceTreatment === "light-backplate"');
    expect(pageSource).toContain('background: lightBackplate ? "#fff"');
    expect(pageSource).not.toContain('subjectId.includes("ohio-state")');
  });
});
