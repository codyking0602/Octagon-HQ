import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SELECTED_SPORT_STORAGE_KEY } from "./SportProvider";
import { AppProviders } from "./providers";
import { appRoutes } from "./router";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

async function sportContext(label: string) {
  const row = await screen.findByTestId("sport-context-row");
  expect(row).toHaveTextContent(label);
  return row;
}

async function expectPath(router: ReturnType<typeof renderRoute>, pathname: string) {
  await waitFor(() => expect(router.state.location.pathname).toBe(pathname));
}

function expectThemeScope(theme: "neutral" | "ufc" | "football") {
  const shell = document.querySelector(".app-shell");
  expect(shell).toHaveAttribute("data-hq-theme", theme);
  expect(screen.getByRole("navigation", { name: "Primary navigation" })).toHaveAttribute(
    "data-hq-theme",
    theme,
  );
}

describe("The HQ sport switching", () => {
  it("switches Picks from UFC to Football through the canonical sport state", async () => {
    const router = renderRoute("/picks");
    const row = await sportContext("UFC PICKS");
    expectThemeScope("ufc");

    fireEvent.click(within(row).getByRole("button", { name: "Football" }));

    await expectPath(router, "/football/picks");
    await sportContext("FOOTBALL PICKS");
    expectThemeScope("football");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("football");
  });

  it("switches Picks from Football to UFC through the same canonical sport state", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    const router = renderRoute("/football/picks");
    const row = await sportContext("FOOTBALL PICKS");
    expectThemeScope("football");

    fireEvent.click(within(row).getByRole("button", { name: "UFC" }));

    await expectPath(router, "/picks");
    await sportContext("UFC PICKS");
    expectThemeScope("ufc");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("ufc");
  });

  it("switches Play from UFC to Football through the canonical sport state", async () => {
    const router = renderRoute("/play");
    const row = await sportContext("UFC PLAY");
    expectThemeScope("ufc");

    fireEvent.click(within(row).getByRole("button", { name: "Football" }));

    await expectPath(router, "/football");
    await sportContext("FOOTBALL PLAY");
    expectThemeScope("football");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("football");
  });

  it("switches Play from Football to UFC through the same canonical sport state", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    const router = renderRoute("/football");
    const row = await sportContext("FOOTBALL PLAY");
    expectThemeScope("football");

    fireEvent.click(within(row).getByRole("button", { name: "UFC" }));

    await expectPath(router, "/play");
    await sportContext("UFC PLAY");
    expectThemeScope("ufc");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("ufc");
  });

  it("keeps sport selection global across Picks and Play in both directions", async () => {
    const router = renderRoute("/picks");
    let row = await sportContext("UFC PICKS");

    fireEvent.click(within(row).getByRole("button", { name: "Football" }));
    await expectPath(router, "/football/picks");
    expectThemeScope("football");

    fireEvent.click(screen.getByRole("link", { name: "Play" }));
    await expectPath(router, "/football");
    row = await sportContext("FOOTBALL PLAY");
    expectThemeScope("football");

    fireEvent.click(within(row).getByRole("button", { name: "UFC" }));
    await expectPath(router, "/play");
    expectThemeScope("ufc");

    fireEvent.click(screen.getByRole("link", { name: "Picks" }));
    await expectPath(router, "/picks");
    await sportContext("UFC PICKS");
    expectThemeScope("ufc");
  });

  it("respects the persisted PR 4 sport when choosing Picks and Play from universal surfaces", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    const router = renderRoute("/");

    expectThemeScope("neutral");
    expect(screen.getByRole("link", { name: "Picks" })).toHaveAttribute("href", "/football/picks");
    expect(screen.getByRole("link", { name: "Play" })).toHaveAttribute("href", "/football");

    fireEvent.click(screen.getByRole("link", { name: "Picks" }));
    await expectPath(router, "/football/picks");
    await sportContext("FOOTBALL PICKS");
    expectThemeScope("football");
  });

  it.each([
    ["/picks", "UFC PICKS", "Picks sport", "ufc"],
    ["/football/picks", "FOOTBALL PICKS", "Picks sport", "football"],
    ["/play", "UFC PLAY", "Play sport", "ufc"],
    ["/football", "FOOTBALL PLAY", "Play sport", "football"],
  ] as const)("identifies %s with the switchable sport context row and accent scope", async (path, label, groupName, theme) => {
    if (path.startsWith("/football")) {
      window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    }
    renderRoute(path);

    const row = await sportContext(label);
    const selector = within(row).getByRole("group", { name: groupName });
    expect(within(selector).getByRole("button", { name: "UFC" })).toBeInTheDocument();
    expect(within(selector).getByRole("button", { name: "Football" })).toBeInTheDocument();
    expectThemeScope(theme);
  });

  it("identifies Rankings as UFC-only with UFC contextual accent and no Football selector", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    renderRoute("/rankings");

    const row = await sportContext("UFC RANKINGS");
    expectThemeScope("ufc");
    expect(within(row).queryByRole("group")).not.toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: "Football" })).not.toBeInTheDocument();
  });

  it("keeps Home universal and neutral regardless of the persisted sport", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    renderRoute("/");

    expectThemeScope("neutral");
    expect(screen.queryByTestId("sport-context-row")).not.toBeInTheDocument();
  });

  it("keeps Intelligence clearly UFC-only with UFC contextual accent and no Football option", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    renderRoute("/intelligence");

    const row = await sportContext("UFC INTELLIGENCE");
    expectThemeScope("ufc");
    expect(within(row).queryByRole("group")).not.toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: "Football" })).not.toBeInTheDocument();
  });
});
