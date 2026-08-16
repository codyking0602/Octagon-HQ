import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BottomNavigation } from "./BottomNavigation";

vi.mock("../features/war-room/WarRoomProvider", () => ({
  useWarRoom: () => ({ status: "locked", unreadCount: 0 }),
}));

type MutableVisualViewport = EventTarget & {
  height: number;
  offsetTop: number;
};

const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");

afterEach(() => {
  cleanup();
  if (originalInnerHeight) Object.defineProperty(window, "innerHeight", originalInnerHeight);
  else Reflect.deleteProperty(window, "innerHeight");
  if (originalVisualViewport) Object.defineProperty(window, "visualViewport", originalVisualViewport);
  else Reflect.deleteProperty(window, "visualViewport");
});

function installVisualViewport() {
  const viewport = new EventTarget() as MutableVisualViewport;
  viewport.height = 844;
  viewport.offsetTop = 0;
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 844,
  });
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: viewport,
  });
  return viewport;
}

describe("BottomNavigation", () => {
  it("keeps a resumed stale viewport from floating the nav above the bottom", () => {
    const viewport = installVisualViewport();
    render(
      <MemoryRouter>
        <BottomNavigation />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(navigation).not.toHaveClass("is-keyboard-open");

    act(() => {
      viewport.height = 500;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(navigation).toHaveClass("is-keyboard-open");

    act(() => {
      viewport.height = 844;
      viewport.dispatchEvent(new Event("resize"));
    });
    expect(navigation).not.toHaveClass("is-keyboard-open");
  });
});
