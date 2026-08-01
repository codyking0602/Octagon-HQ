import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const component = readFileSync("src/features/picks/GroupPickProgress.tsx", "utf8");
const styles = readFileSync("src/styles/picks-group-progress.css", "utf8");
const entry = readFileSync("src/main.tsx", "utf8");

describe("Picks group progress presentation", () => {
  it("stays collapsed by default and shows completion counts", () => {
    expect(component).toContain('<details className="surface-card picks-group-progress">');
    expect(component).not.toContain('<details open');
    expect(component).toContain("{completedMembers}/{members.length} COMPLETE");
    expect(component).toContain("{member.completed}/{member.total}");
  });

  it("keeps one inline member comparison open at a time", () => {
    expect(component).toContain("const [selectedName, setSelectedName] = useState<string | null>(null)");
    expect(component).toContain("const isSelected = member.displayName === selectedName");
    expect(component).toContain("setSelectedName(isSelected ? null : member.displayName)");
    expect(component).toContain("aria-expanded={isSelected}");
  });

  it("shows member status without revealing pre-lock fighter choices", () => {
    expect(component).toContain("if (!selected || !locked) return []");
    expect(component).toContain("PICKS HIDDEN");
    expect(component).toContain("Individual picks stay hidden until the event locks.");
    expect(component).toContain('{member.hasUnderdogLock ? <b>UNDERDOG LOCK SET</b> : null}');
  });

  it("renders reusable post-lock comparison rows from canonical event data", () => {
    expect(component).toContain('bout.includedInPicks !== false && (bout.resultStatus ?? "pending") !== "cancelled"');
    expect(component).toContain(".sort((left, right) => left.position - right.position)");
    expect(component).toContain("fight: `${bout.redFighterName} vs ${bout.blueFighterName}`");
    expect(component).toContain("same: memberPick === myPick");
    expect(component).toContain('{pick.same ? "SAME" : "DIFF"}');
    expect(component).toContain("<small>{member.displayName}</small>");
    expect(component).toContain("<small>YOU</small>");
    expect(component).not.toContain("Navajo Stirling");
    expect(component).not.toContain("Jan Błachowicz");
  });

  it("uses the existing Picks stylesheet owner for the compact comparison hierarchy", () => {
    expect(entry).toContain('import "./styles/picks-group-progress.css";');
    expect(styles).toContain(".picks-group-progress__comparison");
    expect(styles).toContain(".picks-group-progress__comparison-list");
    expect(styles).toContain(".picks-group-progress__fight.is-same");
    expect(styles).toContain(".picks-group-progress__choices");
    expect(styles).toContain('button[aria-expanded="true"]');
  });
});
