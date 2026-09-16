import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footballPlay = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const footballToday = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const styles = readFileSync("src/styles/play-landing-shared.css", "utf8");

describe("Football Weekly Auction Play quick access", () => {
  it("keeps a compact edit-bids control on the Football Play landing after today's auction is submitted", () => {
    expect(footballPlay).toContain("FootballWeeklyAuctionQuickAccess");
    expect(footballPlay).toContain("next.available && next.submitted_today && !next.previous_final");
    expect(footballPlay).toContain("WEEKLY AUCTION");
    expect(footballPlay).toContain("EDIT BIDS");
    expect(footballPlay).toContain('navigate("/football/today?weekly=edit")');
    expect(footballPlay).toContain('state.owned_count');
    expect(footballPlay).toContain('state.bankroll');
  });

  it("opens the submitted Weekly Auction board directly instead of making the player reopen the Daily first", () => {
    expect(footballToday).toContain("useSearchParams");
    expect(footballToday).toContain('searchParams.get("weekly") === "edit"');
    expect(footballToday).toContain("!nextWeekly.submitted_today || editWeeklyAuction");
    expect(footballToday).toContain("setShowWeeklyAuction(true)");
  });

  it("uses the established Football accent and stays compact on phones", () => {
    expect(styles).toContain(".football-weekly-auction-quick");
    expect(styles).toContain("var(--football-accent)");
    expect(styles).toContain("@media (max-width: 390px)");
  });
});
