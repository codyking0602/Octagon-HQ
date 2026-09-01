import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SELECTED_SPORT_STORAGE_KEY,
  SportProvider,
} from "../app/SportProvider";
import { BottomNavigation } from "./BottomNavigation";

vi.mock("../features/war-room/WarRoomProvider", () => ({
  useWarRoom: () => ({ status: "eligible", unreadCount: 7 }),
}));

type MutableVisualViewport = EventTarget & {
  height: number;
  offsetTop: number;
};

const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  if (originalInnerHeight) Object.defineProperty(window, "innerHeight", originalInnerHeight);
  else Reflect.deleteProperty(window, "innerHeight");
  if (originalVisualViewport) Object.defineProperty(window, "visualViewport", originalVisualViewport);
  else Reflect.deleteProperty(window, "visualViewport");
});

function setInnerHeight(value: number) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value,
  });
}

function installVisualViewport() {
  const viewport = new EventTarget() as MutableVisualViewport;
  viewport.height = 844;
  viewport.offsetTop = 0;
  setInnerHeight(844);
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: viewport,
  });
  return viewport;
}

function LocationProbe() {
  const location = useLocation();
  const footballEntry = Boolean((location.state as { footballEntry?: boolean } | null)?.footballEntry);
  return <output data-testid="location">{location.pathname}|{footballEntry ? "entry" : "plain"}</output>;
}

function renderNavigation(initialEntries: string[] = ["/"], children: ReactNode = null) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SportProvider>
        {children}
        <BottomNavigation />
      </SportProvider>
    </MemoryRouter>,
  );
}

describe("BottomNavigation", () => {
  it("renders exactly Home, Picks, Play, and Rankings in order without War Room", () => {
    renderNavigation();

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    const links = Array.from(navigation.querySelectorAll("a"));

    expect(links).toHaveLength(4);
    expect(links.map((link) => link.textContent)).toEqual(["Home", "Picks", "Play", "Rankings"]);
    expect(screen.queryByRole("link", { name: /War Room/i })).not.toBeInTheDocument();
  });

  it("keeps UFC destinations for Picks, Play, and Rankings", () => {
    renderNavigation();

    expect(screen.getByRole("link", { name: "Picks" })).toHaveAttribute("href", "/picks");
    expect(screen.getByRole("link", { name: "Play" })).toHaveAttribute("href", "/play");
    expect(screen.getByRole("link", { name: "Rankings" })).toHaveAttribute("href", "/rankings");
  });

  it("uses the globally selected Football Picks and Play destinations while keeping Rankings UFC-only", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    renderNavigation(["/football/picks"]);

    expect(screen.getByRole("link", { name: "Picks" })).toHaveAttribute("href", "/football/picks");
    expect(screen.getByRole("link", { name: "Play" })).toHaveAttribute("href", "/football");
    expect(screen.getByRole("link", { name: "Rankings" })).toHaveAttribute("href", "/rankings");
    expect(screen.queryByRole("link", { name: /Football Rankings/i })).not.toBeInTheDocument();
  });

  it("does not mistake a resumed stale shrunken viewport for an open keyboard", () => {
    const viewport = installVisualViewport();
    renderNavigation();

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(navigation).not.toHaveClass("is-keyboard-open");
    expect(navigation).toHaveStyle({ display: "grid" });

    act(() => {
      viewport.height = 500;
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(navigation).not.toHaveClass("is-keyboard-open");
    expect(navigation).toHaveStyle({ display: "grid" });
    expect(navigation).toHaveStyle({ transform: "translateY(344px)" });
  });

  it("still hides the navigation when an editor owns a materially occluded viewport", () => {
    const viewport = installVisualViewport();
    renderNavigation(["/"], <input aria-label="Message" />);

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    const input = screen.getByRole("textbox", { name: "Message" });

    act(() => {
      input.focus();
      viewport.height = 500;
      viewport.dispatchEvent(new Event("resize"));
    });

    expect(navigation).toHaveClass("is-keyboard-open");
    expect(navigation).toHaveStyle({ display: "none" });
  });

  it("keeps the navigation hidden after blur until the keyboard viewport recovers", () => {
    const viewport = installVisualViewport();
    renderNavigation(["/"], <input aria-label="Message" />);

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    const input = screen.getByRole("textbox", { name: "Message" });

    act(() => {
      input.focus();
      viewport.height = 500;
      viewport.dispatchEvent(new Event("resize"));
    });
    expect(navigation).toHaveStyle({ display: "none" });

    act(() => {
      input.blur();
      viewport.dispatchEvent(new Event("resize"));
    });
    expect(navigation).toHaveClass("is-keyboard-open");
    expect(navigation).toHaveStyle({ display: "none" });

    act(() => {
      viewport.height = 844;
      viewport.dispatchEvent(new Event("resize"));
    });
    expect(navigation).not.toHaveClass("is-keyboard-open");
    expect(navigation).toHaveStyle({ display: "grid" });
  });

  it("corrects a stale short layout viewport so the nav stays on the visible bottom edge", () => {
    const viewport = installVisualViewport();
    renderNavigation();

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });

    act(() => {
      setInnerHeight(700);
      viewport.dispatchEvent(new Event("resize"));
    });

    expect(navigation).toHaveStyle({ transform: "translateY(144px)" });
    expect(navigation).toHaveStyle({ display: "grid" });
  });

  it("enters Football only after a second tap on the active Play tab", () => {
    installVisualViewport();
    renderNavigation(["/play"], <LocationProbe />);

    const play = screen.getByRole("link", { name: "Play" });
    fireEvent.click(play);
    expect(screen.getByTestId("location")).toHaveTextContent("/play|plain");

    fireEvent.click(play);
    expect(screen.getByTestId("location")).toHaveTextContent("/football|entry");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("football");
  });

  it("double-taps the active Football Play tab back to UFC", () => {
    installVisualViewport();
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");
    renderNavigation(["/football"], <LocationProbe />);

    const play = screen.getByRole("link", { name: "Play" });
    fireEvent.click(play);
    expect(screen.getByTestId("location")).toHaveTextContent("/football|plain");

    fireEvent.click(play);
    expect(screen.getByTestId("location")).toHaveTextContent("/play|plain");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("ufc");
  });
});
