import { cleanup, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SELECTED_SPORT_STORAGE_KEY, type SelectedSport } from "../../app/SportProvider";
import { AppProviders } from "../../app/providers";
import { appRoutes } from "../../app/router";

const FOOTBALL_SEASON_HOME_ORDER = [
  "your-hq",
  "football-hq",
  "ufc-hq",
];

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-09-12T12:00:00Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderHome() {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/"] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

function expectNeutralHome() {
  expect(document.querySelector(".app-shell")).toHaveAttribute("data-hq-theme", "neutral");
  expect(screen.getByRole("navigation", { name: "Primary navigation" })).toHaveAttribute(
    "data-hq-theme",
    "neutral",
  );
  expect(screen.queryByTestId("sport-context-row")).not.toBeInTheDocument();
  expect(screen.queryByRole("group", { name: /sport/i })).not.toBeInTheDocument();
}

describe("The HQ universal Home foundation", () => {
  it("renders the approved football-season Home hierarchy without standalone feed sections", async () => {
    const router = renderHome();

    expect(await screen.findByRole("heading", { name: "Your HQ" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");

    const sections = screen.getAllByTestId("home-section");
    expect(sections).toHaveLength(3);
    expect(sections.map((section) => section.getAttribute("data-home-section"))).toEqual(FOOTBALL_SEASON_HOME_ORDER);
    expect(screen.queryByRole("region", { name: "What’s New" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Today’s Challenges" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Up Next" })).not.toBeInTheDocument();
  });

  it.each(["ufc", "football"] as const)(
    "keeps Home neutral and selector-free with persisted %s selection",
    async (sport: SelectedSport) => {
      window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, sport);
      renderHome();

      await screen.findByRole("heading", { name: "Your HQ" });
      expectNeutralHome();
    },
  );

  it("keeps each Daily Challenge inside its sport HQ", async () => {
    renderHome();
    await screen.findByRole("heading", { name: "Your HQ" });

    const sections = screen.getAllByTestId("home-section");
    const ufcHq = screen.getByRole("region", { name: "UFC HQ" });
    const footballHq = screen.getByRole("region", { name: "Football HQ" });

    expect(within(sections[0]).getByRole("heading", { name: "Your HQ" })).toBeInTheDocument();
    expect(within(ufcHq).getByRole("heading", { name: "Fight week" })).toBeInTheDocument();
    expect(within(footballHq).getByRole("heading", { name: "This week" })).toBeInTheDocument();
    expect(within(ufcHq).getByRole("link", { name: /Open UFC Today’s Challenge/i })).toHaveAttribute("href", "/play");
    expect(within(footballHq).getByRole("link", { name: /Open Football Today’s Challenge/i })).toHaveAttribute("href", "/football/today");
    expect(ufcHq).toHaveClass("home-sport-hq");
    expect(footballHq).toHaveClass("home-sport-hq");
    expect(within(footballHq).getByText("Kamario Taylor")).toBeInTheDocument();
    expect(within(footballHq).getByRole("link", { name: "OPEN PICKS →" })).toHaveAttribute("href", "/football/picks");
  });

  it("keeps a single Home route owner", () => {
    const shellRoute = appRoutes.find((route) => route.path === "/");
    expect(shellRoute).toBeDefined();
    expect(shellRoute?.children?.filter((route) => route.index)).toHaveLength(1);
    expect(appRoutes.filter((route) => route.path === "/")).toHaveLength(1);
  });
});
