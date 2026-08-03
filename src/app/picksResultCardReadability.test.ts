import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync("src/styles/picks-control.css", "utf8");

describe("Picks owner result card readability", () => {
  it("visually reduces corner labels to RED and BLUE while preserving canonical markup", () => {
    expect(styles).toContain('.pick-control-winners > div:first-child > span::after');
    expect(styles).toContain('content: "RED";');
    expect(styles).toContain('.pick-control-winners > div:last-child > span::after');
    expect(styles).toContain('content: "BLUE";');
    expect(styles).toContain('.pick-control-winners > div > span {');
    expect(styles).toContain('font-size: 0;');
  });

  it("makes the official result value visually stronger than its label", () => {
    expect(styles).toContain('.pick-control-winners + p {');
    expect(styles).toContain('.pick-control-winners + p > strong {');
    expect(styles).toContain('color: var(--text-muted);');
  });
});
