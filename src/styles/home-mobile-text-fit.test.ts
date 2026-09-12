import { describe, expect, it } from "vitest";
import homeChallengesCss from "./home-challenges.css?raw";
import homeFootballCss from "./home-football-hq.css?raw";

describe("Home mobile text fit", () => {
  it("keeps all three Your HQ labels readable at phone widths", () => {
    expect(homeChallengesCss).toContain("@media (max-width: 430px)");
    expect(homeChallengesCss).toContain("font-size: clamp(7.5px, 1.95vw, 9px);");
    expect(homeChallengesCss).toContain("letter-spacing: -.035em;");
  });

  it("gives full college and NFL identities enough mobile lines instead of truncating nicknames", () => {
    expect(homeFootballCss).toContain("grid-template-columns: 24px minmax(0, 1fr);");
    expect(homeFootballCss).toContain("font-size: 8px;");
    expect(homeFootballCss).toContain("-webkit-line-clamp: 3;");
    expect(homeFootballCss).toContain("width: 14px;");
  });
});
