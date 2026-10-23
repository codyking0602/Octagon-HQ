import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NbaWavelengthPage from "./NbaWavelengthPage";
import { createNbaWavelengthDailyPreview } from "./nbaWavelengthModel";

function mount(daily = false) {
  return render(
    <MemoryRouter initialEntries={[daily ? "/nba/wavelength?mode=daily" : "/nba/wavelength"]}>
      <NbaWavelengthPage />
    </MemoryRouter>,
  );
}
function finishGame() {
  for (let n = 0; n < 3; n += 1) {
    expect(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
  }
  fireEvent.click(screen.getByRole("button", { name: "LOCK FINAL GUESS" }));
}

describe("NBA Wavelength owner-only presentation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("scrollTo", vi.fn());
  });

  it("reuses the approved Wavelength control path, NBA category copy and four-clue reveal", () => {
    const view = mount();
    expect(screen.getByTestId("nba-wavelength-owner-preview")).toHaveAttribute("data-sport", "nba");
    expect(view.container.querySelector(".wavelength-page--nba")).toBeInTheDocument();
    expect(screen.getByText("Find the hidden 1–100 number.")).toBeInTheDocument();
    expect(screen.getByText("Each clue reacts to your last guess. Only your fourth guess scores.")).toBeInTheDocument();
    expect((screen.getByRole("slider", { name: "NBA Wavelength guess from 1 to 100" }) as HTMLInputElement).value).toBe("50");
    expect(screen.getByText("GAME 1 OF 2")).toBeInTheDocument();
    finishGame();
    expect(screen.getByText("HIDDEN NUMBER")).toBeInTheDocument();
    expect(screen.getByText("FINAL GUESS")).toBeInTheDocument();
    expect(screen.getByText("CLUE REVEAL")).toBeInTheDocument();
    expect(screen.getByText(/A rating refers only to the named basketball trait/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "START GAME 2 →" })).toBeInTheDocument();
  });

  it("resets the slider for Game 2 and displays the official formula as a local preview average", () => {
    mount();
    const slider = screen.getByRole("slider", { name: "NBA Wavelength guess from 1 to 100" });
    fireEvent.change(slider, { target: { value: "91" } });
    expect((slider as HTMLInputElement).value).toBe("91");
    finishGame();
    fireEvent.click(screen.getByRole("button", { name: "START GAME 2 →" }));
    expect(screen.getByText("GAME 2 OF 2")).toBeInTheDocument();
    expect((screen.getByRole("slider", { name: "NBA Wavelength guess from 1 to 100" }) as HTMLInputElement).value).toBe("50");
    finishGame();
    expect(screen.getByLabelText("NBA Wavelength preview average")).toBeInTheDocument();
    expect(screen.getByText("Both games count equally. Only each game's fourth guess is scored.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW LINEUP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ALL NBA GAMES" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "NEW LINEUP" }));
    expect(screen.getByText("GAME 1 OF 2")).toBeInTheDocument();
    expect(screen.queryByLabelText("NBA Wavelength preview average")).not.toBeInTheDocument();
  });

  it("keeps the Daily run unranked, replayable with the same opening and without any official persistence", () => {
    mount(true);
    expect(screen.getByText("OWNER DAILY PREVIEW")).toBeInTheDocument();
    expect(screen.getByText("UNRANKED · NOT SAVED")).toBeInTheDocument();
    const opening = screen.getByRole("heading", { level: 1 }).textContent;
    finishGame();
    fireEvent.click(screen.getByRole("button", { name: "START GAME 2 →" }));
    finishGame();
    expect(screen.getByText("DAILY PREVIEW · UNRANKED")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REPLAY TODAY" })).toBeInTheDocument();
    // Casual local history is also forbidden for Daily preview.
    expect(window.localStorage.getItem("octagon-hq:play-lineup-history:v1")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "REPLAY TODAY" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(opening);
    expect((screen.getByRole("slider", { name: "NBA Wavelength guess from 1 to 100" }) as HTMLInputElement).value).toBe("50");
  });

  it("has owner-only routes and does not enroll the NBA in the official Daily schedule", async () => {
    const router = await import("../../app/router");
    const branch = router.appRoutes[0].children!;
    const preview = branch.find(route => route.path === "nba/wavelength");
    expect(preview).toBeDefined();
    expect(preview?.element).toBeDefined();
    expect(branch.find(route => route.path === "nba/wavelength/daily")).toBeUndefined();
    expect(createNbaWavelengthDailyPreview("2026-10-23").identity.type).toBe("daily");
  });
});
