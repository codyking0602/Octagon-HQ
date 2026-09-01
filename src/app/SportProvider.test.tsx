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
