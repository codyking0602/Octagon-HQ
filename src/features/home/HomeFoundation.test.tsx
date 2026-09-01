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

describe("The HQ universal Home foundation", () => {
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

  it("completes only the PR 9 Home slots while keeping PR 10–11 blocks structural", async () => {
    renderHome();
    await screen.findByRole("heading", { name: "Your command center" });

    const sections = screen.getAllByTestId("home-section");
    const todaysChallenges = screen.getByRole("region", { name: "Today’s Challenges" });

    expect(within(todaysChallenges).getByTestId("today-challenge-ufc")).toBeInTheDocument();
    expect(within(todaysChallenges).getByTestId("today-challenge-football")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "What’s New" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Football HQ" })).toBeEmptyDOMElement();
    expect(within(sections[3]).getByRole("heading", { name: "Your HQ" })).toBeInTheDocument();
    expect(within(sections[4]).getByText("RANKING SPOTLIGHT")).toBeInTheDocument();
  });

  it("keeps a single Home route owner", () => {
    const shellRoute = appRoutes.find((route) => route.path === "/");
    expect(shellRoute).toBeDefined();
    expect(shellRoute?.children?.filter((route) => route.index)).toHaveLength(1);
    expect(appRoutes.filter((route) => route.path === "/")).toHaveLength(1);
  });
});
