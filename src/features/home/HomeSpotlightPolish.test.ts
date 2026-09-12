import { describe, expect, it } from "vitest";
import homeFootballCss from "../../styles/home-football-hq.css?raw";
import homeUfcCss from "../../styles/home-ufc-hq.css?raw";

describe("Home spotlight finishing polish", () => {
  it("keeps Player Spotlight compact without truncating the four stat labels", () => {
    expect(homeFootballCss).toContain("grid-template-columns: minmax(110px, .68fr) minmax(0, 1.32fr);");
    expect(homeFootballCss).toContain("min-height: 32px;");
    expect(homeFootballCss).toContain(".football-player-spotlight__meta");
    expect(homeFootballCss).toContain("white-space: nowrap;");
    expect(homeFootballCss).not.toContain("text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.football-player-spotlight__copy p");
  });

  it("renders Ranking Spotlight actions as one integrated footer group", () => {
    expect(homeUfcCss).toContain(".home-section--ufc-hq .ranking-spotlight__actions {");
    expect(homeUfcCss).toContain("gap: 0;");
    expect(homeUfcCss).toContain("overflow: hidden;");
    expect(homeUfcCss).toContain("min-height: 32px;");
    expect(homeUfcCss).toContain(".secondary-action + .secondary-action");
    expect(homeUfcCss).toContain("border-left: 1px solid rgba(255, 255, 255, .10);");
  });
});
