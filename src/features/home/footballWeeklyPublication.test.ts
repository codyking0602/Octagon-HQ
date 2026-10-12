import { describe, expect, it } from "vitest";
import type { PickEvent } from "../picks/picksModel";
import {
  footballPublishedSpotlight,
  parsePublishedFootballWeek,
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
    header_photo_sources: ["https://a.espncdn.com/away.webp", "https://a.espncdn.com/home.webp"],
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
    expect(publishedFootballMatchupsForEvent({
      ...event, bouts: [{ ...event.bouts[0], redFighterSlug: "texas",
        redFighterName: "Texas", homeTeamSlug: "texas" }],
    }, item)).toHaveLength(0);
    expect(publishedFootballMatchupsForEvent({
      ...event, bouts: [{ ...event.bouts[0], locksAt: "2026-10-24T21:00:00Z" }],
    }, item)).toHaveLength(0);
  });

  it("rejects incomplete or unexpected live Spotlight and editorial contracts", () => {
    expect(() => parsePublishedFootballWeek({ cfb: {
      ...sport, spotlight: { ...sport.spotlight, stats: [] },
    }, nfl: null })).toThrow();
    expect(() => parsePublishedFootballWeek({ cfb: {
      ...sport, breakdown: { ...sport.breakdown, things: [] },
    }, nfl: null })).toThrow();
    expect(() => parsePublishedFootballWeek({ cfb: null, nfl: null }).cfb).toBeNull();
  });
});
