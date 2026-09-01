import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  SELECTED_SPORT_STORAGE_KEY,
  SportProvider,
  useSport,
} from "./SportProvider";

function SportProbe() {
  const { selectedSport, setSelectedSport } = useSport();

  return (
    <div>
      <output data-testid="selected-sport">{selectedSport}</output>
      <button type="button" onClick={() => setSelectedSport("football")}>
        Select Football
      </button>
      <button type="button" onClick={() => setSelectedSport("ufc")}>
        Select UFC
      </button>
    </div>
  );
}

function renderSportProvider() {
  return render(
    <SportProvider>
      <SportProbe />
    </SportProvider>,
  );
}

describe("SportProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults the canonical selected sport to UFC", () => {
    renderSportProvider();

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("ufc");
  });

  it("restores the last selected sport between sessions", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "football");

    renderSportProvider();

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("football");
  });

  it("persists sport changes through the one canonical owner", () => {
    renderSportProvider();

    fireEvent.click(screen.getByRole("button", { name: "Select Football" }));

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("football");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("football");

    fireEvent.click(screen.getByRole("button", { name: "Select UFC" }));

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("ufc");
    expect(window.localStorage.getItem(SELECTED_SPORT_STORAGE_KEY)).toBe("ufc");
  });

  it("ignores invalid persisted values instead of creating another sport state", () => {
    window.localStorage.setItem(SELECTED_SPORT_STORAGE_KEY, "basketball");

    renderSportProvider();

    expect(screen.getByTestId("selected-sport")).toHaveTextContent("ufc");
  });
});
