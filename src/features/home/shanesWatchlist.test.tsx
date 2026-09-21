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
    expect(shanesWatchlist.lastUpdated).toBe("September 2026");
    expect(shanesWatchlist.fighters.map((fighter) => fighter.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(shanesWatchlist.fighters.map((fighter) => fighter.id)).toEqual([
      "quillan-salkilld",
      "abdul-rakhman-yakhyaev",
      "bilal-hasan",
      "raul-rosas-jr",
      "fatima-kline",
      "daniil-donchenko",
      "ty-miller",
      "gable-steveson",
    ]);

    const salkilld = shanesWatchlist.fighters[0];
    expect(salkilld).toMatchObject({
      id: "quillan-salkilld",
      rank: 1,
      previousRank: 2,
      ufcRecord: "6–0",
      ufcWinStreak: "6",
      ufcFinishes: "5",
      photoUrl: "/assets/fighters/quillan-salkilld-thumb.webp",
      videoUrl: "https://youtube.com/shorts/ivb3NbPsnYg?is=y2ti4vYuCvUdFroV",
    });
    expect(watchMovement(salkilld)).toEqual({ label: "↑1", direction: "up" });

    const yakhyaev = shanesWatchlist.fighters[1];
    expect(yakhyaev).toMatchObject({
      id: "abdul-rakhman-yakhyaev",
      rank: 2,
      previousRank: 3,
    });
    expect(watchMovement(yakhyaev)).toEqual({ label: "↑1", direction: "up" });

    const bilal = shanesWatchlist.fighters[2];
    expect(bilal).toMatchObject({
      id: "bilal-hasan",
      rank: 3,
      previousRank: 4,
      ufcRecord: "1–0",
    });
    expect(watchMovement(bilal)).toEqual({ label: "↑1", direction: "up" });

    const rosas = shanesWatchlist.fighters[3];
    expect(rosas).toMatchObject({
      id: "raul-rosas-jr",
      rank: 4,
      previousRank: null,
      nickname: "El Nino Problema",
      division: "Bantamweight",
      age: 21,
      ufcRecord: "6–1",
      ufcWinStreak: "5",
      ufcFinishes: "3",
      photoUrl: "/assets/fighters/raul-rosas-jr-thumb.webp",
      videoUrl: "https://youtu.be/Nf6Kb6c3uq8?si=fN5vhUPEhtkHbBto",
    });
    expect(existsSync("public/assets/fighters/raul-rosas-jr-thumb.webp")).toBe(true);
    expect(watchMovement(rosas)).toEqual({ label: "NEW", direction: "new" });

    const fatima = shanesWatchlist.fighters[4];
    expect(fatima).toMatchObject({ id: "fatima-kline", rank: 5, previousRank: 5 });
    expect(watchMovement(fatima)).toEqual({ label: "—", direction: "same" });

    const daniil = shanesWatchlist.fighters[5];
    expect(daniil).toMatchObject({ id: "daniil-donchenko", rank: 6, previousRank: 6 });
    expect(watchMovement(daniil)).toEqual({ label: "—", direction: "same" });

    const ty = shanesWatchlist.fighters[6];
    expect(ty).toMatchObject({ id: "ty-miller", rank: 7, previousRank: 7 });
    expect(watchMovement(ty)).toEqual({ label: "—", direction: "same" });

    const gable = shanesWatchlist.fighters[7];
    expect(gable).toMatchObject({
      id: "gable-steveson",
      rank: 8,
      previousRank: 1,
      status: "Concern",
      ufcRecord: "1–1",
      ufcWinStreak: "0",
      ufcFinishes: "1",
      photoUrl: "/assets/fighters/gable-steveson-thumb.webp",
    });
    expect(existsSync("public/assets/fighters/gable-steveson-thumb.webp")).toBe(true);
    expect(watchMovement(gable)).toEqual({ label: "↓7", direction: "down" });
  });

  it("keeps the Home preview to a compact top-three board", () => {
    const { container } = render(<MemoryRouter><ShanesWatchlistCard /></MemoryRouter>);

    expect(screen.getByText("SHANE KING’S CONTENDER SERIES")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fighters to Watch" })).toBeInTheDocument();
    expect(screen.getByText("Quillan Salkilld")).toBeInTheDocument();
    expect(screen.getByText("Abdul Rakhman Yakhyaev")).toBeInTheDocument();
    expect(screen.getByText("Bilal Hasan")).toBeInTheDocument();
    expect(screen.queryByText("Raul Rosas Jr.")).not.toBeInTheDocument();
    expect(screen.queryByText("Fatima Kline")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Quillan Salkilld/i })).toHaveAttribute("href", "/fighters-to-watch#quillan-salkilld");
    expect(screen.getByRole("link", { name: "VIEW FULL BOARD →" })).toHaveAttribute("href", "/fighters-to-watch");
    expect(screen.queryByText(shanesWatchlist.fighters[0].boardNote)).not.toBeInTheDocument();
    expect(container.querySelectorAll("blockquote")).toHaveLength(0);
  });

  it("renders one compact board without an open scouting report", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    const { container } = render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Shane King’s Contender Series" })).toBeInTheDocument();
    expect(screen.getByText("A living Top 15 of UFC prospects to watch as their careers develop.")).toBeInTheDocument();
    expect(screen.getByText("8 OF 15 SPOTS FILLED")).toBeInTheDocument();
    expect(screen.getByText("Gable Steveson")).toBeInTheDocument();
    expect(screen.getByText("Quillan Salkilld")).toBeInTheDocument();
    expect(screen.getByText("Bilal Hasan")).toBeInTheDocument();
    expect(screen.getByText("7 SPOTS OPEN")).toBeInTheDocument();
    expect(screen.getByText("Nobody else has earned a place on Shane’s board yet.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(container.querySelectorAll("details")).toHaveLength(0);

    const movementSummary = screen.getByLabelText("September 2026 movement summary");
    expect(within(movementSummary).getByText("NEW")).toBeInTheDocument();
    expect(within(movementSummary).getByText("MOVED")).toBeInTheDocument();
    expect(within(movementSummary).getByText("HELD")).toBeInTheDocument();
    expect(within(movementSummary).getByText("1")).toBeInTheDocument();
    expect(within(movementSummary).getByText("4")).toBeInTheDocument();
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
    expect(snapshotParagraphs.map((paragraph) => paragraph.textContent).join(" ")).toBe(shanesWatchlist.fighters[0].scoutingSnapshot);

    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.querySelector(".watchlist-scouting-overlay")).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");
    expect(window.location.hash).toBe("#quillan-salkilld");

    fireEvent.click(within(dialog).getByRole("button", { name: "Close scouting report" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(window.location.hash).toBe("");
  });

  it("keeps Bilal Hasan at #3 after adding Rosas", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Open scouting report for Bilal Hasan" }));

    const dialog = screen.getByRole("dialog", { name: "Bilal Hasan" });
    expect(within(dialog).getByText("SHANE’S RANKING · #3")).toBeInTheDocument();
    expect(within(dialog).getByText("“The IndoNinja”")).toBeInTheDocument();
    expect(within(dialog).getByText(/ended the fight with a clean right hand at 2:28 of Round 2/i)).toBeInTheDocument();
    expect(within(dialog).getByText("1–0")).toBeInTheDocument();
    expect(within(dialog).getByText("UFC RECORD")).toBeInTheDocument();
    expect(within(dialog).getAllByText("1", { selector: ".watchlist-scouting-card__stats strong" })).toHaveLength(2);
    expect(within(dialog).queryByText("PRO RECORD")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "WATCH FIGHT HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/qj6dK0cfWds?si=02KWqe1Vj2WAwbiP",
    );
  });

  it("keeps Daniil at #6 after the Soriano win and adds Ty Miller at #7", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Open scouting report for Daniil Donchenko" }));
    const daniilDialog = screen.getByRole("dialog", { name: "Daniil Donchenko" });
    expect(within(daniilDialog).getByText("SHANE’S RANKING · #6")).toBeInTheDocument();
    expect(within(daniilDialog).getByText("4–0")).toBeInTheDocument();
    expect(within(daniilDialog).getByText(/controlled Punahele Soriano over three rounds/i)).toBeInTheDocument();
    expect(within(daniilDialog).getByRole("link", { name: "WATCH FIGHT HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/bAlhi6r7X2U?si=hI6nBaMAqJAKKB5B",
    );
    fireEvent.click(within(daniilDialog).getByRole("button", { name: "Close scouting report" }));

    fireEvent.click(screen.getByRole("button", { name: "Open scouting report for Ty Miller" }));
    const tyDialog = screen.getByRole("dialog", { name: "Ty Miller" });
    expect(within(tyDialog).getByText("SHANE’S RANKING · #7")).toBeInTheDocument();
    expect(within(tyDialog).getByText("“Thriller”")).toBeInTheDocument();
    expect(within(tyDialog).getByText("2–0")).toBeInTheDocument();
    expect(within(tyDialog).getByRole("link", { name: "WATCH FIGHT HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/wodu318-nm0?si=KYM3qd6RKriviD6U",
    );
  });

  it("adds Raul Rosas Jr. at #4 with Shane’s selected Contender Series highlight", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Open scouting report for Raul Rosas Jr." }));

    const dialog = screen.getByRole("dialog", { name: "Raul Rosas Jr." });
    expect(within(dialog).getByText("SHANE’S RANKING · #4")).toBeInTheDocument();
    expect(within(dialog).getByText("“El Nino Problema”")).toBeInTheDocument();
    expect(within(dialog).getByText("6–1")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "WATCH FIGHT HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/Nf6Kb6c3uq8?si=fN5vhUPEhtkHbBto",
    );
  });


  it("uses the correct female board label on Fatima Kline's scouting report", () => {
    window.history.replaceState({}, "", "/fighters-to-watch");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Open scouting report for Fatima Kline" }));

    const dialog = screen.getByRole("dialog", { name: "Fatima Kline" });
    expect(within(dialog).getByText("SHANE’S RANKING · #5")).toBeInTheDocument();
    expect(within(dialog).getByText("WHY SHE’S ON THE BOARD")).toBeInTheDocument();
    expect(within(dialog).queryByText("WHY HE’S ON THE BOARD")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "WATCH FIGHT HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/E3Eat8_BBjM?is=69fExP5AoinR5Xdt",
    );
  });

  it("opens a Home deep link directly into Gable's post-loss scouting report", () => {
    window.history.replaceState({}, "", "/fighters-to-watch#gable-steveson");
    render(<MemoryRouter><ShanesWatchlistPage /></MemoryRouter>);

    const dialog = screen.getByRole("dialog", { name: "Gable Steveson" });
    expect(within(dialog).getByText("SHANE’S RANKING · #8")).toBeInTheDocument();
    expect(within(dialog).getByText("SCOUTING SNAPSHOT")).toBeInTheDocument();
    expect(within(dialog).getByText(/knocked him out with a left hand just 12 seconds into Round 1/i)).toBeInTheDocument();
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
