import { describe, expect, it } from "vitest";
import footballShellCss from "./football-shell.css?raw";

describe("Football HQ Vince entrance", () => {
  it("preserves the wide source instead of portrait-cover upscaling it", () => {
    expect(footballShellCss).toContain(`.football-entry-transition__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}`);
    expect(footballShellCss).not.toContain(`.football-entry-transition__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`);
  });
});
