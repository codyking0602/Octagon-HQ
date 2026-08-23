import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { BACK_ROOM_LONG_PRESS_MS, BackRoomLogoLink } from "./BackRoomLogoLink";
import BackRoomPage from "./BackRoomPage";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

describe("Back Room portal", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens the hidden Back Room only after a long press on the Games logo and remembers discovery", () => {
    render(
      <MemoryRouter initialEntries={["/play"]}>
        <Routes>
          <Route path="/play" element={<BackRoomLogoLink enabled />} />
          <Route path="/back-room" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    const logo = screen.getByRole("link", { name: "Return to Home" });
    fireEvent.pointerDown(logo);

    act(() => {
      vi.advanceTimersByTime(BACK_ROOM_LONG_PRESS_MS - 1);
    });
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByTestId("location")).toHaveTextContent("/back-room");
    expect(window.localStorage.getItem("octagon-hq.back-room.discovered.v1")).toBe("1");
  });

  it("keeps Football completely absent from the discovered Back Room", () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/back-room", state: { showDiscovery: true } }]}>
        <Routes>
          <Route path="/back-room" element={<BackRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("You weren’t supposed to find this.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ENTER THE BACK ROOM" }));

    expect(screen.getByRole("heading", { name: "The Back Room" })).toBeInTheDocument();
    expect(screen.queryByText("FOOTBALL")).not.toBeInTheDocument();
    expect(screen.getByText("COMING SOON")).toBeInTheDocument();
  });
});
