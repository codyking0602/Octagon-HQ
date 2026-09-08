import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import bottomNavigationSource from "../components/BottomNavigation.tsx?raw";
import footballEntryRevealCss from "./football-entry-reveal.css?raw";
import footballShellCss from "./football-shell.css?raw";

const vinceYoungClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/vince-young-championship-run.mp4"),
);

describe("Football HQ entrance transition", () => {
  it("fills the viewport with the approved Play clip", () => {
    expect(footballShellCss).toContain(`.football-entry-transition__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}`);
    expect(bottomNavigationSource).toContain("/assets/football/vince-young-championship-run.mp4");
  });

  it("hands the clip into the Football HQ slam instead of a second route owner", () => {
    expect(bottomNavigationSource).toContain('stage: "slam"');
    expect(bottomNavigationSource).toContain('data-testid="football-entry-slam"');
    expect(footballEntryRevealCss).toContain("@keyframes football-entry-cover-slam");
  });

  it("ships a real production clip instead of the tiny placeholder", () => {
    expect(vinceYoungClip.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(vinceYoungClip.byteLength).toBeGreaterThan(1_000_000);
  });
});
