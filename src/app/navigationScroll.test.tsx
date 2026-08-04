import { readFileSync } from "node:fs";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryRouter,
  Link,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BottomNavigation } from "../components/BottomNavigation";
import { RouteScrollManager } from "./RouteScrollManager";

vi.mock("../features/war-room/WarRoomProvider", () => ({
  useWarRoom: () => ({ status: "locked", unreadCount: 0 }),
}));

const scrollTo = vi.fn();
const appShell = readFileSync("src/app/AppShell.tsx", "utf8");

function ScrollHarness() {
  const location = useLocation();

  return (
    <>
      <RouteScrollManager />
      <Link to="/rankings">Rankings route</Link>
      <Link to="/fighters/jon-jones">Jon Jones fighter card</Link>
      <Link to="/fighters/jon-jones#resume">Jon Jones resume section</Link>
      <Link to="/play/auction?auction=123e4567-e89b-42d3-a456-426614174000">Auction destination</Link>
      <output aria-label="Current route">
        {location.pathname}{location.search}{location.hash}
      </output>
    </>
  );
}

beforeEach(() => {
  scrollTo.mockReset();
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    value: scrollTo,
  });
  Object.defineProperty(window.history, "scrollRestoration", {
    configurable: true,
    writable: true,
    value: "auto",
  });
});

afterEach(cleanup);

describe("predictable navigation scroll", () => {
  it("uses the app shell route owner to reset every normal destination to the top", async () => {
    expect(appShell).toContain("<RouteScrollManager />");

    const router = createMemoryRouter(
      [{ path: "*", element: <ScrollHarness /> }],
      { initialEntries: ["/"] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
    });
    expect(window.history.scrollRestoration).toBe("manual");

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("link", { name: "Rankings route" }));
    await screen.findByText("/rankings");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("link", { name: "Jon Jones fighter card" }));
    await screen.findByText("/fighters/jon-jones");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("link", { name: "Auction destination" }));
    await screen.findByText("/play/auction?auction=123e4567-e89b-42d3-a456-426614174000");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("link", { name: "Jon Jones resume section" }));
    await screen.findByText("/fighters/jon-jones#resume");
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("turns an exact active primary tab tap into a smooth back-to-top action", () => {
    const router = createMemoryRouter(
      [{ path: "*", element: <BottomNavigation /> }],
      { initialEntries: ["/rankings?view=women"] },
    );
    render(<RouterProvider router={router} />);

    fireEvent.click(screen.getByRole("link", { name: "Rankings" }));

    expect(router.state.location.pathname).toBe("/rankings");
    expect(router.state.location.search).toBe("?view=women");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "smooth" });
  });

  it("still navigates a nested primary route back to its tab root", async () => {
    const router = createMemoryRouter(
      [{ path: "*", element: <BottomNavigation /> }],
      { initialEntries: ["/picks/control"] },
    );
    render(<RouterProvider router={router} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("link", { name: "Picks" }));
    });

    expect(router.state.location.pathname).toBe("/picks");
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
