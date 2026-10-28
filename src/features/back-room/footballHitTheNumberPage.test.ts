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

  it("uses the shared clean header instead of format and pick-count pills", () => {
    expect(presentationSource).toContain('className="hit-number-stat-heading"');
    expect(presentationSource).toContain('className="hit-number-theme"');
    expect(presentationSource).toContain("Get as close as you can without going over. Go over and you bust. (Bob Barker rules)");
    expect(presentationSource).not.toContain('className="hit-number-meta"');
    expect(presentationSource).not.toContain("THEMED LINEUP");
    expect(presentationSource).not.toContain("PICK {pickCount}");
  });

  it("keeps the active progression pool focused on unused eligible choices through the canonical model owner", () => {
    expect(pageSource).toContain(
      "availableIds={slotProgression && !result ? availableSubjectIds : plan.subjectIds}",
    );
    expect(presentationSource).toContain("candidates.filter((candidate) => availableIds.includes(candidate.id))");
    expect(surfaceSource).not.toContain("[...selectedIds, ...availableSubjectIds]");
    expect(pageSource).toContain("footballHitTheNumberAvailableProgressionSubjectIds(plan, selectedIds)");
    expect(pageSource).toContain("footballHitTheNumberAvailableProgressionSubjectIds(plan, current)");
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

  it("uses the shared warm ivory logo backplate for every Football team/program mark", () => {
    expect(presentationSource).toContain('background: "var(--football-logo-backplate, #E7E1D7)"');
    expect(presentationSource).toContain('border: "1px solid var(--football-logo-backplate-border, rgba(74, 63, 49, .22))"');
    expect(presentationSource).not.toContain('asset.darkSurfaceTreatment === "light-backplate"');
    expect(surfaceSource).not.toContain('subjectId.includes("ohio-state")');
  });
});
