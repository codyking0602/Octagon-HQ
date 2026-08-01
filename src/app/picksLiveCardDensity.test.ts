import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const lifecycleStyles = readFileSync("src/styles/picks-lifecycle.css", "utf8");

describe("Picks locked and live fight-card density", () => {
  it("compacts only the existing read-only lifecycle without changing pick entry", () => {
    expect(page).toContain("const readOnly = locked || cancelled || removed;");
    expect(page).toContain("className={choiceClassName(selection === bout.redFighterSlug, readOnly)}");
    expect(page).toContain("className={choiceClassName(selection === bout.blueFighterSlug, readOnly)}");
    expect(lifecycleStyles).toContain(".pick-bout-card:has(.pick-choice.is-read-only) {");
    expect(lifecycleStyles).toContain("grid-template-columns: 34px minmax(0, 1fr);");
    expect(lifecycleStyles).toContain("min-height: 58px;");
  });

  it("keeps every fight-night detail in the canonical card while reducing group reveal height", () => {
    expect(page).toContain("<GroupPickReveal");
    expect(page).toContain("<MainEventSpotlight bout={bout} />");
    expect(page).toContain("<strong>{officialResult(bout)}</strong>");
    expect(page).toContain("★ UNDERDOG LOCK");
    expect(lifecycleStyles).toContain(".picks-group-pick-reveal__split");
    expect(lifecycleStyles).toContain(".picks-group-pick-reveal__members");
    expect(lifecycleStyles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(lifecycleStyles).toContain("grid-template-columns: repeat(3, minmax(0, 1fr));");
  });

  it("is reusable for every event and does not encode the current matchup", () => {
    expect(lifecycleStyles).not.toContain("Medic");
    expect(lifecycleStyles).not.toContain("Rodriguez");
    expect(lifecycleStyles).not.toContain("6 FIGHTS");
  });
});
