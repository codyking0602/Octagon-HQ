import { cleanup, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SELECTED_SPORT_STORAGE_KEY, type SelectedSport } from "../../app/SportProvider";
import { AppProviders } from "../../app/providers";
import { appRoutes } from "../../app/router";

const LOCKED_HOME_ORDER = [
  "your-hq",
  "whats-new",
  "todays-challenges",
  "ufc-hq",
  "football-hq",
];

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

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
  it("renders the five Home section boundaries in the approved order with Up Next removed", async () => {
    const router = renderHome();

    expect(await screen.findByRole("heading", { name: "Your HQ" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");

    const sections = screen.getAllByTestId("home-section");
    expect(sections).toHaveLength(5);
    expect(sections.map((section) => section.getAttribute("data-home-section"))).toEqual(LOCKED_HOME_ORDER);
    expect(screen.queryByRole("region", { name: "Up Next" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Your command center" })).not.toBeInTheDocument();
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

  it("keeps both sport HQs distinct but structurally consistent", async () => {
    renderHome();
    await screen.findByRole("heading", { name: "Your HQ" });

    const sections = screen.getAllByTestId("home-section");
    const challenges = screen.getByRole("region", { name: "Today’s Challenges" });
    const ufcHq = screen.getByRole("region", { name: "UFC HQ" });
    const footballHq = screen.getByRole("region", { name: "Football HQ" });

    expect(within(sections[0]).getByRole("heading", { name: "Your HQ" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "What’s New" })).toBeInTheDocument();
    expect(within(challenges).getByRole("heading", { name: "Today’s Challenges" })).toBeInTheDocument();
    expect(within(challenges).getByRole("link", { name: /Open UFC Today’s Challenge/i })).toHaveAttribute("href", "/play");
    expect(within(challenges).getByRole("link", { name: /Open Football Today’s Challenge/i })).toHaveAttribute("href", "/football/today");
    expect(within(ufcHq).getByRole("heading", { name: "Fight week" })).toBeInTheDocument();
    expect(within(footballHq).getByRole("heading", { name: "This week" })).toBeInTheDocument();
    expect(ufcHq).toHaveClass("home-sport-hq");
    expect(footballHq).toHaveClass("home-sport-hq");
    expect(within(footballHq).getByText("COLLEGE GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(footballHq).getByText("NFL GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(footballHq).getAllByRole("link").every((link) => link.getAttribute("href") === "/football/picks")).toBe(true);
  });

  it("keeps a single Home route owner", () => {
    const shellRoute = appRoutes.find((route) => route.path === "/");
    expect(shellRoute).toBeDefined();
    expect(shellRoute?.children?.filter((route) => route.index)).toHaveLength(1);
    expect(appRoutes.filter((route) => route.path === "/")).toHaveLength(1);
  });
});
