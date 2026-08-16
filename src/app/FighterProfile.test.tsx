import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "./providers";
import { appRoutes } from "./router";
import { categoryBoard } from "../features/rankings/rankingControls";
import { categoryDisplayRating } from "../features/rankings/rankingDisplay";
import { allTime, getFighter } from "../features/rankings/rankingModel";
import { categoryBarFillPercent, profileCategories, profileCategoryRows, tierForRating } from "../features/rankings/profilePresentation";
import { profileCopy, whyNotProfileCopy } from "../features/rankings/FighterProfilePage";
import { resolveProfileWatchAction } from "../features/rankings/rankingPresentation";

afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

describe("V1-style fighter profile restoration", () => {
  it("puts only the OVR badge over the photo and summary content below it", async () => {
    renderRoute("/fighters/jon-jones");
    expect(await screen.findByRole("heading", { name: "Jon “Bones” Jones" })).toBeInTheDocument();
    const photo = screen.getByLabelText("Jon Jones photo");
    expect(within(photo).getByTestId("photo-ovr-badge")).toHaveTextContent("OVR");
    expect(within(photo).queryByText("Jon Jones")).not.toBeInTheDocument();
    expect(within(photo).queryByText("#1 UFC All-Time")).not.toBeInTheDocument();

    const summary = screen.getByLabelText("Fighter summary");
    expect(summary).toHaveTextContent("#1 UFC All-Time");
    expect(summary).toHaveTextContent("LHW / HW");
    expect(summary).toHaveTextContent("Jon “Bones” Jones");
    expect(summary).not.toHaveTextContent("OVR");
    expect(summary).not.toHaveTextContent("Model");
  });

  it("renders the exact compact Resume Snapshot values from calculated fields", async () => {
    renderRoute("/fighters/jon-jones");
    const resume = await screen.findByRole("heading", { name: "Resume Snapshot" });
    const card = resume.closest("section")!;
    ["UFC Record", "Longest UFC Win Streak", "UFC Title-Fight Wins", "Top-5 Wins", "Finish Rate", "Prime UFC Record", "Rounds Won", "Active Elite Years"].forEach((label) => {
      expect(within(card).getByText(label)).toBeInTheDocument();
    });
    expect(within(card).getByText("22-1, 1 NC")).toBeInTheDocument();
    expect(within(card).getByText("13")).toBeInTheDocument();
    expect(within(card).getByText("Longest UFC Win Streak")).toBeInTheDocument();
    expect(within(card).queryByText("UFC All-Time Rank")).not.toBeInTheDocument();
  });

  it("renders five V1 category cards with fixed tier thresholds and separated bar math", async () => {
    renderRoute("/fighters/matt-hughes");
    expect(await screen.findByRole("heading", { name: "Matt Hughes" })).toBeInTheDocument();
    ["Championship Resume", "Quality Wins", "Prime Dominance", "Elite Longevity", "Peak Apex", "Loss Context"].forEach((label) => {
      expect(screen.getByRole("button", { name: new RegExp(label) })).toBeInTheDocument();
    });
    expect(tierForRating(97)).toBe("Legendary");
    expect(tierForRating(90)).toBe("Elite");
    expect(tierForRating(85)).toBe("Great");
    expect(tierForRating(80)).toBe("Good");
    expect(tierForRating(79)).toBe("Average");
    expect(categoryBarFillPercent(33, 65)).toBe(55);
    expect(categoryBarFillPercent(49, 65)).toBeLessThan(40);
    expect(screen.queryByText("PCTL")).not.toBeInTheDocument();
    expect(screen.getAllByText("Rating").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /49Rating#10/ })).not.toBeInTheDocument();
  });

  it("expands only one category explanation at a time", async () => {
    renderRoute("/fighters/jon-jones");
    expect(await screen.findByRole("heading", { name: "Jon “Bones” Jones" })).toBeInTheDocument();
    expect(screen.getByTestId("category-expanded")).toHaveTextContent("Championship Resume");
    fireEvent.click(screen.getByRole("button", { name: /Quality Wins/ }));
    expect(screen.getByTestId("category-expanded")).toHaveTextContent("Quality Wins");
    expect(screen.getByTestId("category-expanded")).not.toHaveTextContent("Championship Resume ·");
  });

  it("renders V1 why cards and omits hidden legacy/raw mechanics", async () => {
    renderRoute("/fighters/jon-jones");
    expect(await screen.findByRole("heading", { name: "Why Ranked Here" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Why Not Lower?" })).toBeInTheDocument();
    ["Key Judgment Calls", "Final Takeaway", "Title Context", "Quality Wins table", "Round Control table", "Era and Division Context", "raw model score", "division multiplier", "Peak Apex bonus"].forEach((copy) => {
      expect(screen.queryByText(copy, { exact: false })).not.toBeInTheDocument();
    });

    renderRoute("/fighters/matt-hughes");
    expect(await screen.findByRole("heading", { name: "Why Not Ranked Higher?" })).toBeInTheDocument();
  });

  it("calculates longest UFC win streaks from the full ledger", () => {
    expect(getFighter("georges-st-pierre")!.longestUfcWinStreak).toBe(13);
    expect(getFighter("jon-jones")!.longestUfcWinStreak).toBe(13);
    expect(getFighter("kamaru-usman")!.longestUfcWinStreak).toBe(15);
    expect(getFighter("khabib-nurmagomedov")!.longestUfcWinStreak).toBe(13);
    expect(getFighter("brock-lesnar")!.longestUfcWinStreak).toBe(4);
  });

  it("has no accented Resume wording on the public profile", async () => {
    renderRoute("/fighters/jon-jones");
    expect(await screen.findByRole("heading", { name: "Resume Snapshot" })).toBeInTheDocument();
    expect(screen.queryByText(/Résumé|résumé/)).not.toBeInTheDocument();
  });

  it("shares from the boxed profile action with native and clipboard fallbacks", async () => {
    const originalShare = navigator.share;
    const originalClipboard = navigator.clipboard;
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    renderRoute("/fighters/jon-jones");
    fireEvent.click(await screen.findByRole("button", { name: "Share" }));
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: "Jon “Bones” Jones · Octagon HQ",
      url: expect.stringMatching(/^http:\/\/localhost:3000\/fighters\/jon-jones\?share=/),
    }));
    cleanup();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderRoute("/fighters/jon-jones");
    fireEvent.click(await screen.findByRole("button", { name: "Share" }));
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(
      /^http:\/\/localhost:3000\/fighters\/jon-jones\?share=/,
    ));
    Object.defineProperty(navigator, "share", { configurable: true, value: originalShare });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: originalClipboard });
  });

  it("keeps profile actions and route lazy loading intact", async () => {
    renderRoute("/fighters/matt-hughes");
    expect(await screen.findByRole("heading", { name: "Matt Hughes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Watch Signature Fight" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("button", { name: "Compare" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask Why" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Share Matt Hughes profile" })).not.toBeInTheDocument();
  });
});


describe("profile category polish", () => {
  it("resolves stale hardcoded rank copy from the current rank", () => {
    expect(profileCopy("Usman ranks #10 because the resume travels.", 9)).toBe("Usman ranks here because the resume travels.");
    expect(profileCopy("Usman ranks #{rank} because he has 5 title wins in 2021.", 9)).toBe("Usman ranks #9 because he has 5 title wins in 2021.");
  });

  it("uses the category leaderboard owner for profile ratings and ranks", () => {
    const fighter = getFighter("matt-hughes")!;
    const row = profileCategoryRows(fighter).find((category) => category.key === "primeDominance")!;
    const board = categoryBoard("men", "primeDominance");
    expect(row.rank).toBe(board.findIndex((candidate) => candidate.slug === fighter.slug) + 1);
    expect(row.rating).toBe(categoryDisplayRating("men", "primeDominance", fighter));
    expect(row.rank).toBe(10);
    expect(row.rating).toBeGreaterThanOrEqual(90);
    expect(row.tier).toBe("Elite");
  });

  it("renders approved tile counts and special inline nicknames", async () => {
    renderRoute("/fighters/israel-adesanya");
    expect(await screen.findByRole("heading", { name: "Israel “The Last Stylebender” Adesanya" })).toBeInTheDocument();
    cleanup();
    renderRoute("/fighters/kamaru-usman");
    expect(await screen.findByRole("heading", { name: "Kamaru “The Nigerian Nightmare” Usman" })).toBeInTheDocument();
    cleanup();
    renderRoute("/fighters/georges-st-pierre");
    expect(await screen.findByRole("heading", { name: "Georges “Rush” St-Pierre" })).toBeInTheDocument();
    cleanup();
    renderRoute("/fighters/stipe-miocic");
    expect(await screen.findByRole("heading", { name: "Stipe Miocic" })).toBeInTheDocument();
    cleanup();
    renderRoute("/fighters/israel-adesanya");

    const expectedCounts = [
      ["Championship Resume", 2],
      ["Quality Wins", 2],
      ["Prime Dominance", 4],
      ["Elite Longevity", 2],
      ["Peak Apex", 2],
      ["Loss Context", 2],
    ] as const;

    for (const [label, count] of expectedCounts) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }));
      expect(within(screen.getByTestId("category-expanded")).getAllByTestId("evidence-tile")).toHaveLength(count);
    }

    renderRoute("/fighters/charles-oliveira");
    expect(await screen.findByRole("heading", { name: "Charles “Do Bronx” Oliveira" })).toBeInTheDocument();
  });
});

describe("profile category and loss audits", () => {
  it("validates category ownership for every profile category and ranked fighter", () => {
    for (const fighter of allTime) {
      const rows = profileCategoryRows(fighter);
      expect(rows).toHaveLength(profileCategories.length);
      for (const row of rows) {
        const gender = fighter.board === "women" ? "women" : "men";
        const board = categoryBoard(gender, row.key);
        expect(board.map((candidate) => candidate.slug)).toContain(fighter.slug);
        expect(row.rank).toBeGreaterThan(0);
        expect(row.rank).toBe(board.findIndex((candidate) => candidate.slug === fighter.slug) + 1);
        expect(row.rating).toBe(categoryDisplayRating(gender, row.key, fighter));
        expect(row.tier).toBe(tierForRating(row.rating));
        expect(row.barFillPercent).toBe(categoryBarFillPercent(row.rank, board.length));
        expect(row.rating).toBeGreaterThanOrEqual(55);
        expect(row.rating).toBeLessThanOrEqual(99);
        expect(row.barFillPercent).toBeGreaterThanOrEqual(10);
        expect(row.barFillPercent).toBeLessThanOrEqual(100);
        expect(Number.isNaN(row.rating)).toBe(false);
        expect(Number.isNaN(row.barFillPercent)).toBe(false);
      }
    }
  });

  it("keeps public loss tiles backed by canonical penalty trace classifications", () => {
    const usman = getFighter("kamaru-usman")!;
    expect(usman.profileEvidence.primeLosses).toContain("Leon Edwards ×2");
    expect(usman.profileEvidence.primeLosses).not.toContain("Khamzat Chimaev");
    expect(usman.profileEvidence.postPrimeLosses).toBe(1);

    const gsp = getFighter("georges-st-pierre")!;
    const gspLosses = gsp.traces.penalty.events.map((event) => [event.opponent, event.phase, event.qualityTier, event.finished, event.rawPenalty]);
    expect(gspLosses).toEqual(expect.arrayContaining([
      ["Matt Hughes", "pre-prime", "champion-level", true, -1.5],
      ["Matt Serra", "prime", "solid", true, -4.75],
    ]));

    const jones = getFighter("jon-jones")!;
    const hamill = jones.traces.penalty.events.find((event) => event.opponent === "Matt Hamill")!;
    expect(hamill.technicalException).toBe(true);
    expect(hamill.penaltyEligible).toBe(false);
    expect(jones.profileEvidence.primeLosses).toBe("None");

    const volk = getFighter("alexander-volkanovski")!;
    const islamLosses = volk.traces.penalty.events.filter((event) => event.opponent === "Islam Makhachev");
    expect(islamLosses).toHaveLength(2);
    expect(islamLosses.every((event) => event.upwardDivision)).toBe(true);

    const silva = getFighter("anderson-silva")!;
    const weidmanLosses = silva.traces.penalty.events.filter((event) => event.opponent === "Chris Weidman");
    expect(weidmanLosses.every((event) => event.phase === "prime")).toBe(true);
    expect(silva.traces.penalty.events.some((event) => event.phase === "post-prime")).toBe(true);
  });

  it("orders Best UFC Wins by opponent-quality trace credit instead of chronological ledger order", () => {
    const adesanya = getFighter("israel-adesanya")!;
    const bestWins = adesanya.profileEvidence.bestUfcWins;
    const firstLedgerTopFiveWin = "Derek Brunson";
    expect(bestWins.split(", ")[0]).not.toBe(firstLedgerTopFiveWin);
    expect(bestWins).toContain("Robert Whittaker");
  });
});

describe("final profile correctness pass", () => {
  it("uses canonical #1 why-not copy", () => {
    const jon = getFighter("jon-jones")!;
    expect(whyNotProfileCopy(jon)).toBe(jon.whyNotHigher);
    const amanda = getFighter("amanda-nunes")!;
    expect(whyNotProfileCopy({ ...amanda, rank: 1 })).toBe(amanda.whyNotHigher);
  });

  it("has no unresolved stale rank phrases after profile copy rendering", () => {
    const stale = /\b(ranks|ranked) #\d+\b|\bsits (?:at )?#\d+\b|\bthe #\d+ fighter\b|\bcurrently #\d+\b|\bat #\d+\b|\bnumber \d+\b|\bNo\. \d+\b/i;
    for (const fighter of allTime) {
      [fighter.oneLiner, fighter.whyRankedHere, fighter.whyNotHigher].forEach((copy) => {
        expect(profileCopy(copy, fighter.rank), `${fighter.slug}: ${copy}`).not.toMatch(stale);
      });
    }
    expect(profileCopy("Ranked #{rank} with 7 title wins in 2020", 4)).toBe("Ranked #4 with 7 title wins in 2020");
  });

  it("resolves honest watch destinations for every fighter", () => {
    const actions = allTime.map((fighter) => resolveProfileWatchAction(fighter.slug));
    expect(actions.filter((action) => action?.source === "signature")).toHaveLength(allTime.length - 1);
    expect(actions.filter((action) => action?.source === "watch-moment")).toHaveLength(1);
    expect(actions.filter((action) => action === null)).toHaveLength(0);
  });
});
