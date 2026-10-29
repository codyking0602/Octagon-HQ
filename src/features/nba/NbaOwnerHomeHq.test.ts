import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { readVerifiedNbaWeekly } from "./nbaWeeklySpotlight";
const homepage = readFileSync("src/features/home/HomePage.tsx", "utf8");
const owner = readFileSync("src/features/nba/NbaOwnerHomeHq.tsx", "utf8");
const css = readFileSync("src/styles/nba-owner-home.css", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const nav = readFileSync("src/components/BottomNavigation.tsx", "utf8");
describe("NBA HQ released regular-season presentation", () => {
  it("shows the same public NBA Daily state to owners and visitors on Home", () => {
    expect(homepage).toContain('<NbaOwnerHomeHq profileId={profileId} signedIn={signedIn} />');
    expect(homepage).toContain('<NbaOwnerHomeHq profileId={profileId} signedIn={signedIn} hideChampionship />');
    expect(homepage).not.toContain("nbaHqOwnerPreview");
    expect(owner).not.toContain("allowOwnerDailyPreview");
    expect(owner).not.toContain("nba_preview");
    expect(owner).not.toContain("OWNER PREVIEW");
    expect(owner).not.toContain("Practice · Unranked");
    expect(owner).toContain('const dailyLink = dailyEnabled ? "/nba/today" : "/nba";');
    expect(owner).not.toContain('"/nba/play"');
    expect(owner).toContain('to="/nba/picks"');
    expect(owner).toContain('to="/championship/nba"');
    expect(owner).toContain('"STARTS OCT 30"');
  });
  it("routes Home NBA Play and Picks to registered pages, including prelaunch", () => {
    expect(owner).toContain('const dailyLink = dailyEnabled ? "/nba/today" : "/nba";');
    expect(owner).toContain('<Link to={dailyLink} className="nba-hq-owner__daily"');
    expect(owner).toContain('<Link to="/nba/picks">VIEW PICKS');
    expect(owner).toContain('to="/championship/nba"');
    expect(router).toContain('path: "nba", element: <NbaPreviewGate><NbaPlayPage /></NbaPreviewGate>');
    expect(router).toContain('path: "nba/today", element: <NbaPreviewGate><NbaOfficialDailyPage /></NbaPreviewGate>');
    expect(router).toContain('path: "nba/picks", element: <NbaPreviewGate><NbaFuturesPage /></NbaPreviewGate>');
    expect(nav).toContain('playSport === "football" ? "/football" : playSport === "nba" ? "/nba" : "/play"');
    expect(nav).toContain('currentPicksSport === "football" ? "/football/picks" : currentPicksSport === "nba" ? "/nba/picks" : "/picks"');
    expect(owner).not.toContain('"/nba/play"');
  });
  it("shows NBA's unlocked rank and canonical completed score like UFC, never a made-up rank", () => {
    expect(homepage).toContain('const rank = todayRank(leaderboard);');
    expect(owner).toContain('dailyOverview.leaderboard?.unlocked');
    expect(owner).toContain('entry.isCurrentUser');
    expect(owner).toContain('ownLeaderboardEntry?.rank ?? null');
    expect(owner).toContain('dailyOfficialDisplayScore(daily.projection, ownLeaderboardEntry?.normalizedScore)');
    expect(owner).toContain('rank != null ? `#${rank} today` : "Official score locked"');
    expect(owner).toContain('enabled: signedIn && dailyEnabled, sport: "nba"');
    expect(owner).toContain('enabled: signedIn && dailyEnabled,');
    expect(owner).toContain('FUTURES PICKS');
  });
  it("opens Cup picks while keeping rehearsal off the public Home and Playoff picks scheduled", () => {
    expect(owner).not.toContain("NBA_OFFICIAL_GAMES_RELEASE_READY");
    expect(owner).not.toContain("nbaOwnerPreviewDaily");
    expect(owner).toContain('sport: "nba"');
    expect(owner).toContain('to="/nba/picks"');
    expect(owner).toContain('to="/championship/nba"');
    expect(owner).toContain("CUP PICKS OPEN · PLAYOFF PICKS IN APRIL");
    expect(owner).toContain("nbaCanAccessReleasedGames(day)");
  });
  it("uses verified weekly data rather than placeholder numbers or fake videos", () => {
    expect(owner).toContain("readVerifiedNbaWeekly(raw)");
    expect(owner).toContain("weekly.player.highlightUrl");
    expect(owner).toContain("weekly.team.record");
    expect(css).toContain(".nba-hq-owner__championship");
  });
});
describe("NBA weekly feed safety", () => {
  const valid = {
    weekStart:"2026-10-19", weekEnd:"2026-10-25", publishedAt:"2026-10-27T13:00:00Z",
    player: {name:"Example Player",team:"Example Team",position:"PG",gamesPlayed:2,
      headshotUrl:"https://a.espncdn.com/i/headshots/nba/players/full/1.png",
      profileUrl:"https://www.basketball-reference.com/players/e/example01.html",
      highlightUrl:"https://www.youtube.com/watch?v=ABCdefghi12",
      highlightSourceChannelId:"UCWJ2lWNubArHWmf3FIHbfcQ",
      channelUrl:"https://www.youtube.com/@NBA",
      stats:[{label:"PPG",value:"30"},{label:"APG",value:"7"},{label:"RPG",value:"4"},{label:"FG%",value:"52"}]},
    team: {name:"Example Team",teamId:"OKC",logoUrl:"https://a.espncdn.com/i/teamlogos/nba/500/okc.png",
      profileUrl:"https://www.basketball-reference.com/teams/OKC/2027.html",record:"3-0",ppg:"120",oppPpg:"105",netMargin:"+15"},
  };
  it("rejects absent data, fake photos and non-YouTube highlights", () => {
    expect(readVerifiedNbaWeekly(null)).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,player:{...valid.player,gamesPlayed:0}})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,player:{...valid.player,gamesPlayed:2.5}})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,player:{...valid.player,gamesPlayed:undefined}})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,player:{...valid.player,highlightUrl:"https://example.com/fake"}})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,player:{...valid.player,highlightSourceChannelId:"UCVSSpcmZD2PwPBqb8yKQKBA"}})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,team:{...valid.team,logoUrl:"https://example.com/fake"}})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,team:{...valid.team,profileUrl:"https://www.espn.com/nba/team/_/name/okc"}})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,team:{...valid.team,profileUrl:"https://www.basketball-reference.com/teams/OKC/2026.html"}})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,player:{...valid.player,profileUrl:"https://www.espn.com/nba/player/_/id/1"}})).toBeNull();
  });
  it("supports a verified current owner-approved spotlight with no fabricated video", () => {
    const player={...valid.player,highlightUrl:null,highlightSourceChannelId:undefined};
    expect(readVerifiedNbaWeekly({...valid,publishedAt:"2026-10-24T00:00:00Z",player})?.player.name).toBe("Example Player");
    expect(readVerifiedNbaWeekly({...valid,publishedAt:"2026-10-24T00:00:00Z",player:{...player,channelUrl:"https://example.com"}})).toBeNull();
    expect(owner).toContain("weekly.player.highlightUrl ? \"WATCH HIGHLIGHT ↗\" : \"NBA CHANNEL ↗\"");
    expect(owner).not.toContain("weekly.team.highlightUrl");
    expect(owner).not.toContain("weekly.player.summary");
    expect(owner).not.toContain("weekly.team.summary");
    expect(owner).not.toContain('<b aria-hidden="true">›</b>');
  });
  it("accepts valid completed editorial packages only after their publication timestamp", () => {
    expect(readVerifiedNbaWeekly({...valid,publishedAt:"2999-10-27T13:00:00Z"})).toBeNull();
    expect(readVerifiedNbaWeekly({...valid,publishedAt:"2026-10-24T00:00:00Z"})?.team.name).toBe("Example Team");
  });
});

describe("locked NBA / Football Spotlight presentation parity", () => {
  const footballCss = readFileSync("src/styles/home-football-hq.css", "utf8");
  const locked = css.slice(css.indexOf("/* Permanent NBA Spotlight presentation"));
  it("uses Football's full-height cover portrait, photo gradient and two-color bottom strip", () => {
    expect(footballCss).toContain("object-fit: cover;");
    expect(footballCss).toContain("object-position: 50% 35%;");
    expect(locked).toContain("object-fit: cover;");
    expect(locked).toContain("object-position: 50% 35%;");
    expect(locked).toContain("min-height: 176px;");
    expect(locked).toContain("transparent 58%, rgba(7, 11, 15, .9)");
    expect(locked).toContain("linear-gradient(90deg, var(--nba-player-secondary");
    expect(locked).not.toContain("object-fit: contain;");
  });
  it("reuses Football's neutral card, gold Lakers raised CTA and mobile-safe framing", () => {
    expect(locked).toContain("linear-gradient(135deg, #07111a, #090b0f 66%)");
    expect(locked).toContain("box-shadow: inset 0 -3px 0");
    expect(locked).toContain("@media (max-width: 430px)");
    expect(owner).toContain('playerTeamId === "LAL" ? "#552583"');
    expect(owner).toContain('playerTeamId === "LAL" ? "#b4932b"');
  });
  it("keeps NBA weekly averages while moving season context beside the team name", () => {
    expect(owner).toContain("nbaSpotlightWeekLabel(weekly.weekStart, weekly.weekEnd)");
    expect(owner).toContain("weekly.player.gamesPlayed");
    expect(owner).toContain("WEEKLY AVG");
    expect(owner).toContain("nba-hq-owner__team-identity");
    expect(owner).toContain("nba-hq-owner__team-standing");
    expect(owner).toContain("{weekly.team.record} THIS WEEK");
    expect(owner).not.toContain("AS OF");
    expect(owner).not.toContain("{weekly.team.seasonRecord} SEASON");
    expect(locked).toContain("flex-wrap: wrap;");
  });
});
