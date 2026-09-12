import { describe, expect, it } from "vitest";
import homeCss from "./home.css?raw";
import homeFootballCss from "./home-football-hq.css?raw";
import homeUfcCss from "./home-ufc-hq.css?raw";

describe("Home Spotlight finishing layout", () => {
  it("keeps the Football Spotlight compact with readable four-stat labels", () => {
    expect(homeFootballCss).toContain("grid-template-columns: minmax(112px, .72fr) minmax(0, 1.28fr);");
    expect(homeFootballCss).toContain("min-height: 178px;");
    expect(homeFootballCss).toContain(".football-player-spotlight__meta {");
    expect(homeFootballCss).toContain("min-height: 32px;");
    expect(homeFootballCss).not.toContain("text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.football-player-spotlight__meta");
  });

  it("renders Ranking Spotlight actions as one compact segmented footer", () => {
    expect(homeCss).not.toContain("background: var(--ufc-red) !important;");
    expect(homeUfcCss).toContain(".home-section--ufc-hq .ranking-spotlight__actions {");
    expect(homeUfcCss).toContain("gap: 0;");
    expect(homeUfcCss).toContain("overflow: hidden;");
    expect(homeUfcCss).toContain("min-height: 32px;");
    expect(homeUfcCss).toContain(".ranking-spotlight__profile");
  });
});
