import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import footballShellCss from "./football-shell.css?raw";
import footballBackRoomSource from "../features/back-room/FootballBackRoomPage.tsx?raw";

const vinceYoungTransition = readFileSync(
  resolve(process.cwd(), "public/assets/football/vince-young-championship-run.mp4"),
);

describe("Football HQ entrance transition", () => {
  it("fills the phone viewport with the tracked portrait Vince Young clip", () => {
    expect(footballShellCss).toContain(`.football-entry-transition__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}`);
  });

  it("lets the canonical video end the transition instead of clipping it on a timer", () => {
    expect(footballBackRoomSource).toContain("onEnded={onFinished}");
    expect(footballBackRoomSource).not.toContain("}, 1500);");
  });

  it("ships a real transition video instead of the tiny placeholder", () => {
    expect(vinceYoungTransition.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(vinceYoungTransition.byteLength).toBeGreaterThan(50_000);
  });
});
