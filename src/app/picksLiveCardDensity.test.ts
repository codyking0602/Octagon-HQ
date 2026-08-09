import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const reveal = readFileSync("src/features/picks/GroupPickReveal.tsx", "utf8");
const lifecycleStyles = readFileSync("src/styles/picks-lifecycle.css", "utf8");

describe("Picks locked and live fight-card density", () => {
  it("compacts only the existing read-only lifecycle without changing pick entry", () => {
    expect(page).toContain("const readOnly = boutLocked || cancelled || removed;");
    expect(page).toContain("className={choiceClassName(selection === bout.redFighterSlug, readOnly)}");
    expect(page).toContain("className={choiceClassName(selection === bout.blueFighterSlug, readOnly)}");
    expect(lifecycleStyles).toContain(".pick-bout-card:has(.pick-choice.is-read-only) {");
    expect(lifecycleStyles).toContain("grid-template-columns: 34px minmax(0, 1fr);");
    expect(lifecycleStyles).toContain("min-height: 58px;");
  });

  it("keeps only the three pick totals visible until a total is opened", () => {
    expect(page).toContain("<GroupPickReveal");
    expect(reveal).toContain('type RevealGroupKey = "red" | "blue" | "missing"');
    expect(reveal).toContain("const [selectedGroupKey, setSelectedGroupKey]");
    expect(reveal).toContain("aria-expanded={selected}");
    expect(reveal).toContain("disabled={!count}");
    expect(reveal).toContain("{selectedGroup ? (");
    expect(lifecycleStyles).toContain("grid-template-columns: repeat(3, minmax(0, 1fr));");
    expect(lifecycleStyles).toContain(".picks-group-pick-reveal__detail");
    expect(lifecycleStyles).not.toContain(".picks-group-pick-reveal__members");
  });

  it("keeps every other fight-night detail in the canonical card", () => {
    expect(page).toContain("<MainEventSpotlight bout={bout} spotlight={activeEvent.spotlight} />");
    expect(page).toContain("<strong>{officialResult(bout)}</strong>");
    expect(page).toContain("★ UNDERDOG LOCK");
  });

  it("is reusable for every event and does not encode the current matchup", () => {
    expect(lifecycleStyles).not.toContain("Medic");
    expect(lifecycleStyles).not.toContain("Rodriguez");
    expect(lifecycleStyles).not.toContain("6 FIGHTS");
  });
});
