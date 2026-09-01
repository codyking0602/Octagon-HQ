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

describe("The HQ sport switching", () => {
  it("switches Picks from UFC to Football through the canonical sport state", async () => {
    const router = renderRoute("/picks");
    const row = await sportContext("UFC PICKS");

    fireEvent.click(within(row).getByRole("button", { name: "Football" }));

    await expectPath(router, "/football/picks");
    await sportContext("FOOTBALL PICKS");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("football");
  });

  it("switches Picks from Football to UFC through the same canonical sport state", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    const router = renderRoute("/football/picks");
    const row = await sportContext("FOOTBALL PICKS");

    fireEvent.click(within(row).getByRole("button", { name: "UFC" }));

    await expectPath(router, "/picks");
    await sportContext("UFC PICKS");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("ufc");
  });

  it("switches Play from UFC to Football through the canonical sport state", async () => {
    const router = renderRoute("/play");
    const row = await sportContext("UFC PLAY");

    fireEvent.click(within(row).getByRole("button", { name: "Football" }));

    await expectPath(router, "/football");
    await sportContext("FOOTBALL PLAY");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("football");
  });

  it("switches Play from Football to UFC through the same canonical sport state", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    const router = renderRoute("/football");
    const row = await sportContext("FOOTBALL PLAY");

    fireEvent.click(within(row).getByRole("button", { name: "UFC" }));

    await expectPath(router, "/play");
    await sportContext("UFC PLAY");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("ufc");
  });

  it("keeps sport selection global across Picks and Play in both directions", async () => {
    const router = renderRoute("/picks");
    let row = await sportContext("UFC PICKS");

    fireEvent.click(within(row).getByRole("button", { name: "Football" }));
    await expectPath(router, "/football/picks");

    fireEvent.click(screen.getByRole("link", { name: "Play" }));
    await expectPath(router, "/football");
    row = await sportContext("FOOTBALL PLAY");

    fireEvent.click(within(row).getByRole("button", { name: "UFC" }));
    await expectPath(router, "/play");

    fireEvent.click(screen.getByRole("link", { name: "Picks" }));
    await expectPath(router, "/picks");
    await sportContext("UFC PICKS");
  });

  it("respects the persisted PR 4 sport when choosing Picks and Play from universal surfaces", async () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    const router = renderRoute("/");

    expect(screen.getByRole("link", { name: "Picks" })).toHaveAttribute("href", "/football/picks");
    expect(screen.getByRole("link", { name: "Play" })).toHaveAttribute("href", "/football");

    fireEvent.click(screen.getByRole("link", { name: "Picks" }));
    await expectPath(router, "/football/picks");
    await sportContext("FOOTBALL PICKS");
  });

  it.each([
    ["/picks", "UFC PICKS", "Picks sport"],
    ["/football/picks", "FOOTBALL PICKS", "Picks sport"],
    ["/play", "UFC PLAY", "Play sport"],
    ["/football", "FOOTBALL PLAY", "Play sport"],
  ] as const)("identifies %s with the switchable sport context row", async (path, label, groupName) => {
    if (path.startsWith("/football")) {
      window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    }
    renderRoute(path);

    const row = await sportContext(label);
    const selector = within(row).getByRole("group", { name: groupName });
    expect(within(selector).getByRole("button", { name: "UFC" })).toBeInTheDocument();
    expect(within(selector).getByRole("button", { name: "Football" })).toBeInTheDocument();
  });

  it("identifies Rankings as UFC-only with no Football selector", async () => {
    renderRoute("/rankings");

    const row = await sportContext("UFC RANKINGS");
    expect(within(row).queryByRole("group")).not.toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: "Football" })).not.toBeInTheDocument();
  });

  it("keeps Home universal with no sport context row", () => {
    renderRoute("/");

    expect(screen.queryByTestId("sport-context-row")).not.toBeInTheDocument();
  });

  it("keeps Intelligence clearly UFC-only without a Football option", async () => {
    renderRoute("/intelligence");

    const row = await sportContext("UFC INTELLIGENCE");
    expect(within(row).queryByRole("group")).not.toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: "Football" })).not.toBeInTheDocument();
  });
});
