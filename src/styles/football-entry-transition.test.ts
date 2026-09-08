import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import footballBackRoomSource from "../features/back-room/FootballBackRoomPage.tsx?raw";
import footballEntryTransitionSource from "../features/back-room/FootballEntryTransition.tsx?raw";
import footballShellCss from "./football-shell.css?raw";

const vinceYoungClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/vince-young-championship-run.mp4"),
);

describe("Football HQ entrance transition", () => {
  it("fills the viewport with the portrait Vince Young transition", () => {
    expect(footballShellCss).toContain(`.football-entry-transition__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}`);
  });

  it("lets the Vince clip hand off to the Football HQ slam", () => {
    expect(footballBackRoomSource).toContain("<FootballEntryTransition");
    expect(footballBackRoomSource).toContain('surface="play"');
    expect(footballEntryTransitionSource).toContain('/assets/football/vince-young-championship-run.mp4');
    expect(footballEntryTransitionSource).toContain('onEnded={() => setPlaySlam(true)}');
    expect(footballEntryTransitionSource).toContain('FOOTBALL_HQ_SLAM_FRAME');
    expect(footballEntryTransitionSource).toContain('const PLAY_SLAM_MS = 1200;');
  });

  it("ships a real production clip instead of the tiny placeholder", () => {
    expect(vinceYoungClip.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(vinceYoungClip.byteLength).toBeGreaterThan(1_000_000);
  });
});
