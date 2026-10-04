import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballWheelPage.tsx", "utf8");
const styles = readFileSync("src/styles/football-wheel.css", "utf8");

describe("Wheel of Football final result experience", () => {
  it("keeps the completed result compact instead of rendering the old explanatory result card", () => {
    expect(page).toContain("football-wheel-page--result");
    expect(page).toContain("football-wheel-result-summary");
    expect(page).toContain("football-wheel-result-actions");
    expect(page).not.toContain("built the stronger Superteam.");
    expect(styles).toContain(".football-wheel-page--result .football-wheel-roster__row");
    expect(styles).toContain("min-height: 46px");
  });

  it("shares a generated PNG containing the final grades and both full Superteams", () => {
    expect(page).toContain("buildWheelResultShareImage");
    expect(page).toContain('canvas.toBlob');
    expect(page).toContain('navigator.share');
    expect(page).toContain('files: [file]');
    expect(page).toContain('WHEEL_FOOTBALL_ROSTER_SLOTS.forEach');
    expect(page).toContain('FINAL GRADE');
    expect(page).toContain('THE HQ · WHEEL OF FOOTBALL');
  });
});
