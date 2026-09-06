import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import appShellSource from "../../app/AppShell.tsx?raw";
import bottomNavigationSource from "../../components/BottomNavigation.tsx?raw";
import footballVisualCss from "../../styles/football-visual-assets.css?raw";
import sportContextCss from "../../styles/sport-context.css?raw";
import footballHeaderSource from "./FootballHeader.tsx?raw";

const cowboysHelmet = readFileSync(
  resolve(process.cwd(), "public/assets/football/cowboys-helmet.webp"),
);
const longhornsHelmet = readFileSync(
  resolve(process.cwd(), "public/assets/football/longhorns-helmet.webp"),
);

describe("Football HQ final identity polish", () => {
  it("renders the approved transparent team helmet photos instead of illustrated SVG helmets", () => {
    expect(footballHeaderSource).toContain('cowboys: "/assets/football/cowboys-helmet.webp"');
    expect(footballHeaderSource).toContain('longhorns: "/assets/football/longhorns-helmet.webp"');
    expect(footballHeaderSource).toContain("<img alt=\"\" draggable={false} src={TEAM_HELMET_ASSETS[team]} />");
    expect(footballHeaderSource).not.toContain("cowboys-helmet.svg");
    expect(footballHeaderSource).not.toContain("longhorns-helmet.svg");

    expect(cowboysHelmet.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(cowboysHelmet.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(longhornsHelmet.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(longhornsHelmet.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(cowboysHelmet.byteLength).toBeGreaterThan(8_000);
    expect(longhornsHelmet.byteLength).toBeGreaterThan(8_000);
    expect(footballVisualCss).toContain(".football-team-helmet img");
  });

  it("keeps logo tiles neutral and removes Longhorns-only navy surface leakage", () => {
    expect(footballVisualCss).toContain("#101113");
    expect(footballVisualCss).not.toContain("#101b2c");
    expect(footballVisualCss).toContain(".app-shell--football-team-longhorns .football-rank-five-current");
    expect(footballVisualCss).toContain(".app-shell--football-team-longhorns .football-keep-cut-current");
    expect(footballVisualCss).toContain(".app-shell--football-team-longhorns .football-blind-resume-reveal");
    expect(footballVisualCss).toContain(".app-shell--football-team-longhorns .football-blind-resume-picks button");
    expect(footballVisualCss).toContain("background: #111315 !important;");
  });

  it("reserves fixed visual lanes so Keep 4 / Cut 4 labels and names cannot sit under team marks", () => {
    expect(footballVisualCss).toContain("grid-template-columns: 74px minmax(0, 1fr) minmax(110px, auto) !important;");
    expect(footballVisualCss).toContain("grid-template-columns: 52px 52px minmax(0, 1fr) auto !important;");
    expect(footballVisualCss).toContain("grid-template-columns: 52px 52px minmax(0, 1fr) !important;");
    expect(footballVisualCss).toContain("grid-template-columns: 74px minmax(0, 1fr) !important;");
    expect(footballVisualCss).toContain("overflow-wrap: anywhere;");
  });

  it("routes shared Football accents through the universal contextual theme path", () => {
    expect(footballVisualCss).toContain(`.app-shell--football-room {
  --ufc-red: var(--football-action);
  --ufc-red-strong: var(--football-accent);
}`);
    expect(appShellSource).toContain("data-hq-theme={themeScope}");
    expect(appShellSource).toContain("<BottomNavigation themeScope={themeScope} />");
    expect(bottomNavigationSource).toContain("data-hq-theme={themeScope}");
    expect(bottomNavigationSource).not.toContain("useProfilePreferences");
    expect(bottomNavigationSource).not.toContain("bottom-nav--football-team-");
    expect(footballVisualCss).not.toContain(".bottom-nav--football-team-cowboys");
    expect(footballVisualCss).not.toContain(".bottom-nav--football-team-longhorns");
    expect(sportContextCss).toContain("--football-accent: var(--hq-context-accent);");
    expect(sportContextCss).toContain("--football-accent-rgb: var(--hq-context-accent-rgb);");
  });
});