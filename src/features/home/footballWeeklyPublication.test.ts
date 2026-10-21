import { describe, expect, it } from "vitest";
import type { PickEvent } from "../picks/picksModel";
import type { FootballMatchupBreakdown } from "../picks/footballMatchupBreakdowns";
import {
  footballPublishedSpotlight,
  mergeFootballWeeklyMatchupBreakdowns,
  parsePublishedFootballWeek,
  publishedFootballMatchup,
  publishedFootballMatchupsForEvent,
} from "./footballWeeklyPublication";

const paragraph = "This is a fully researched football preview covering the decisive tactical matchup.";
const sport = {
  week_of: "2026-10-13",
  release_at: "2026-10-13T05:00:00+00:00",
  spotlight: {
    name: "Featured Quarterback", team: "Notre Dame", position: "QB",
    stats: [
      { value: "303", label: "PASS YDS" },
      { value: "3", label: "PASS TD" },
      { value: "33", label: "RUSH YDS" },
      { value: "1", label: "RUSH TD" },
    ],
    result: "W 35–14", measurements: "6ft 2in",
    team_color: "#008435", highlight_url: "https://youtu.be/real",
    photo_source: "https://a.espncdn.com/photo.jpg", photo_kind: "portrait",
    photo_asset_path: "/assets/football/weekly/2026-10-13/cfb/spotlight.webp",
  },
  game: {
    home_team: "BYU", away_team: "Notre Dame", kickoff_at: "2026-10-17T21:00:00Z",
    header_asset_path: "/assets/football/weekly/2026-10-13/cfb/game-header.webp",
    header_photo_sources: ["https://seatgeekimages.com/matchup/v3_4901d84e/5585/5570/600x450.jpg"],
  },
  breakdown: {
    setup: [paragraph, paragraph],
    things: [1, 2, 3].map((i) => ({ title: "Battle " + i, body: paragraph, edge: "Notre Dame" })),
    paths_to_win: ["Notre Dame", "BYU"].map((team) => ({ team, body: paragraph })),
    players_to_watch: ["Notre Dame", "BYU"].map((team) => ({
      team, players: ["QB", "WR", "LB"].map((position) => ({ name: team + " " + position, position, body: paragraph })),
    })),
    unit_edges: [
      { title: "Notre Dame offense vs BYU defense", body: paragraph, edge: "Notre Dame" },
      { title: "BYU offense vs Notre Dame defense", body: paragraph, edge: "BYU" },
    ],
  },
};
const item = parsePublishedFootballWeek({ cfb: sport, nfl: null });

describe("public Football weekly release projection", () => {
  it("maps published data into established Home Spotlight without changing its layout", () => {
    const spotlight = footballPublishedSpotlight(item.cfb!);
    expect(spotlight.teamColor).toBe("#008435");
    expect(spotlight.highlightUrl).toContain("youtu.be");
    expect(spotlight.stats).toHaveLength(4);
  });

  it("restores verified AP rankings, records and season-correct team links on live Ole Miss–Texas", () => {
    const week = parsePublishedFootballWeek({ cfb: {
      ...sport, week_of: "2026-10-20",
      game: { ...sport.game, away_team: "Ole Miss", home_team: "Texas",
        kickoff_at: "2026-10-24T23:30:00Z",
        header_asset_path: "/assets/football/weekly/2026-10-20/cfb/game-header.webp" },
    }, nfl: null });
    const game = publishedFootballMatchup("cfb", week.cfb!);
    expect(game.compact?.leagueLabel).toBe("CFB");
    expect(game.compact?.rankingSource).toBe("AP");
    expect(game.teams[0]).toMatchObject({
      name: "Ole Miss", rank: 7, record: "5-1",
      sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/mississippi/2026.html",
    });
    expect(game.teams[1]).toMatchObject({
      name: "Texas", rank: 19, record: "4-2",
      sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/texas/2026.html",
    });
  });

  it("never carries current-week AP rankings into a future matchup, and consumes sourced future data", () => {
    const nextWeek = parsePublishedFootballWeek({ cfb: {
      ...sport, week_of: "2026-10-27",
      game: { ...sport.game, away_team: "Ole Miss", home_team: "Texas",
        kickoff_at: "2026-10-31T23:30:00Z",
        header_asset_path: "/assets/football/weekly/2026-10-27/cfb/game-header.webp" },
    }, nfl: null }).cfb!;
    const unknown = publishedFootballMatchup("cfb", nextWeek);
    expect(unknown.compact?.rankingSource).toBeUndefined();
    expect(unknown.teams.map((team) => team.rank)).toEqual([undefined, undefined]);
    expect(unknown.teams.map((team) => team.record)).toEqual([undefined, undefined]);
    const sourced = publishedFootballMatchup("cfb", {
      ...nextWeek, game: { ...nextWeek.game,
        away_rank: 4, home_rank: null, away_record: "6-1", home_record: "4-3",
        ranking_source: "AP",
      },
    });
    expect(sourced.compact?.rankingSource).toBe("AP");
    expect(sourced.teams[0]).toMatchObject({ rank: 4, record: "6-1" });
    expect(sourced.teams[1]).toMatchObject({ rank: null, record: "4-3" });
  });

  it("only attaches published GOTW breakdown when exact matchup and kickoff are on the Picks event", () => {
    const event = {
      sport: "football", startsAt: "2026-10-17T12:00:00Z",
      bouts: [{
        redFighterSlug: "byu", blueFighterSlug: "notre-dame",
        redFighterName: "BYU", blueFighterName: "Notre Dame",
        homeTeamSlug: "byu", awayTeamSlug: "notre-dame",
        locksAt: "2026-10-17T21:00:00Z",
      }],
    } as unknown as PickEvent;
    const match = publishedFootballMatchupsForEvent(event, item);
    expect(match).toHaveLength(1);
    expect(match[0]?.headerAssetPath).toContain("game-header.webp");
    expect(match[0]?.keyMatchups).toHaveLength(3);
    expect(match[0]?.unitEdges).toHaveLength(2);
    expect(match[0]?.compact?.leagueLabel).toBe("CFB");
    expect(match[0]?.compact?.things).toHaveLength(3);
    expect(match[0]?.compact?.bottomLine).toHaveLength(1);
    // Real Picks displays school + mascot (the owner selects the school name).
    const fullNames = {
      ...event, bouts: [{ ...event.bouts[0],
        redFighterSlug: "byu-cougars", redFighterName: "BYU Cougars",
        blueFighterSlug: "notre-dame-fighting-irish",
        blueFighterName: "Notre Dame Fighting Irish",
        homeTeamSlug: "byu-cougars", awayTeamSlug: "notre-dame-fighting-irish",
      }],
    };
    expect(publishedFootballMatchupsForEvent(fullNames, item)).toHaveLength(1);
    expect(publishedFootballMatchupsForEvent({
      ...event, bouts: [{ ...event.bouts[0], redFighterSlug: "texas",
        redFighterName: "Texas", homeTeamSlug: "texas" }],
    }, item)).toHaveLength(0);
    expect(publishedFootballMatchupsForEvent({
      ...event, bouts: [{ ...event.bouts[0], locksAt: "2026-10-24T21:00:00Z" }],
    }, item)).toHaveLength(0);
  });

  it("keeps an authored compact Patriots–Bears breakdown but preserves deployed SeatGeek art", () => {
    const nfl = {
      ...sport,
      week_of: "2026-10-20",
      spotlight: { ...sport.spotlight, name: "Caleb Williams", team: "Chicago Bears",
        photo_asset_path: "/assets/football/weekly/2026-10-20/nfl/spotlight.webp" },
      game: { ...sport.game, away_team: "New England Patriots", home_team: "Chicago Bears",
        kickoff_at: "2026-10-23T00:15:00Z",
        header_asset_path: "/assets/football/weekly/2026-10-20/nfl/game-header.webp" },
    };
    const projected = parsePublishedFootballWeek({ cfb: null, nfl });
    const event = {
      sport: "football", startsAt: "2026-10-23T00:15:00Z",
      bouts: [{ redFighterSlug: "chicago-bears", blueFighterSlug: "new-england-patriots",
        redFighterName: "Chicago Bears", blueFighterName: "New England Patriots",
        homeTeamSlug: "chicago-bears", awayTeamSlug: "new-england-patriots",
        locksAt: "2026-10-23T00:15:00Z" }],
    } as unknown as PickEvent;
    const weekly = publishedFootballMatchupsForEvent(event, projected);
    expect(weekly).toHaveLength(1);
    expect(weekly[0]?.compact?.leagueLabel).toBe("NFL");
    const compact: FootballMatchupBreakdown = {
      ...weekly[0]!,
      id: "2026-patriots-bears-week7",
      compact: { leagueLabel: "NFL" as const, things: [
        { title: "Ground game", body: [{ text: paragraph }] },
        { title: "Pressure", body: [{ text: paragraph }] },
        { title: "Play action", body: [{ text: paragraph }] },
      ], setup: [{ text: paragraph }], bottomLine: [{ text: paragraph }] },
      headerAssetPath: undefined,
    };
    const merged = mergeFootballWeeklyMatchupBreakdowns(weekly, [compact]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe("2026-patriots-bears-week7");
    expect(merged[0]?.compact?.leagueLabel).toBe("NFL");
    expect(merged[0]?.headerAssetPath).toBe(nfl.game.header_asset_path);
    expect(merged[0]?.playersToWatch).toHaveLength(2);

    // A similarly named but different week is never deduplicated.
    const nextWeek = { ...compact, kickoffAt: "2026-11-12T00:15:00Z" };
    const separate = mergeFootballWeeklyMatchupBreakdowns(weekly, [nextWeek]);
    expect(separate).toHaveLength(2);
    expect(separate[0]?.id).toBe(weekly[0]?.id);
  });

  it("rejects incomplete or unexpected live Spotlight and editorial contracts", () => {
    expect(() => parsePublishedFootballWeek({ cfb: {
      ...sport, spotlight: { ...sport.spotlight, stats: [] },
    }, nfl: null })).toThrow();
    expect(() => parsePublishedFootballWeek({ cfb: {
      ...sport, breakdown: { ...sport.breakdown, things: [] },
    }, nfl: null })).toThrow();
    expect(parsePublishedFootballWeek({ cfb: null, nfl: null }).cfb).toBeNull();
  });
});
