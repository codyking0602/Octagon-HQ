import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  SELECTED_SPORT_STORAGE_KEY,
  SportProvider,
  useSport,
} from "./SportProvider";

const appProvidersSource = readFileSync("src/app/providers.tsx", "utf8");
const appShellSource = readFileSync("src/app/AppShell.tsx", "utf8");
const bottomNavigationSource = readFileSync("src/components/BottomNavigation.tsx", "utf8");
const sportProviderSource = readFileSync("src/app/SportProvider.tsx", "utf8");
const mainSource = readFileSync("src/main.tsx", "utf8");
const tokensSource = readFileSync("src/styles/tokens.css", "utf8");
const sportContextStyles = readFileSync("src/styles/sport-context.css", "utf8");

function SportProbe() {
  const { selectedSport, setSelectedSport, homeSport, playSport, picksSport, setHomeSport, setPicksSport } = useSport();

  return (
    <div>
      <output data-testid="selected-sport">{selectedSport}</output>
      <output data-testid="home-sport">{homeSport}</output>
      <output data-testid="play-sport">{playSport}</output>
      <output data-testid="picks-sport">{picksSport}</output>
      <button type="button" onClick={() => setHomeSport("all")}>Home All sports</button>
      <button type="button" onClick={() => setHomeSport("ufc")}>Home UFC</button>
      <button type="button" onClick={() => setPicksSport("nba")}>Picks Basketball</button>
      <button type="button" onClick={() => setSelectedSport("football")}>
        Select Football
      </button>
      <button type="button" onClick={() => setSelectedSport("ufc")}>
        Select UFC
      </button>
    </div>
  );
}

function renderSportProvider() {
  return render(
    <SportProvider>
      <SportProbe />
    </SportProvider>,
  );
}

describe("SportProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("mounts exactly once in the canonical app provider stack", () => {
    expect(appProvidersSource.match(/<SportProvider>/g) ?? []).toHaveLength(1);
    expect(appProvidersSource.match(/<\/SportProvider>/g) ?? []).toHaveLength(1);
  });

  it("keeps PR 5 consumers on the one canonical state and persistence owner", () => {
    expect(appShellSource).toContain("useSport");
    expect(bottomNavigationSource).toContain("useSport");
    expect(appShellSource).not.toContain("localStorage");
    expect(bottomNavigationSource).not.toContain("localStorage");
    expect(sportProviderSource.match(/useState<SportPreferences>/g) ?? []).toHaveLength(1);
    expect(sportProviderSource.match(/localStorage\.setItem/g) ?? []).toHaveLength(1);
  });

  it("drives route themes without rewriting Home or another section's preference", () => {
    expect(appShellSource).toContain("if (context?.switchable) return context.sport;");
    expect(appShellSource).toContain("setPicksSport(sectionPreference.sport);");
    expect(appShellSource).toContain("setPlaySport(sectionPreference.sport);");
    expect(appShellSource).not.toContain("setHomeSport(");
  });

  it("keeps one canonical theme/style initialization path", () => {
    expect(mainSource.match(/\.\/styles\/tokens\.css/g) ?? []).toHaveLength(1);
    expect(mainSource.match(/\.\/styles\/sport-context\.css/g) ?? []).toHaveLength(1);
    expect(mainSource.match(/\.\/styles\/football-foundation\.css/g) ?? []).toHaveLength(1);
    expect(mainSource.match(/\.\/styles\/football-shell\.css/g) ?? []).toHaveLength(1);
    expect(appProvidersSource).not.toContain("ThemeProvider");
    expect(appShellSource).toContain("data-hq-theme={themeScope}");
    expect(bottomNavigationSource).toContain("data-hq-theme={themeScope}");
  });

  it("defines neutral, UFC, and Football accents through the shared token path", () => {
    expect(tokensSource).toContain("--hq-neutral-accent:");
    expect(tokensSource).toContain('[data-hq-theme="ufc"]');
    expect(tokensSource).toContain("--hq-context-accent: var(--ufc-red);");
    expect(tokensSource).toContain('[data-hq-theme="football"]');
    expect(tokensSource).toContain("--football-brand-blue: #8EBCE6;");
    expect(tokensSource).toContain("--football-brand-blue-rgb: 142, 188, 230;");
    expect(tokensSource).toContain("--hq-context-accent: var(--football-brand-blue);");
    expect(tokensSource).toContain("--hq-context-accent-strong: var(--football-brand-blue);");
    expect(tokensSource).toContain("--hq-context-accent-rgb: var(--football-brand-blue-rgb);");
    expect(tokensSource).toContain("--hq-context-accent-soft: rgba(var(--football-brand-blue-rgb), .16);");
    expect(tokensSource).toContain("--hq-context-accent-border: rgba(var(--football-brand-blue-rgb), .48);");
    expect(sportContextStyles).toContain("var(--hq-neutral-accent-rgb)");
    expect(sportContextStyles).toContain("--football-accent: var(--hq-context-accent);");
    expect(sportContextStyles).toContain("--football-accent-rgb: var(--hq-context-accent-rgb);");
    expect(sportContextStyles).toContain("color: var(--hq-context-accent-strong);");
  });

  it("does not restore favorite-team shell theming as a second theme owner", () => {
    expect(appShellSource).not.toContain("useProfilePreferences");
    expect(appShellSource).not.toContain("app-shell--football-team-");
    expect(bottomNavigationSource).not.toContain("bottom-nav--football-team-");
  });

  it("defaults the canonical selected sport to Football", () => {
    renderSportProvider();

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("football");
  });

  it("restores the last selected sport between sessions", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");

    renderSportProvider();

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("football");
  });

  it("persists sport changes through the one canonical owner", () => {
    renderSportProvider();

    fireEvent.click(screen.getByRole("button", { name: "Select Football" }));

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("football");
    expect(JSON.parse(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)!)).toEqual({ home: "football", play: "football", picks: "football" });

    fireEvent.click(screen.getByRole("button", { name: "Select UFC" }));

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("ufc");
    expect(JSON.parse(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)!)).toEqual({ home: "football", play: "ufc", picks: "football" });
  });


  it("migrates legacy sport values without changing the existing single-sport experience", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "ufc");
    renderSportProvider();
    expect(screen.getByTestId("home-sport")).toHaveTextContent("ufc");
    expect(screen.getByTestId("play-sport")).toHaveTextContent("ufc");
    expect(screen.getByTestId("picks-sport")).toHaveTextContent("ufc");
  });

  it("keeps All sports saved independently across other selections and provider remount", () => {
    renderSportProvider();
    fireEvent.click(screen.getByRole("button", { name: "Home All sports" }));
    fireEvent.click(screen.getByRole("button", { name: "Select UFC" }));
    fireEvent.click(screen.getByRole("button", { name: "Picks Basketball" }));
    expect(screen.getByTestId("home-sport")).toHaveTextContent("all");
    expect(screen.getByTestId("play-sport")).toHaveTextContent("ufc");
    expect(screen.getByTestId("picks-sport")).toHaveTextContent("nba");
    expect(JSON.parse(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)!)).toEqual({
      home: "all", play: "ufc", picks: "nba",
    });
    cleanup();
    renderSportProvider();
    expect(screen.getByTestId("home-sport")).toHaveTextContent("all");
    expect(screen.getByTestId("play-sport")).toHaveTextContent("ufc");
    expect(screen.getByTestId("picks-sport")).toHaveTextContent("nba");
    fireEvent.click(screen.getByRole("button", { name: "Home UFC" }));
    expect(JSON.parse(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)!)).toEqual({
      home: "ufc", play: "ufc", picks: "nba",
    });
  });

  it("recovers safely from malformed or incomplete saved preferences", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "{bad");
    renderSportProvider();
    expect(screen.getByTestId("home-sport")).toHaveTextContent("football");
    cleanup();
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, JSON.stringify({
      home: "all", play: "invalid", picks: "ufc",
    }));
    renderSportProvider();
    expect(screen.getByTestId("home-sport")).toHaveTextContent("all");
    expect(screen.getByTestId("play-sport")).toHaveTextContent("football");
    expect(screen.getByTestId("picks-sport")).toHaveTextContent("ufc");
  });

  it("ignores invalid persisted values instead of creating another sport state", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "basketball");

    renderSportProvider();

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("football");
  });
});
