import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  normalizeFootballRevealH264Level,
  readH264AvcLevelIdc,
} from "../../scripts/normalize-football-reveal-codec.mjs";
import footballEntryTransitionSource from "../features/back-room/FootballEntryTransition.tsx?raw";
import footballShellCss from "./football-shell.css?raw";

const playRevealClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/football-play-reveal.mp4"),
);
const picksRevealClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/football-picks-reveal.mp4"),
);

describe("Football HQ entrance transition", () => {
  it("fills the viewport with the reveal video", () => {
    expect(footballShellCss).toContain(`.football-entry-transition__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}`);
  });

  it("uses only the two finished montage reveal MP4s", () => {
    expect(footballEntryTransitionSource).toContain("football-play-reveal.mp4");
    expect(footballEntryTransitionSource).toContain("football-picks-reveal.mp4");
    expect(footballEntryTransitionSource).not.toContain("vince-young-championship-run.mp4");
    expect(footballEntryTransitionSource).not.toContain("football-picks-reveal-01.jpg");
    expect(footballEntryTransitionSource).not.toContain("football-entry-play-slam");
    expect(footballEntryTransitionSource).not.toContain("football-entry-transition__hq-card");
  });

  it("ships real MP4 reveal assets", () => {
    for (const clip of [playRevealClip, picksRevealClip]) {
      expect(clip.subarray(4, 8).toString("ascii")).toBe("ftyp");
      expect(clip.byteLength).toBeGreaterThan(100_000);
    }
  });

  it("normalizes both reveal assets to mobile-safe H.264 Level 3.1", () => {
    for (const clip of [playRevealClip, picksRevealClip]) {
      const normalized = normalizeFootballRevealH264Level(clip);
      expect(readH264AvcLevelIdc(normalized)).toMatchObject({
        configLevelIdc: 31,
        spsLevelIdc: 31,
      });
    }
  });
});
