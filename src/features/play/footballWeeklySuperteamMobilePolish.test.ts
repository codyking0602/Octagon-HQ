import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gate = readFileSync("src/features/back-room/FootballWeeklySuperteamGate.tsx", "utf8");
const styles = readFileSync("src/styles/football-weekly-superteam.css", "utf8");

describe("CFB Superteam mobile and tie-priority polish", () => {
  it("keeps the roster fully visible on phone layouts instead of sliding underneath the status rail", () => {
    const mobile = styles.slice(styles.indexOf("@media (max-width: 560px) {"));
    expect(mobile).toContain(".football-weekly-superteam__status {\n    position: static;");
    expect(mobile).toContain("top: auto;");
  });

  it("gives the actual CFB Superteam Auction Table a dedicated iOS touch-scroll viewport", () => {
    const tableBodyStart = styles.indexOf(".football-weekly-superteam-table__body {");
    const tableBodyEnd = styles.indexOf("\n}", tableBodyStart);
    const tableBody = styles.slice(tableBodyStart, tableBodyEnd + 2);
    expect(tableBody).toContain("flex: 1 1 0;");
    expect(tableBody).toContain("height: 0;");
    expect(tableBody).toContain("overflow-y: scroll;");
    expect(tableBody).toContain("touch-action: pan-y;");
    expect(tableBody).toContain("-webkit-overflow-scrolling: touch;");

    const mobile = styles.slice(styles.lastIndexOf("@media (max-width: 560px) {"));
    expect(mobile).toContain(".football-weekly-superteam-table__backdrop {");
    expect(mobile).toContain("overflow: hidden;");
    expect(mobile).toContain("touch-action: pan-y;");
    expect(mobile).toContain("height: calc(100dvh - 58px - var(--safe-top));");
    expect(mobile).toContain("min-height: 0;");
  });

  it("explains the live Day 1 tie order and wraps each participant cleanly", () => {
    expect(gate).toContain("LIVE · LOCKS MIDNIGHT CT");
    expect(gate).toContain("New Day 1 entrants can change this order until the field locks.");
    expect(gate).toContain("football-weekly-superteam__tie-entry");
    expect(styles).toContain("flex-wrap: wrap;");
    expect(styles).toContain(".football-weekly-superteam__tie-entry {\n  white-space: nowrap;");
  });
});
