import { existsSync, readFileSync } from "node:fs";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ShanesWatchlistCard } from "./ShanesWatchlistCard";
import ShanesWatchlistPage from "./ShanesWatchlistPage";
import { shanesWatchlist, watchMovement } from "./shanesWatchlist";

describe("Shane's ranked watchlist", () => {
  it("keeps one ordered Top 15 model and the approved fight-highlight links", () => {
    expect(shanesWatchlist.capacity).toBe(15);
    expect(shanesWatchlist.lastUpdated).toBe("August 2026");
    expect(shanesWatchlist.fighters.map((fighter) => fighter.rank)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(shanesWatchlist.fighters[0]).toMatchObject({
      id: "gable-steveson",
      rank: 1,
      previousRank: 1,
      subjectPronoun: "he",
      ufcRecord: "1–0",
      ufcWinStreak: "1",
      ufcFinishes: "1",
      photoUrl: "/assets/fighters/gable-steveson-thumb.webp",
      videoUrl: "https://youtube.com/shorts/2V8eGAiUZaU?is=b2fwdTJ5f9m1LVZ5",
    });
    expect(existsSync("public/assets/fighters/gable-steveson-thumb.webp")).toBe(true);
    expect(watchMovement(shanesWatchlist.fighters[0])).toEqual({ label: "—", direction: "same" });

    expect(shanesWatchlist.fighters[1]).toMatchObject({
      id: "quillan-salkilld",
      rank: 2,
      previousRank: null,
      subjectPronoun: "he",
      ufcRecord: "6–0",
      ufcWinStreak: "6",
      ufcFinishes: "5",
      photoUrl: "/assets/fighters/quillan-salkilld-thumb.webp",
      videoUrl: "https://youtube.com/shorts/ivb3NbPsnYg?is=y2ti4vYuCvUdFroV",
    });
    expect(existsSync("public/assets/fighters/quillan-salkilld-thumb.webp")).toBe(true);
    expect(watchMovement(shanesWatchlist.fighters[1])).toEqual({ label: "NEW", direction: "new" });

    expect(shanesWatchlist.fighters[2]).toMatchObject({
      id: "fatima-kline",
      subjectPronoun: "she",
      videoUrl: "https://youtu.be/E3Eat8_BBjM?is=69fExP5AoinR5Xdt",
    });

    expect(shanesWatchlist.fighters[4]).toMatchObject({
      id: "bilal-hasan",
      rank: 5,
      previousRank: null,
      nickname: "The IndoNinja",
      division: "Flyweight",
      age: 25,
      ufcRecord: "0–0",
      ufcWinStreak: "0",
      ufcFinishes: "0",
      photoUrl: null,
      videoUrl: "https://www.cbssports.com/watch/ufc/video/dwcs-week-1-highlights-bilal-hasan-at-mridul-saikia",
    });
    expect(shanesWatchlist.fighters[4].scoutingSnapshot).toContain("Nilson Rojas on August 29");
    expect(watchMovement(shanesWatchlist.fighters[4])).toEqual({ label: "NEW", direction: "new" });

    expect(shanesWatchlist.fighters[5]).toMatchObject({
      id: "daniil-donchenko",
      rank: 6,
      previousRank: 4,
    });
    expect(watchMovement(shanesWatchlist.fighters[5])).toEqual({ label: "↓2", direction: "down" });

    expect(shanesWatchlist.fighters.map((fighter) => fighter.videoUrl)).toEqual([
      "https://youtube.com/shorts/2V8eGAiUZaU?is=b2fwdTJ5f9m1LVZ5",
      "https://youtube.com/shorts/ivb3NbPsnYg?is=y2ti4vYuCvUdFroV",
      "https://youtu.be/E3Eat8_BBjM?is=69fExP5AoinR5Xdt",
      "https://youtube.com/shorts/k5En_QDBACA?is=KeKmxuwmh7N1yb1N",
      "https://www.cbssports.com/watch/ufc/video/dwcs-week-1-highlights-bilal-hasan-at-mridul-saikia",
      "https://youtube.com/shorts/hAPpKy3ZALk?is=MWDtVBsFxcT0IV2L",
    ]);
  });

  it("keeps the Home preview to a compact top-three board", () => {
    const { container } = render(<MemoryRouter><ShanesWatchlistCard /></MemoryRouter>);

    expect(screen.getByText("SHANE KING’S CONTENDER SERIES")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fighters to Watch" })).toBeInTheDocument();
    expect(screen.getByText("Gable Steveson")).toBeInTheDocument();
    expect(screen.getByText("Quillan Salkilld")).toBeInTheDocument();
    expect(screen.getByText("Fatima Kline")).toBeInTheDocument();
    expect(screen.queryByText("Abdul Rakhman Yakhyaev")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Gable Steveson/i })).toHaveAttribute("href", "/fighters-to-watch#gable-steveson");
    expect(screen.getByRole("link", { name: "VIEW FULL BOARD →" })).toHaveAttribute("href", "/fighters-to-watch");
    expect(screen.queryByText(shanesWatchlist.fighters[0].boardNote)).not.toBeInTheDocument();
    expect(container.querySelectorAll("blockquote")).toHaveLength(0);
  });

  it("renders one compact board without an open scouting report", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    const { container } = render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Shane King’s Contender Series" })).toBeInTheDocument();
    expect(screen.getByText("A living Top 15 of UFC prospects to watch as their careers develop.")).toBeInTheDocument();
    expect(screen.getByText("6 OF 15 SPOTS FILLED")).toBeInTheDocument();
    expect(screen.getByText("Gable Steveson")).toBeInTheDocument();
    expect(screen.getByText("Quillan Salkilld")).toBeInTheDocument();
    expect(screen.getByText("Bilal Hasan")).toBeInTheDocument();
    expect(screen.getByText("9 SPOTS OPEN")).toBeInTheDocument();
    expect(screen.getByText("Nobody else has earned a place on Shane’s board yet.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(container.querySelectorAll("details")).toHaveLength(0);

    const movementSummary = screen.getByLabelText("August 2026 movement summary");
    expect(within(movementSummary).getByText("NEW")).toBeInTheDocument();
    expect(within(movementSummary).getByText("MOVED")).toBeInTheDocument();
    expect(within(movementSummary).getByText("HELD")).toBeInTheDocument();
    expect(within(movementSummary).getByText("2")).toBeInTheDocument();
    expect(within(movementSummary).getByText("3")).toBeInTheDocument();
  });

  it("opens the real scouting snapshot as three readable beats with UFC-only numbers", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    const { container } = render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Open scouting report for Quillan Salkilld" }));

    const dialog = screen.getByRole("dialog", { name: "Quillan Salkilld" });
    expect(within(dialog).getByText("SCOUTING SNAPSHOT")).toBeInTheDocument();
    expect(within(dialog).getByText(/one of the most complete games among the UFC’s young lightweights/i)).toBeInTheDocument();
    expect(within(dialog).getByText("UFC RECORD")).toBeInTheDocument();
    expect(within(dialog).getByText("UFC WIN STREAK")).toBeInTheDocument();
    expect(within(dialog).getByText("UFC FINISHES")).toBeInTheDocument();
    expect(within(dialog).getByText("WHY HE’S ON THE BOARD")).toBeInTheDocument();
    expect(within(dialog).queryByText("PRO RECORD")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("STYLE COMP")).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/Tracked since/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByText("SHANE’S READ")).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("link", { name: /VIEW UFC PROFILE/i })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "WATCH FIGHT HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtube.com/shorts/ivb3NbPsnYg?is=y2ti4vYuCvUdFroV",
    );

    const snapshotParagraphs = Array.from(dialog.querySelectorAll(".watchlist-scouting-card__read-copy p"));
    expect(snapshotParagraphs).toHaveLength(3);
    expect(snapshotParagraphs.map((paragraph) => paragraph.textContent).join(" ")).toBe(shanesWatchlist.fighters[1].scoutingSnapshot);

    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.querySelector(".watchlist-scouting-overlay")).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");
    expect(window.location.hash).toBe("#quillan-salkilld");

    fireEvent.click(within(dialog).getByRole("button", { name: "Close scouting report" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(window.location.hash).toBe("");
  });

  it("uses the correct female board label on Fatima Kline's scouting report", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Open scouting report for Fatima Kline" }));

    const dialog = screen.getByRole("dialog", { name: "Fatima Kline" });
    expect(within(dialog).getByText("WHY SHE’S ON THE BOARD")).toBeInTheDocument();
    expect(within(dialog).queryByText("WHY HE’S ON THE BOARD")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "WATCH FIGHT HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/E3Eat8_BBjM?is=69fExP5AoinR5Xdt",
    );
  });

  it("opens a Home deep link directly into Gable's repaired scouting report", () => {
    window.history.replaceState({}, "", "/fighters-to-watch#gable-steveson");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    const dialog = screen.getByRole("dialog", { name: "Gable Steveson" });
    expect(within(dialog).getByText("SHANE’S RANKING · #1")).toBeInTheDocument();
    expect(within(dialog).getByText("SCOUTING SNAPSHOT")).toBeInTheDocument();
    expect(within(dialog).getByText(/only one Octagon appearance/i)).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "WATCH FIGHT HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtube.com/shorts/2V8eGAiUZaU?is=b2fwdTJ5f9m1LVZ5",
    );
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("keeps the scouting sheet scrollable and makes the highlight action more compact", () => {
    const css = readFileSync("src/styles/watchlist-scouting.css", "utf8");
    expect(css).toContain("z-index: 1000");
    expect(css).toContain("overflow-y: auto");
    expect(css).toContain("touch-action: pan-y");
    expect(css).toContain("-webkit-overflow-scrolling: touch");
    expect(css).toContain("max-height: calc(100dvh - 24px)");
    expect(css).toContain(".watchlist-scouting-card__read-copy p + p");
    expect(css).toContain("min-height: 40px");
    expect(css).toContain("font-size: 13px");
  });
});
