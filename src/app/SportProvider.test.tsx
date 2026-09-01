import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
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
  const { selectedSport, setSelectedSport } = useSport();

  return (
    <div>
      <output data-testid="selected-sport">{selectedSport}</output>
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
    expect(sportProviderSource.match(/useState<SelectedSport>/g) ?? []).toHaveLength(1);
    expect(sportProviderSource.match(/localStorage\.setItem/g) ?? []).toHaveLength(1);
  });

  it("drives switchable contextual theme scope from the canonical selected sport", () => {
    expect(appShellSource).toContain("if (context?.switchable) return selectedSport;");
    expect(appShellSource).not.toContain("context.sport === selectedSport");
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
    expect(tokensSource).toContain("--hq-context-accent: #d2d8e0;");
    expect(sportContextStyles).toContain("var(--hq-neutral-accent-rgb)");
    expect(sportContextStyles).toContain("--football-accent: var(--hq-context-accent);");
    expect(sportContextStyles).toContain("--football-accent-rgb: var(--hq-context-accent-rgb);");
    expect(sportContextStyles).toContain("var(--hq-context-accent-strong)");
  });

  it("does not restore favorite-team shell theming as a second theme owner", () => {
    expect(appShellSource).not.toContain("useProfilePreferences");
    expect(appShellSource).not.toContain("app-shell--football-team-");
    expect(bottomNavigationSource).not.toContain("bottom-nav--football-team-");
  });

  it("defaults the canonical selected sport to UFC", () => {
    renderSportProvider();

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("ufc");
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
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("football");

    fireEvent.click(screen.getByRole("button", { name: "Select UFC" }));

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("ufc");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("ufc");
  });

  it("ignores invalid persisted values instead of creating another sport state", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "basketball");

    renderSportProvider();

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("ufc");
  });
});
