import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import footballEntryTransitionSource from "../features/back-room/FootballEntryTransition.tsx?raw";
import footballEntryRevealCss from "./football-entry-reveal.css?raw";
import footballShellCss from "./football-shell.css?raw";

const vinceYoungClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/vince-young-championship-run.mp4"),
);
const picksRevealClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/football-picks-reveal.mp4"),
);

describe("Football HQ entrance transition", () => {
  it("fills the viewport with the existing portrait Vince Young source", () => {
    expect(footballShellCss).toContain(`.football-entry-transition__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}`);
    expect(footballEntryTransitionSource).toContain('/assets/football/vince-young-championship-run.mp4');
    expect(footballEntryTransitionSource).not.toContain("football-play-reveal.mp4");
  });

  it("uses the real Zeke reveal video instead of the restored frame animation", () => {
    expect(footballEntryTransitionSource).toContain("football-picks-reveal.mp4");
    expect(footballEntryTransitionSource).not.toContain("football-picks-reveal-01.jpg");
    expect(footballEntryTransitionSource).not.toContain("football-picks-reveal-04.jpg");
    expect(footballEntryRevealCss).toContain(".football-entry-transition__hq-card");
    expect(footballEntryRevealCss).not.toContain(".football-entry-transition__frame--4");
  });

  it("ships full-quality reveal video assets", () => {
    expect(vinceYoungClip.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(vinceYoungClip.byteLength).toBeGreaterThan(1_000_000);

    expect(picksRevealClip.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(picksRevealClip.byteLength).toBeGreaterThan(100_000);
  });
});
