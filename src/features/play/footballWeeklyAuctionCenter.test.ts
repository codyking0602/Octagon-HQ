import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/back-room/FootballWeeklyAuctionCenterPage.tsx", "utf8");
const repository = readFileSync("src/features/play/footballWeeklyAuctionRepository.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/202612310163_football_weekly_auction_history.sql",
  "utf8",
);
const cfbGate = readFileSync("src/features/back-room/FootballWeeklyAuctionGate.tsx", "utf8");
const buildQbGate = readFileSync("src/features/back-room/FootballWeeklyBuildQbGate.tsx", "utf8");
const buildQbTable = readFileSync("src/features/back-room/FootballWeeklyBuildQbTableDialog.tsx", "utf8");
const buildQbStyles = readFileSync("src/styles/football-weekly-build-qb.css", "utf8");

describe("Football Weekly Auction Center and archive", () => {
  it("keeps every completed signed-in result reopenable newest first", () => {
    expect(repository).toContain("loadHistory(): Promise<FootballWeeklyFinal[]>");
    expect(repository).toContain('get_my_football_weekly_auction_history');
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("private.football_weekly_auction_results result");
    expect(migration).toContain("where result.profile_id = v_profile");
    expect(migration).toContain("private.football_weekly_auction_final_payload(result.week_start, v_profile)");
    expect(migration).toContain("order by result.week_start desc");
    expect(migration).toContain("grant execute on function public.get_my_football_weekly_auction_history()");
  });

  it("uses one Auction Center for the live week and the full result history", () => {
    expect(center).toContain("AUCTION CENTER");
    expect(center).toContain("THIS WEEK");
    expect(center).toContain("RESULTS");
    expect(center).toContain("repository.loadHistory()");
    expect(center).toContain('navigate("/football/today?weekly=edit")');
    expect(center).toContain("<FootballWeeklyAuctionFinalResult");
    expect(center).toContain("<FootballWeeklyBuildQbFinalResult");
    expect(center).toContain("showNewWeekAction={false}");
    expect(center).toContain("← ALL RESULTS");
  });

  it("reuses the approved final-result presentations without replaying acknowledgement", () => {
    expect(cfbGate).toContain("showNewWeekAction = true");
    expect(cfbGate).toContain("{showNewWeekAction ? (");
    expect(buildQbGate).toContain("showNewWeekAction = true");
    expect(buildQbGate).toContain("{showNewWeekAction ? (");
  });

  it("keeps the Build a QB roster summary and daily bidding note compact", () => {
    expect(buildQbGate).toContain("compactQuarterbackSlotName(item.display_name, collectionNames)");
    expect(buildQbGate).toContain('passUsed ? "PASS USED" : "FREE PASS"');
    expect(buildQbGate).not.toContain("PASS USED · $1 MIN");
    expect(buildQbGate).not.toContain("LOCKED IN");
    expect(buildQbGate).toContain('"--weekly-qb-rgb": identity.primaryRgb');
    expect(buildQbStyles).toContain("border-color: rgba(var(--weekly-qb-rgb), .72);");
    expect(buildQbStyles).toContain("white-space: normal;");
    expect(buildQbGate).toContain("<span>Bids lock at midnight CT</span>");
    expect(buildQbGate).toContain("<span>$0 bid = pass</span>");
    expect(buildQbGate).not.toContain("results reveal at midnight CT");
  });

  it("adds explicit Back controls to both full-height Build a QB reference sheets", () => {
    expect(buildQbGate).toContain('aria-label="Back to Build a QB"');
    expect(buildQbGate).toContain("← BACK");
    expect(buildQbTable).toContain('aria-label="Back to Build a QB"');
    expect(buildQbTable).toContain("← BACK");
    expect(buildQbStyles).toContain(".football-weekly-build-qb__sheet-back");
    expect(buildQbStyles).toContain("height: calc(100dvh - 58px - var(--safe-top));");
  });
});
