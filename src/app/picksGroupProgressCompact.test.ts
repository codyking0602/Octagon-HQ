import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const component = readFileSync("src/features/picks/GroupPickProgress.tsx", "utf8");
const styles = readFileSync("src/styles/picks-group-progress.css", "utf8");

describe("compact Group Picks presentation", () => {
  it("keeps loading and unavailable states to a single static row", () => {
    expect(component).toContain('picks-group-progress picks-group-progress--static');
    expect(component).not.toContain("Group progress is temporarily unavailable.");
    expect(component).toContain('error ? "UNAVAILABLE"');
  });

  it("keeps the working member list collapsed by default", () => {
    expect(component).toContain('<details className="surface-card picks-group-progress">');
    expect(component).not.toContain("<details open");
  });

  it("uses a compact collapsed height", () => {
    expect(styles).toContain("min-height: var(--picks-disclosure-height, 46px)");
    expect(styles).toContain("padding: 0 var(--picks-disclosure-padding, 16px)");
  });
});
