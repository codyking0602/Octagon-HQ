import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballHitTheNumberPage.tsx"),
  "utf8",
);
const presentationSource = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballHitTheNumberPresentation.tsx"),
  "utf8",
);
const surfaceSource = `${pageSource}\n${presentationSource}`;

describe("Football Hit the Number selection presentation", () => {
  it("uses board and subject-aware language instead of player-only lineup copy", () => {
    expect(presentationSource).toContain("NEW BOARD");
    expect(surfaceSource).not.toContain("NEW LINEUP");
    expect(surfaceSource).not.toContain('subject?.name ?? "Choose player"');
    expect(presentationSource).toContain("`Choose ${poolNoun}`");
    expect(presentationSource).toContain('PICK POOL');
  });

  it("keeps the active progression pool focused on unused eligible choices through the canonical model owner", () => {
    expect(pageSource).toContain(
      "availableIds={slotProgression && !result ? availableSubjectIds : plan.subjectIds}",
    );
    expect(presentationSource).toContain("candidates.filter((candidate) => availableIds.includes(candidate.id))");
    expect(surfaceSource).not.toContain("[...selectedIds, ...availableSubjectIds]");
    expect(pageSource).toContain("footballHitTheNumberActiveProgressionSlot(plan, selectedSubjectIds)");
    expect(pageSource).toContain("footballHitTheNumberAvailableProgressionSubjectIds(plan, selectedSubjectIds)");
    expect(surfaceSource).not.toContain("oneFromEachSlotAccepts");
    expect(surfaceSource).not.toContain("oneFromEachSlotSeasonRange");
  });

  it("keeps Football choices readable and Football-themed on narrow screens", () => {
    expect(presentationSource).toContain('style={{ gridTemplateColumns: "1fr" }}');
    expect(presentationSource).toContain("activeFootballSlotStyle");
    expect(presentationSource).toContain('background: "rgba(var(--football-accent-rgb), .14)"');
    expect(presentationSource).toContain('whiteSpace: "normal"');
    expect(pageSource).toContain("subjectDisplayName(subject)");
    expect(pageSource).toContain("subjectDisplaySubtitle(subject, plan.metricId)");
  });

  it("honors canonical light-backplate media treatment on the dark HTN surface", () => {
    expect(presentationSource).toContain('asset.darkSurfaceTreatment === "light-backplate"');
    expect(presentationSource).toContain('background: lightBackplate ? "#fff"');
    expect(surfaceSource).not.toContain('subjectId.includes("ohio-state")');
  });
});
