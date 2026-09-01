import { cleanup, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SELECTED_SPORT_STORAGE_KEY, type SelectedSport } from "../../app/SportProvider";
import { AppProviders } from "../../app/providers";
import { appRoutes } from "../../app/router";

const LOCKED_HOME_ORDER = [
  "up-next",
  "todays-challenges",
  "whats-new",
  "your-hq",
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

describe("The HQ universal Home through PR 9", () => {
  it("renders the six locked Home section boundaries in exact order at the canonical / route", async () => {
    const router = renderHome();

    expect(await screen.findByRole("heading", { name: "Your command center" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");

    const sections = screen.getAllByTestId("home-section");
    expect(sections).toHaveLength(6);
    expect(sections.map((section) => section.getAttribute("data-home-section"))).toEqual(LOCKED_HOME_ORDER);
  });

  it.each(["ufc", "football"] as const)(
    "keeps Home neutral and selector-free with persisted %s selection",
    async (sport: SelectedSport) => {
      window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, sport);
      renderHome();

      await screen.findByRole("heading", { name: "Your command center" });
      expectNeutralHome();
    },
  );

  it("fills only the PR 9 Home slots and leaves the later Football HQ slot structural", async () => {
    renderHome();
    await screen.findByRole("heading", { name: "Your command center" });

    const sections = screen.getAllByTestId("home-section");
    const today = screen.getByRole("region", { name: "Today’s Challenges" });
    expect(today).not.toBeEmptyDOMElement();
    expect(within(today).getByRole("heading", { name: "UFC Today’s Challenge" })).toBeInTheDocument();
    expect(within(today).getByRole("heading", { name: "Football Today’s Challenge" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "What’s New" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Football HQ" })).toBeEmptyDOMElement();
    expect(within(sections[3]).getByRole("heading", { name: "Your HQ" })).toBeInTheDocument();
  });

  it("keeps a single Home route owner", () => {
    const shellRoute = appRoutes.find((route) => route.path === "/");
    expect(shellRoute).toBeDefined();
    expect(shellRoute?.children?.filter((route) => route.index)).toHaveLength(1);
    expect(appRoutes.filter((route) => route.path === "/")).toHaveLength(1);
  });

  it("keeps the four-item bottom navigation and persisted Picks/Play switching intact", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    renderHome();
    await screen.findByRole("heading", { name: "Your command center" });

    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Home", "Picks", "Play", "Rankings"]);
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "Picks" })).toHaveAttribute("href", "/football/picks");
    expect(within(nav).getByRole("link", { name: "Play" })).toHaveAttribute("href", "/football");
    expect(within(nav).getByRole("link", { name: "Rankings" })).toHaveAttribute("href", "/rankings");
    expect(screen.getByRole("link", { name: "Open UFC Intelligence" })).toHaveAttribute("href", "/intelligence");
  });
});
