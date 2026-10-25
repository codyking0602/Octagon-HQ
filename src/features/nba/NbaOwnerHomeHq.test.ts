import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { readVerifiedNbaWeekly } from "./nbaWeeklySpotlight";
const homepage = readFileSync("src/features/home/HomePage.tsx", "utf8");
const owner = readFileSync("src/features/nba/NbaOwnerHomeHq.tsx", "utf8");
const css = readFileSync("src/styles/nba-owner-home.css", "utf8");
describe("NBA HQ owner-only regular-season proposal", () => {
  it("shares the Basketball Home design while keeping owner daily testing gated", () => {
    expect(homepage).toContain('const nbaHqOwnerPreview = Boolean(identity.profile?.canControlPicks === true');
    expect(homepage).toContain('&& identity.profile.displayName.trim().toUpperCase() === "CODY");');
    expect(homepage).toContain('<NbaOwnerHomeHq profileId={profileId} allowOwnerDailyPreview={nbaHqOwnerPreview} />');
    expect(owner).toContain("allowOwnerDailyPreview && !publishedDaily");
  });
  it("does not expose future Cup or Playoff picks or bypass official game launch", () => {
    expect(owner).toContain("NBA_OFFICIAL_GAMES_RELEASE_READY");
    expect(owner).toContain("nbaOwnerPreviewDaily");
    expect(owner).toContain('sport: publishedDaily ? "nba" : "nba_preview"');
    expect(owner).toContain('to="/nba/picks"');
    expect(owner).toContain('to="/championship/nba"');
    expect(owner).toContain("CUP AND PLAYOFF PICKS WILL APPEAR WHEN RELEASED");
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
