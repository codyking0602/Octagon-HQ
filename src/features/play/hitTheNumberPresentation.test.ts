import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const view = readFileSync("src/features/play/HitTheNumberGameView.tsx", "utf8");
const page = readFileSync("src/features/play/HitTheNumberPage.tsx", "utf8");
const css = readFileSync("src/styles/hit-the-number.css", "utf8");

describe("Hit the Number canonical presentation", () => {
  it("keeps one reusable game view ready for casual and future official Daily play", () => {
    expect(page).toContain("<HitTheNumberGameView");
    expect(view).toContain("export function HitTheNumberGameView");
    expect(view).toContain("SCORE");
    expect(view).toContain("!result ? (");
    expect(view).toContain("hit-number-roster");
  });

  it("keeps the casual setup limited to board type plus NEW LINEUP", () => {
    expect(page).toContain("OPEN ROSTER");
    expect(page).toContain("RANDOM POOL");
    expect(page).toContain("NEW LINEUP");
    expect(page).not.toContain("<select");
    expect(page).not.toContain("ROSTER FILTER");
  });

  it("uses the themed roster instruction for the actual pick decision instead of repeating the theme", () => {
    expect(view).toContain("Pick ${setup.pickCount} from this pool");
    expect(view).toContain("Pick ${setup.pickCount} from this theme");
    expect(view).not.toContain("Choose from ${format?.configurationLabel}");
  });

  it("makes One From Each and Build the Team explicit slot builders", () => {
    expect(page).toContain("slotAssignments");
    expect(page).toContain("activeSlotIndex");
    expect(page).toContain("hitTheNumberSlotAcceptsFighter(slot, fighterId)");
    expect(page).toContain("setActiveSlotIndex(nextSlotIndex)");
    expect(view).toContain("hit-number-role-slots");
    expect(view).toContain("onSelectSlot");
    expect(view).toContain("hitTheNumberSlotAcceptsFighter(activeSlot, fighter.id)");
    expect(view).toContain("Already assigned");
    expect(view).not.toContain("Required lineup roles");
  });

  it("keeps slot-builder roles compact and one-column on phones", () => {
    expect(css).toContain(".hit-number-role-slot.is-active");
    expect(css).toContain("box-shadow: inset 3px 0 0 var(--ufc-red-strong);");
    expect(css).toContain(".hit-number-role-slots {\n    grid-template-columns: 1fr;");
  });

  it("keeps all selected fighters visible and the ready lock action reachable on phones", () => {
    expect(css).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));");
    expect(css).not.toContain("overflow-x: auto");
    expect(css).toContain(".hit-number-lock-dock.is-ready");
    expect(css).toContain("position: fixed;");
    expect(css).toContain("bottom: calc(78px + var(--safe-bottom));");
  });

  it("makes the selected board type unmistakable", () => {
    expect(css).toContain(".hit-number-mode-toggle button.is-active");
    expect(css).toContain("background: var(--ufc-red-strong);");
  });
});
