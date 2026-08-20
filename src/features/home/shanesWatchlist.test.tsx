import { existsSync } from "node:fs";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ShanesWatchlistCard } from "./ShanesWatchlistCard";
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

  it("keeps the Home preview to a compact top-three board", () => {
    const { container } = render(<MemoryRouter><ShanesWatchlistCard /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Fighters to Watch" })).toBeInTheDocument();
    expect(screen.getByText("Gable Steveson")).toBeInTheDocument();
    expect(screen.getByText("Quillan Salkilld")).toBeInTheDocument();
    expect(screen.getByText("Fatima Kline")).toBeInTheDocument();
    expect(screen.queryByText("Abdul Rakhman Yakhyaev")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Gable Steveson/i })).toHaveAttribute("href", "/fighters-to-watch#gable-steveson");
    expect(screen.getByRole("link", { name: "VIEW FULL BOARD →" })).toHaveAttribute("href", "/fighters-to-watch");

    expect(screen.queryByText("Justin Gaethje")).not.toBeInTheDocument();
    expect(screen.queryByText("First-round UFC debut knockout")).not.toBeInTheDocument();
    expect(screen.queryByText(shanesWatchlist.fighters[0].scoutingNote)).not.toBeInTheDocument();
    expect(container.querySelectorAll("blockquote")).toHaveLength(0);
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
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(container.querySelectorAll("details")).toHaveLength(0);

    const movementSummary = screen.getByLabelText("August 2026 movement summary");
    expect(within(movementSummary).getByText("NEW")).toBeInTheDocument();
    expect(within(movementSummary).getByText("MOVED")).toBeInTheDocument();
    expect(within(movementSummary).getByText("HELD")).toBeInTheDocument();
    expect(within(movementSummary).getByText("3")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Former Picks" })).toBeInTheDocument();
    expect(screen.getByText(/No former picks yet/i)).toBeInTheDocument();
  });

  it("opens one full scouting report from a compact ranking row", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Open scouting report for Quillan Salkilld" }));

    const dialog = screen.getByRole("dialog", { name: "Quillan Salkilld" });
    expect(within(dialog).getByText("13–1")).toBeInTheDocument();
    expect(within(dialog).getByText("6–0")).toBeInTheDocument();
    expect(within(dialog).getByText("WHY HE’S HERE")).toBeInTheDocument();
    expect(within(dialog).getByText("Six straight UFC wins · Gamrot submission")).toBeInTheDocument();
    expect(within(dialog).getByText("Tracked since August 2026 · Reviewed August 2026")).toBeInTheDocument();
    expect(within(dialog).queryByText("STYLE COMP")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "VIEW UFC PROFILE ↗" })).toHaveAttribute(
      "href",
      "https://www.ufc.com/athlete/quillan-salkilld",
    );
    expect(window.location.hash).toBe("#quillan-salkilld");

    fireEvent.click(within(dialog).getByRole("button", { name: "Close scouting report" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.location.hash).toBe("");
    expect(screen.getByText("10 SPOTS OPEN")).toBeInTheDocument();
  });

  it("opens a Home deep link directly into the matching scouting report", () => {
    window.history.replaceState({}, "", "/fighters-to-watch#gable-steveson");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    const dialog = screen.getByRole("dialog", { name: "Gable Steveson" });
    expect(within(dialog).getByText("SHANE’S READ")).toBeInTheDocument();
    expect(within(dialog).getByText("STYLE COMP")).toBeInTheDocument();
    expect(within(dialog).getByText("Justin Gaethje")).toBeInTheDocument();
    expect(within(dialog).getByText("First-round UFC debut knockout")).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });
});
