import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import footballEntryTransitionSource from "../features/back-room/FootballEntryTransition.tsx?raw";
import footballEntryRevealCss from "./football-entry-reveal.css?raw";
import footballShellCss from "./football-shell.css?raw";

const vinceYoungClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/vince-young-championship-run.mp4"),
);
const picksRevealFrames = [1, 2, 3, 4].map((frame) => readFileSync(
  resolve(process.cwd(), `public/assets/football/football-picks-reveal-0${frame}.jpg`),
));

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

  it("uses the restored Zeke frame sequence instead of the tiny split MP4", () => {
    expect(footballEntryTransitionSource).toContain("football-picks-reveal-01.jpg");
    expect(footballEntryTransitionSource).toContain("football-picks-reveal-04.jpg");
    expect(footballEntryTransitionSource).not.toContain("football-picks-reveal.mp4");
    expect(footballEntryRevealCss).toContain(".football-entry-transition__frame--4");
  });

  it("ships the original higher-quality reveal assets", () => {
    expect(vinceYoungClip.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(vinceYoungClip.byteLength).toBeGreaterThan(1_000_000);

    for (const frame of picksRevealFrames) {
      expect(Array.from(frame.subarray(0, 2))).toEqual([0xff, 0xd8]);
      expect(frame.byteLength).toBeGreaterThan(7_000);
    }
  });
});
