import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footballPlay = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const footballToday = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const styles = readFileSync("src/styles/play-landing-shared.css", "utf8");

describe("Football Weekly Auction Play quick access", () => {
  it("uses the existing compact Play card as the permanent Auction Center entry", () => {
    expect(footballPlay).toContain("FootballWeeklyAuctionQuickAccess");
    expect(footballPlay).toContain("repository.loadHistory()");
    expect(footballPlay).toContain("historyCount");
    expect(footballPlay).toContain("WEEKLY AUCTION");
    expect(footballPlay).toContain("AUCTION CENTER");
    expect(footballPlay).not.toContain("<strong>EDIT BIDS</strong>");
    expect(footballPlay).toContain('navigate("/football/weekly-auction")');
    expect(footballPlay).toContain("state.owned_count");
    expect(footballPlay).toContain("state.bankroll");
    expect(footballPlay).not.toContain("!next.previous_final");
  });

  it("routes Auction Center separately while preserving direct edit access to the submitted board", () => {
    expect(router).toContain('path: "football/weekly-auction"');
    expect(router).toContain("<FootballWeeklyAuctionCenterPage />");
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
