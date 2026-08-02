import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const component = readFileSync("src/features/picks/GroupPickProgress.tsx", "utf8");
const styles = readFileSync("src/styles/picks-group-progress.css", "utf8");
const entry = readFileSync("src/main.tsx", "utf8");

describe("Picks group progress presentation", () => {
  it("stays collapsed by default and shows scannable completion states", () => {
    expect(component).toContain('<details className="surface-card picks-group-progress">');
    expect(component).not.toContain('<details open');
    expect(component).toContain("{completedMembers}/{members.length} COMPLETE");
    expect(component).toContain("{member.completed}/{member.total}");
    expect(component).toContain("const isComplete = member.completed === member.total && member.total > 0");
    expect(component).toContain('{isComplete ? "✓" : member.displayName.trim().charAt(0).toUpperCase()}');
    expect(styles).toContain(".picks-group-progress__member-status");
    expect(styles).toContain("button.is-complete .picks-group-progress__member-status");
  });

  it("keeps one inline member comparison open at a time", () => {
    expect(component).toContain("const [selectedName, setSelectedName] = useState<string | null>(null)");
    expect(component).toContain("const isSelected = member.displayName === selectedName");
    expect(component).toContain("setSelectedName(isSelected ? null : member.displayName)");
    expect(component).toContain("aria-expanded={isSelected}");
  });

  it("reveals only server-locked fights while later fights stay private", () => {
    expect(component).toContain("if (!selected) return []");
    expect(component).toContain('.filter((bout) => locked || bout.isLocked === true)');
    expect(component).toContain("PICKS HIDDEN");
    expect(component).toContain("Individual picks reveal as each fight locks.");
    expect(component).toContain("hiddenFightCount");
    expect(component).toContain("Those picks reveal when each fight locks.");
    expect(component).toContain('{!locked && member.hasUnderdogLock ? <b>UNDERDOG LOCK SET</b> : null}');
  });

  it("renders reusable revealed comparison rows and marks the exact lock target", () => {
    expect(component).toContain('bout.includedInPicks !== false && (bout.resultStatus ?? "pending") !== "cancelled"');
    expect(component).toContain(".sort((left, right) => left.position - right.position)");
    expect(component).toContain("fight: `${bout.redFighterName} vs ${bout.blueFighterName}`");
    expect(component).toContain("same: memberPick === myPick");
    expect(component).toContain("selected.underdogLockBoutId === bout.boutId");
    expect(component).toContain("selected.underdogLockFighterSlug === memberPick");
    expect(component).toContain("★ UNDERDOG LOCK");
    expect(component).toContain('{pick.same ? "SAME" : "DIFF"}');
    expect(component).toContain("<small>{member.displayName}</small>");
    expect(component).toContain("<small>YOU</small>");
    expect(component).not.toContain("Navajo Stirling");
    expect(component).not.toContain("Jan Błachowicz");
  });

  it("uses the existing Picks stylesheet owner for clear SAME, DIFF, and lock states", () => {
    expect(entry).toContain('import "./styles/picks-group-progress.css";');
    expect(styles).toContain(".picks-group-progress__comparison");
    expect(styles).toContain(".picks-group-progress__comparison-list");
    expect(styles).toContain(".picks-group-progress__fight.is-same");
    expect(styles).toContain("border: 1px solid rgba(210, 10, 10, .34)");
    expect(styles).toContain(".picks-group-progress__lock-marker");
    expect(styles).toContain('button[aria-expanded="true"]');
  });
});