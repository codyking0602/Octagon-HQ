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

  it("leaves prior Auction final standings and full reveal in the archived Auction Center", () => {
    expect(center).toContain("repository.loadHistory()");
    expect(center).toContain("<FootballWeeklyNflTeamSeasonFinalResult");
    expect(center).toContain("← ALL RESULTS");
    expect(gmPage).toContain("PAST GM CHAMPIONSHIPS");
    expect(gmPage).toContain("repository.archivedResult");
    expect(gmPage).not.toContain("FINAL AUCTION RESULTS");
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
