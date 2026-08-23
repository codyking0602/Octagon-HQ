import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FootballHeader } from "./FootballHeader";

const preferences = vi.hoisted(() => ({
  state: {
    footballTeam: "cowboys" as "cowboys" | "longhorns" | null,
    savingFootballTeam: false,
    setFootballTeam: vi.fn(async (_team: "cowboys" | "longhorns") => true),
  },
}));

vi.mock("../profile/ProfilePreferencesProvider", () => ({
  useProfilePreferences: () => preferences.state,
}));

describe("FootballHeader", () => {
  beforeEach(() => {
    preferences.state.footballTeam = "cowboys";
    preferences.state.savingFootballTeam = false;
    preferences.state.setFootballTeam.mockClear();
    preferences.state.setFootballTeam.mockResolvedValue(true);
  });

  it("owns Football identity, a visible UFC exit, and persisted helmet switching", async () => {
    render(
      <MemoryRouter>
        <FootballHeader />
      </MemoryRouter>,
    );

    expect(screen.getByText("FOOTBALL HQ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to UFC" })).toHaveAttribute("href", "/play");

    fireEvent.click(screen.getByRole("button", { name: /Switch Football team.*Dallas Cowboys/ }));
    expect(screen.getByRole("dialog", { name: "Switch Football team" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Texas Longhorns/ }));
    await waitFor(() => expect(preferences.state.setFootballTeam).toHaveBeenCalledWith("longhorns"));
  });
});
