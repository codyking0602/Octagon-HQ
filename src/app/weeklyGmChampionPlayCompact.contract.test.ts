import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612310401_weekly_gm_championship_history.sql", "utf8");
const gm = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
const repo = readFileSync("src/features/back-room/footballWeeklyGmRepository.ts", "utf8");
const play = readFileSync("src/features/play/PlayV2Page.tsx", "utf8");
const announcement = readFileSync("src/features/play/WeeklyGmChampionAnnouncement.tsx", "utf8");
const auction = readFileSync("src/features/back-room/FootballWeeklyAuctionCenterPage.tsx", "utf8");
const styles = readFileSync("src/styles/play-v2.css", "utf8");

describe("weekly GM champions, archive and compact Play", () => {
  it("reads only closed and complete real GM scores rather than inventing prior winners", () => {
    expect(migration).toContain("event.closes_at <= now()");
    expect(migration).toContain("having count(distinct attempt.scenario) = 2");
    expect(migration).toContain("rank() over (order by scored.total_score desc)");
    expect(migration).toContain("football_weekly_auction_is_reserved_test_profile");
    expect(migration).toContain("authenticated");
    expect(migration).toContain("attempt.week_start = p_week_start");
    expect(repo).toContain('get_football_weekly_gm_history');
    expect(repo).toContain('get_football_weekly_gm_archived_result');
  });
  it("offers real prior GM history and clickable individual franchise reports", () => {
    expect(gm).toContain("PAST WEEKLY GM CHAMPIONSHIPS");
    expect(gm).toContain("archive?.standings");
    expect(gm).toContain("repository.archivedResult");
    expect(gm).toContain("FootballGmFranchiseReport");
    expect(gm).not.toContain("VIEW PRIOR AUCTION RESULTS");
  });
  it("announces the previous champion once per member and completed week", () => {
    expect(announcement).toContain('SEEN_PREFIX + profileId + ":" + latest.week_start');
    expect(announcement).toContain("latest.champions.length === 0");
    expect(announcement).toContain("VIEW CHAMPIONSHIP RESULTS");
    expect(play).toContain("<WeeklyGmChampionAnnouncement");
  });
  it("keeps Auction Center history, without the owner QA cards", () => {
    expect(auction).toContain("repository.loadHistory()");
    expect(auction).not.toContain("WEEKLY AUCTION PLAYTHROUGH LAB");
    expect(auction).not.toContain("BEST NFL TEAM-SEASONS PLAYTHROUGH");
  });
  it("moves shorter performance below the Game Room and uses actual Daily wins", () => {
    expect(play.indexOf("<GameRoom sport={sport} />")).toBeLessThan(play.indexOf("<PerformancePreview sport={sport} profileId={profileId} />"));
    expect(play).toContain("entry.isCurrentUser)?.wins");
    expect(play).toContain("DAILY WINS");
    expect(play).not.toContain("PERSONAL BEST");
    expect(styles).toContain(".play-v2__performance .play-v2__metrics > div");
  });
  it("shows actionable challenge badges and anchors Home to the right Play section", () => {
    expect(play).toContain('id="challenge-center"');
    expect(play).toContain('location.hash !== "#challenge-center"');
    expect(play).toContain("scrollIntoView");
    expect(play).toContain("YOUR TURN");
    expect(play).toContain("challenge.expiresAt");
  });
});
