import { describe, expect, it } from "vitest";
import footballPlayCss from "./football-today-challenge.css?raw";
import homeChallengeCss from "./home-challenges.css?raw";
import homeFootballCss from "./home-football-hq.css?raw";
import homeSportCss from "./home-ufc-hq.css?raw";

describe("Home Football blue parity", () => {
  it("uses the same #1F4E79 Football blue as the canonical Football Play surface", () => {
    expect(footballPlayCss).toContain("--football-blue: #1F4E79;");

    expect(homeSportCss).toContain(`.home-sport-hq--football {
  --home-sport-accent: #1F4E79;
  --home-sport-accent-rgb: 31, 78, 121;
}`);

    expect(homeChallengeCss).toContain("--challenge-accent: var(--football-navy, #1F4E79);");
    expect(homeChallengeCss).toContain("--challenge-accent-strong: var(--football-navy-strong, #1F4E79);");
    expect(homeFootballCss).toContain("--football-hq-navy: #1F4E79;");
    expect(homeFootballCss).toContain("background: var(--football-hq-navy);");

    for (const retiredBlue of ["#8ebce6", "#5f93bd", "#a9cfee", "rgba(72, 139, 199", "rgba(70, 134, 189"]) {
      expect(homeFootballCss.toLowerCase()).not.toContain(retiredBlue.toLowerCase());
    }
  });
});
