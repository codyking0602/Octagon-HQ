import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import footballBackRoomSource from "../features/back-room/FootballBackRoomPage.tsx?raw";
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

  it("lets the approved clip own the transition duration", () => {
    expect(footballBackRoomSource).toContain("onEnded={onComplete}");
    expect(footballBackRoomSource).not.toContain("window.setTimeout");
  });

  it("ships a real production clip instead of the tiny placeholder", () => {
    expect(vinceYoungClip.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(vinceYoungClip.byteLength).toBeGreaterThan(1_000_000);
  });
});
