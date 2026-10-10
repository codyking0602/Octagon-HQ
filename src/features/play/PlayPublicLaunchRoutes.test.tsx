// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppProviders } from "../../app/providers";
import { appRoutes } from "../../app/router";

afterEach(cleanup);

describe("public Football and UFC Play launch routes", () => {
  it.each([
    ["/football", "football", "6 GAMES"],
    ["/play", "ufc", "4 GAMES"],
  ])("uses the finished Play hub for every visitor at %s", async (path, sport, count) => {
    const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
    render(<AppProviders><RouterProvider router={router} /></AppProviders>);
    const hub = await screen.findByTestId("play-v2-hub");
    expect(hub).toHaveAttribute("data-sport", sport);
    expect(hub).toHaveTextContent("Game Room");
    expect(hub).toHaveTextContent(count);
    expect(hub).not.toHaveTextContent("The GM · College");
    expect(router.state.location.pathname).toBe(path);
  });

  it("closes the paused CFB GM direct link without deleting game code", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/football/gm-cfb-preview"],
    });
    render(<AppProviders><RouterProvider router={router} /></AppProviders>);
    expect(await screen.findByTestId("play-v2-hub")).toHaveAttribute("data-sport", "football");
    expect(router.state.location.pathname).toBe("/football");
    expect(screen.queryByText("Owner playtest · CFB dynasty")).not.toBeInTheDocument();
  });
});
