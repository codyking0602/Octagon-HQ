import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import footballBackRoomSource from "../features/back-room/FootballBackRoomPage.tsx?raw";
import footballEntryTransitionSource from "../features/back-room/FootballEntryTransition.tsx?raw";
import footballShellCss from "./football-shell.css?raw";

const playRevealClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/football-play-reveal.mp4"),
);
const picksRevealClip = readFileSync(
  resolve(process.cwd(), "public/assets/football/football-picks-reveal.mp4"),
);

describe("Football HQ entrance transition", () => {
  it("fills the viewport with the portrait Football reveal", () => {
    expect(footballShellCss).toContain(`.football-entry-transition__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}`);
  });

  it("routes Play and Picks to their section-specific reveal clips", () => {
    expect(footballBackRoomSource).toContain("<FootballEntryTransition");
    expect(footballBackRoomSource).toContain('surface="play"');
    expect(footballEntryTransitionSource).toContain('play: "/assets/football/football-play-reveal.mp4"');
    expect(footballEntryTransitionSource).toContain('picks: "/assets/football/football-picks-reveal.mp4"');
    expect(footballEntryTransitionSource).toContain("src={REVEAL_VIDEO[surface]}");
    expect(footballEntryTransitionSource).toContain("onEnded={() => onCompleteRef.current()}");
  });

  it("ships valid non-empty MP4 reveal clips for both surfaces", () => {
    expect(playRevealClip.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(picksRevealClip.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(playRevealClip.byteLength).toBeGreaterThan(4_096);
    expect(picksRevealClip.byteLength).toBeGreaterThan(4_096);
  });
});
