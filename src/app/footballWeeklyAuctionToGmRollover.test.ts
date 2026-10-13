import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const router = readFileSync("src/app/router.tsx", "utf8");
const center = readFileSync("src/features/back-room/FootballWeeklyAuctionCenterPage.tsx", "utf8");
const gmPage = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
const auctionFinal = readFileSync("src/features/back-room/FootballWeeklyNflTeamSeasonGate.tsx", "utf8");

describe("October 13 Football Weekly Auction to GM rollover", () => {
  it("preserves access to the completed Auction archive during the GM featured week", () => {
    expect(router).toContain('{ path: "football/weekly-auction", element: <FootballWeeklyAuctionCenterPage /> }');
    expect(router).not.toContain('Navigate to="/football/weekly-gm" replace /> : <FootballWeeklyAuctionCenterPage />');
    expect(center).toContain('const [tab, setTab] = useState<CenterTab>(gmWeek ? "results" : "week")');
    expect(center).toContain('setHistory(nextHistory)');
    expect(center).toContain('setSelectedResult(result)');
    expect(center).toContain('OPEN WEEKLY GM');
    expect(center).toContain('FootballWeeklyNflTeamSeasonFinalResult');
  });

  it("presents finalized Auction standings and the full reveal before Weekly GM", () => {
    expect(gmPage).toContain('const LAST_AUCTION_WEEK = "2026-10-06"');
    expect(gmPage).toContain('auctionRepository.loadHistory()');
    expect(gmPage).toContain('showAuctionReveal && lastAuction');
    expect(gmPage).toContain('FINAL AUCTION RESULTS');
    expect(gmPage).toContain('FootballWeeklyNflTeamSeasonFinalResult');
    expect(gmPage).toContain('CONTINUE TO THIS WEEK\'S GM');
    expect(gmPage).toContain('VIEW OCT 6–12 AUCTION RESULTS');
  });

  it("reveals past Wildcard wheel and the collections and grades even after week rollover", () => {
    expect(auctionFinal).toContain('Standings</button>');
    expect(auctionFinal).toContain('Collections</button>');
    expect(auctionFinal).toContain('All Grades</button>');
    expect(auctionFinal).toContain('result.final_collections.filter');
    expect(auctionFinal).toContain('result.all_teams.map');
    expect(auctionFinal).toContain('open={!showNewWeekAction}');
    expect(auctionFinal).toContain('<WheelResult wildcard={result.wildcard} />');
  });
});
