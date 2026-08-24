import { describe, expect, it } from "vitest";
import footballShellCss from "./football-shell.css?raw";

describe("Football HQ entrance transition", () => {
  it("does not portrait-cover zoom the wide Vince Young source", () => {
    expect(footballShellCss).toContain(`.football-entry-transition__video {
  display: block;
  width: min(100vw, 720px);
  height: auto;
  max-height: 100vh;
  object-fit: contain;
  object-position: center;
}`);
    expect(footballShellCss).not.toContain(`.football-entry-transition__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`);
  });

  it("frames the letterboxed clip with the selected Football team atmosphere", () => {
    expect(footballShellCss).toContain("rgba(var(--football-accent-rgb), .2)");
    expect(footballShellCss).toContain("background: #000;");
  });
});
