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

describe("BottomNavigation", () => {
  it("does not mistake a resumed stale shrunken viewport for an open keyboard", () => {
    const viewport = installVisualViewport();
    render(
      <MemoryRouter>
        <BottomNavigation />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(navigation).not.toHaveClass("is-keyboard-open");
    expect(navigation).toHaveStyle({ display: "grid" });

    act(() => {
      viewport.height = 500;
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(navigation).not.toHaveClass("is-keyboard-open");
    expect(navigation).toHaveStyle({ display: "grid" });
  });

  it("still hides the navigation when an editor owns a materially occluded viewport", () => {
    const viewport = installVisualViewport();
    render(
      <MemoryRouter>
        <input aria-label="Message" />
        <BottomNavigation />
      </MemoryRouter>,
    );

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

  it("corrects a stale short layout viewport so the nav stays on the visible bottom edge", () => {
    const viewport = installVisualViewport();
    render(
      <MemoryRouter>
        <BottomNavigation />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });

    act(() => {
      setInnerHeight(700);
      viewport.dispatchEvent(new Event("resize"));
    });

    expect(navigation).toHaveStyle({ transform: "translateY(144px)" });
    expect(navigation).toHaveStyle({ display: "grid" });
  });
});
