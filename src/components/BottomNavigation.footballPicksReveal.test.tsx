import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SELECTED_SPORT_STORAGE_KEY,
  SportProvider,
} from "../app/SportProvider";
import { resetFootballEntrySessionForTests } from "../features/back-room/footballEntrySession";
import { BottomNavigation } from "./BottomNavigation";

function LocationProbe() {
  const location = useLocation();
  const footballEntry = (location.state as { footballEntry?: string } | null)?.footballEntry;
  return <output data-testid="location">{location.pathname}|{footballEntry ?? "plain"}</output>;
}

beforeEach(() => {
  window.localStorage.clear();
  resetFootballEntrySessionForTests();
});

afterEach(() => {
  cleanup();
});

describe("BottomNavigation Football Picks reveal", () => {
  it("keeps the first UFC Picks tap in place when Football was persisted, then reveals on the second tap", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");

    render(
      <MemoryRouter initialEntries={["/picks"]}>
        <SportProvider>
          <LocationProbe />
          <BottomNavigation />
        </SportProvider>
      </MemoryRouter>,
    );

    const picks = screen.getByRole("link", { name: "Picks" });
    expect(picks).toHaveAttribute("href", "/football/picks");

    fireEvent.click(picks);
    expect(screen.getByTestId("location")).toHaveTextContent("/picks|plain");

    fireEvent.click(picks);
    expect(screen.getByTestId("location")).toHaveTextContent("/football/picks|picks");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("football");
  });
});
