import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const component = readFileSync("src/features/picks/GroupPickProgress.tsx", "utf8");
const styles = readFileSync("src/styles/picks-group-progress.css", "utf8");
const entry = readFileSync("src/main.tsx", "utf8");

describe("Picks group progress presentation", () => {
  it("stays collapsed by default and shows completion counts", () => {
    expect(component).toContain('<details className="surface-card picks-group-progress">');
    expect(component).not.toContain('<details open');
    expect(component).toContain("`${completedMembers}/${members.length} COMPLETE`");
    expect(component).toContain("{member.completed}/{member.total}");
  });

  it("shows member status without revealing pre-lock fighter choices", () => {
    expect(component).toContain('if (!selected || !locked) return []');
    expect(component).toContain("Individual picks stay hidden until the event locks.");
    expect(component).toContain("COMPLETE");
    expect(component).toContain("IN PROGRESS");
    expect(component).toContain("NOT STARTED");
  });

  it("supports post-lock comparison against the current user", () => {
    expect(component).toContain("SAME AS YOU");
    expect(component).toContain("YOU: ${pick.myPick}");
    expect(component).toContain("UNDERDOG LOCK SET");
  });

  it("uses the existing Picks stylesheet owner", () => {
    expect(entry).toContain('import "./styles/picks-group-progress.css";');
    expect(styles).toContain(".picks-group-progress");
    expect(styles).toContain(".picks-member-progress-dialog");
  });
});
