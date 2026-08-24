import { describe, expect, it } from "vitest";
import bottomNavigationSource from "../../components/BottomNavigation.tsx?raw";
import footballVisualCss from "../../styles/football-visual-assets.css?raw";
import footballHeaderSource from "./FootballHeader.tsx?raw";

describe("Football HQ final identity polish", () => {
  it("uses traditional team-specific helmet artwork instead of generic text marks", () => {
    expect(footballHeaderSource).toContain('viewBox="0 0 92 68"');
    expect(footballHeaderSource).toContain("football-team-helmet__facemask");
    expect(footballHeaderSource).toContain("football-team-helmet__mark--cowboys");
    expect(footballHeaderSource).toContain("football-team-helmet__mark--longhorns");
    expect(footballHeaderSource).not.toContain('team === "cowboys" ? "★" : "T"');

    expect(footballVisualCss).toContain("fill: #041e42;");
    expect(footballVisualCss).toContain("fill: #bf5700;");
  });

  it("routes shared Football accents away from UFC red", () => {
    expect(footballVisualCss).toContain(`.app-shell--football-room {
  --ufc-red: var(--football-action);
  --ufc-red-strong: var(--football-accent);
}`);
    expect(bottomNavigationSource).toContain("bottom-nav--football-team-${footballTeam}");
    expect(footballVisualCss).toContain(".bottom-nav--football-team-cowboys");
    expect(footballVisualCss).toContain("--ufc-red: #163f67;");
    expect(footballVisualCss).toContain(".bottom-nav--football-team-longhorns");
    expect(footballVisualCss).toContain("--ufc-red: #bf5700;");
  });
});
