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

describe("BottomNavigation Football Picks no-reveal navigation", () => {
  it("switches UFC Picks directly to Football without injecting clip state", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "ufc");

    render(
      <MemoryRouter initialEntries={["/picks"]}>
        <SportProvider>
          <LocationProbe />
          <BottomNavigation />
        </SportProvider>
      </MemoryRouter>,
    );
    const picks = screen.getByRole("link", { name: "Picks" });
    fireEvent.click(picks);
    fireEvent.click(picks);
    expect(screen.getByTestId("location")).toHaveTextContent("/mlb/picks|plain");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("mlb");
  });
});
