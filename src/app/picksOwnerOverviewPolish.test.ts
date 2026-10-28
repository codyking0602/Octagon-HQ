import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/picks-control/PicksControlCenterPage.tsx", "utf8");
const styles = readFileSync("src/styles/picks-control-center.css", "utf8");

describe("Picks owner overview polish", () => {
  it("uses a compact setup dashboard without repeating placeholder event copy", () => {
    expect(page).toContain('const eventName = activeEvent?.name ?? staged?.name ?? "NOT STAGED";');
    expect(page).toContain('const heading = activeEvent || staged ? eventName : "Event Setup";');
    expect(page).toContain('label: staged ? "REVIEW & PUBLISH" : "OPEN EVENT SETUP"');
    expect(page).not.toContain('?? "NEXT UFC EVENT"');
  });

  it("keeps setup collapsible and preserves a compact two-column mobile summary", () => {
    expect(page).toContain('className="surface-card picks-control-center__panel" open');
    expect(page).toContain('className={activeEvent ? "primary-action" : "secondary-action"}');
    expect(styles).toContain(".picks-control-center__panel[open] > summary::after");
    expect(styles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(styles).not.toContain(".picks-control-center__facts .is-wide");
  });
});
