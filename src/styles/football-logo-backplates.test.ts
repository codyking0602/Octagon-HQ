import { describe, expect, it } from "vitest";
import footballFoundationCss from "./football-foundation.css?raw";
import footballPicksCss from "./football-picks.css?raw";
import footballSelectionCss from "./football-picks-team-selection.css?raw";
import footballVisualCss from "./football-visual-assets.css?raw";
import footballWeeklyAuctionCss from "./football-weekly-auction.css?raw";
import tokensCss from "./tokens.css?raw";

describe("Football logo backplates", () => {
  it("uses one warm ivory token instead of charcoal across team-logo surfaces", () => {
    expect(tokensCss).toContain("--football-logo-backplate: #E7E1D7;");
    expect(tokensCss).toContain("--football-logo-backplate-border: rgba(74, 63, 49, .22);");

    for (const css of [
      footballPicksCss,
      footballSelectionCss,
      footballVisualCss,
      footballWeeklyAuctionCss,
      footballFoundationCss,
    ]) {
      expect(css).toContain("var(--football-logo-backplate, #E7E1D7)");
    }

    expect(footballPicksCss).not.toContain("background: #25292b;");
    expect(footballSelectionCss).not.toContain("background: #202426;");
    expect(footballVisualCss).not.toContain("#101113");
    expect(footballFoundationCss).toContain("background: transparent;");
  });
});
