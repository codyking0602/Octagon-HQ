import { existsSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ShanesWatchlistPage from "./ShanesWatchlistPage";
import { shanesWatchlist, watchMovement } from "./shanesWatchlist";

describe("Shane's ranked watchlist", () => {
  it("keeps one ordered Top 15 model with Gable first and Quillan second", () => {
    expect(shanesWatchlist.capacity).toBe(15);
    expect(shanesWatchlist.lastUpdated).toBe("August 2026");
    expect(shanesWatchlist.fighters.map((fighter) => fighter.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(shanesWatchlist.fighters[0]).toMatchObject({
      id: "gable-steveson",
      rank: 1,
      previousRank: 1,
      comparison: "Justin Gaethje",
      photoUrl: "/assets/fighters/gable-steveson-thumb.webp",
    });
    expect(existsSync("public/assets/fighters/gable-steveson-thumb.webp")).toBe(true);
    expect(watchMovement(shanesWatchlist.fighters[0])).toEqual({ label: "—", direction: "same" });

    expect(shanesWatchlist.fighters[1]).toMatchObject({
      id: "quillan-salkilld",
      rank: 2,
      previousRank: null,
      proRecord: "13–1",
      ufcRecord: "6–0",
      scoutingNote: "Long, composed and dangerous everywhere, Salkilld looks like a lightweight built to climb the rankings fast.",
      photoUrl: "/assets/fighters/quillan-salkilld-thumb.webp",
    });
    expect(existsSync("public/assets/fighters/quillan-salkilld-thumb.webp")).toBe(true);
    expect(watchMovement(shanesWatchlist.fighters[1])).toEqual({ label: "NEW", direction: "new" });
  });

  it("uses Shane's updated style comparison for Abdul", () => {
    const abdul = shanesWatchlist.fighters.find((fighter) => fighter.id === "abdul-rakhman-yakhyaev");
    expect(abdul?.comparison).toBe("Khamzat Chimaev");
    expect(abdul ? watchMovement(abdul) : null).toEqual({ label: "↓1", direction: "down" });
  });

  it("renders one compact board without inline scouting dossiers", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    const { container } = render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Shane’s Fighters to Watch" })).toBeInTheDocument();
    expect(screen.getByText("5 OF 15 SPOTS FILLED")).toBeInTheDocument();
    expect(screen.getByText("Gable Steveson")).toBeInTheDocument();
    expect(screen.getByText("Quillan Salkilld")).toBeInTheDocument();
    expect(screen.getByText("10 SPOTS OPEN")).toBeInTheDocument();
    expect(screen.getByText("Nobody else has earned a place on Shane’s board yet.")).toBeInTheDocument();

    expect(screen.queryByText("Justin Gaethje")).not.toBeInTheDocument();
    expect(screen.queryByText("Khamzat Chimaev")).not.toBeInTheDocument();
    expect(screen.queryByText("TRACKED SINCE")).not.toBeInTheDocument();
    expect(screen.queryByText("PRO RECORD")).not.toBeInTheDocument();
    expect(screen.queryByText("OPEN SPOT")).not.toBeInTheDocument();
    expect(container.querySelectorAll("details")).toHaveLength(0);

    const movementSummary = screen.getByLabelText("August 2026 movement summary");
    expect(within(movementSummary).getByText("NEW")).toBeInTheDocument();
    expect(within(movementSummary).getByText("MOVED")).toBeInTheDocument();
    expect(within(movementSummary).getByText("HELD")).toBeInTheDocument();
    expect(within(movementSummary).getByText("3")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Former Picks" })).toBeInTheDocument();
    expect(screen.getByText(/No former picks yet/i)).toBeInTheDocument();
  });
});
