import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FootballEntryPage, {
  FOOTBALL_TRANSITION_ASSET,
  FOOTBALL_TRANSITION_MS,
} from "./FootballEntryPage";

const preferences = vi.hoisted(() => ({
  state: {
    footballTeam: null as "cowboys" | "longhorns" | null,
    loading: false,
    savingFootballTeam: false,
    error: "",
    setFootballTeam: vi.fn(async (_team: "cowboys" | "longhorns") => true),
  },
}));

vi.mock("../profile/ProfilePreferencesProvider", () => ({
  useProfilePreferences: () => preferences.state,
}));

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function renderEntry() {
  return render(
    <MemoryRouter initialEntries={["/football/entry"]}>
      <LocationProbe />
      <Routes>
        <Route path="/football/entry" element={<FootballEntryPage />} />
        <Route path="/football" element={<span>Football home</span>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Football entry", () => {
  beforeEach(() => {
    preferences.state.footballTeam = null;
    preferences.state.loading = false;
    preferences.state.savingFootballTeam = false;
    preferences.state.error = "";
    preferences.state.setFootballTeam.mockClear();
    preferences.state.setFootballTeam.mockResolvedValue(true);
  });

  it("requires a first-ever Cowboys or Longhorns choice before starting the transition", async () => {
    renderEntry();

    expect(await screen.findByRole("heading", { name: "Choose your side." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dallas Cowboys/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Texas Longhorns/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("Entering Football HQ")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Dallas Cowboys/ }));
    await waitFor(() => expect(preferences.state.setFootballTeam).toHaveBeenCalledWith("cowboys"));
    expect(await screen.findByLabelText("Entering Football HQ")).toBeInTheDocument();
  });

  it("uses the single local Vince transition asset and enters Football HQ when it ends", async () => {
    preferences.state.footballTeam = "longhorns";
    renderEntry();

    const transition = await screen.findByLabelText("Entering Football HQ");
    const video = transition.querySelector("video");
    expect(FOOTBALL_TRANSITION_ASSET).toBe("/assets/football/vince-young-transition.mp4");
    expect(FOOTBALL_TRANSITION_MS).toBeGreaterThanOrEqual(1500);
    expect(FOOTBALL_TRANSITION_MS).toBeLessThanOrEqual(2000);
    expect(video).toHaveAttribute("src", FOOTBALL_TRANSITION_ASSET);
    expect(video).toHaveAttribute("muted");
    expect(video).toHaveAttribute("playsinline");

    fireEvent.ended(video!);
    expect(screen.getByTestId("location")).toHaveTextContent("/football");
  });
});
