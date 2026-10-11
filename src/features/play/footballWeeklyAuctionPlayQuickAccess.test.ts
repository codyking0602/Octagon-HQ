import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footballPlay = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const footballToday = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const playV2 = readFileSync("src/features/play/PlayV2Page.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const styles = readFileSync("src/styles/play-v2.css", "utf8");

describe("Football Weekly Auction Play quick access", () => {
  it("rotates the approved Weekly Featured Play 2.0 card between GM and Auction without layout changes", () => {
    expect(footballPlay).toContain('<PlayV2Page sport="football" />');
    expect(playV2).toContain("<WeeklyCurrent />");
    expect(playV2).toContain("WEEKLY FEATURED");
    expect(playV2).toContain("Auction Center");
    expect(playV2).toContain('"/football/weekly-gm" : "/football/weekly-auction"');
    expect(playV2).toContain('to="/championship/football?tab=play"');
    expect(playV2).not.toContain("EDIT BIDS");
    expect(playV2).not.toContain("previous_final");
  });

  it("routes Auction Center separately while preserving direct edit access to the submitted board", () => {
    expect(router).toContain('path: "football/weekly-auction"');
    expect(router).toContain("<FootballWeeklyAuctionCenterPage />");
    expect(footballToday).toContain("useSearchParams");
    expect(footballToday).toContain('searchParams.get("weekly") === "edit"');
    expect(footballToday).toContain("!nextWeekly.submitted_today || editWeeklyAuction");
    expect(footballToday).toContain("setShowWeeklyAuction(true)");
  });

  it("keeps the approved Football Weekly Featured treatment compact on phones", () => {
    expect(styles).toContain(".play-v2__weekly");
    expect(styles).toContain(".play-v2__weekly-actions");
    expect(styles).toContain(".play-v2[data-sport=\"football\"]");
    expect(styles).toContain("@media (max-width: 380px)");
  });
});
