import { describe, expect, it } from "vitest";
import {
  footballEditorialTuesdaySchema,
  footballWeeklyContentPackageSchema,
  footballWeeklyDraftPatchSchema,
  footballWeeklyCandidateSetSchema,
  nextFootballEditorialTuesday,
  footballWeeklyPreparedSpotlightSchema,
  footballWeeklyPreparedGameSchema,
  footballWeeklyEditorialProofSchema,
} from "./footballWeeklyContentRepository";
import migration from "../../../supabase/migrations/202612310297_football_weekly_content_packages.sql?raw";

const player = {
  name: "Test Player", team: "Test Team", position: "QB",
  stats: [
    { value: "300", label: "PYDS" },
    { value: "3", label: "PASS TD" },
    { value: "40", label: "RYDS" },
    { value: "1", label: "RUSH TD" },
  ],
  result: "W 31–24", measurements: "6 ft 2 in",
  team_color: "#112233", highlight_url: "https://youtu.be/test",
};

describe("Football weekly editorial package Phase 1", () => {
  it("accepts Tuesday week keys, not Monday, Sunday or invalid dates", () => {
    expect(footballEditorialTuesdaySchema.parse("2026-10-13")).toBe("2026-10-13");
    expect(() => footballEditorialTuesdaySchema.parse("2026-10-12")).toThrow();
    expect(() => footballEditorialTuesdaySchema.parse("2026-10-11")).toThrow();
    expect(() => footballEditorialTuesdaySchema.parse("2026-02-30")).toThrow();
  });

  it("requires four real spotlight stats, and explicitly supports approved photo fallbacks", () => {
    expect(footballWeeklyDraftPatchSchema.parse({ cfb_spotlight: {
      ...player, photo_kind: "portrait", photo_source: "https://example.com/photo.webp",
    } }).cfb_spotlight?.stats).toHaveLength(4);
    expect(() => footballWeeklyDraftPatchSchema.parse({ nfl_spotlight: {
      ...player, stats: player.stats.slice(1),
    } })).toThrow();
    expect(() => footballWeeklyDraftPatchSchema.parse({ cfb_spotlight: {
      ...player, photo_kind: "made-up-player",
    } })).toThrow();
  });

  it("permits independent CFB/NFL editing but not unexpected publication fields", () => {
    const patch = footballWeeklyDraftPatchSchema.parse({ cfb_game_of_week: {
      home_team: "Notre Dame", away_team: "BYU", kickoff_at: "2026-10-17T19:30:00Z",
    } });
    expect(patch.nfl_game_of_week).toBeUndefined();
    expect(() => footballWeeklyDraftPatchSchema.parse({})).toThrow();
    expect(() => footballWeeklyDraftPatchSchema.parse({ status: "published" })).toThrow();
  });

  it("stores nullable pending slots without publishing them", () => {
    const data = footballWeeklyContentPackageSchema.parse({
      week_of: "2026-10-13", release_at: "2026-10-13T05:00:00+00:00",
      status: "draft", cfb_spotlight: player, nfl_spotlight: null,
      cfb_game_of_week: null, nfl_game_of_week: null,
      approved_at: null, ready_at: null, published_at: null,
      created_at: "2026-10-11T00:00:00Z", updated_at: "2026-10-11T00:00:00Z",
    });
    expect(data.status).toBe("draft");
    expect(data.nfl_spotlight).toBeNull();
  });

  it("retains owner-only storage, exact midnight Central, and no background publisher", () => {
    expect(migration).toContain("p.week_of::timestamp at time zone 'America/Chicago'");
    expect(migration).toContain("public.is_pick_control_owner(auth.uid())");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table public.football_weekly_content_packages from public, anon, authenticated");
    expect(migration).not.toContain("cron.schedule");
  });
});


describe("Phase 2 editorial approvals", () => {
  const players = Array.from({ length: 5 }, (_, index) => ({
    id: "player-" + (index + 1), name: "Test Player " + (index + 1),
    team: "Test Team", position: "QB", summary: "Week's verified standout",
  }));
  const games = Array.from({ length: 5 }, (_, index) => ({
    id: "game-" + (index + 1), home_team: "Home " + index,
    away_team: "Away " + index, kickoff_at: "2026-10-17T19:30:00Z",
    summary: "Featured matchup",
  }));

  it("uses the next Tuesday in Chicago, including Monday just before midnight and DST", () => {
    expect(nextFootballEditorialTuesday(new Date("2026-10-11T14:00:00Z"))).toBe("2026-10-13");
    expect(nextFootballEditorialTuesday(new Date("2026-10-13T04:59:00Z"))).toBe("2026-10-13");
    expect(nextFootballEditorialTuesday(new Date("2026-10-13T05:01:00Z"))).toBe("2026-10-20");
    expect(nextFootballEditorialTuesday(new Date("2026-11-02T23:00:00Z"))).toBe("2026-11-03");
    expect(nextFootballEditorialTuesday(new Date("2026-11-03T06:01:00Z"))).toBe("2026-11-10");
  });

  it("requires exactly five unique player and game proposals", () => {
    expect(footballWeeklyCandidateSetSchema.parse({ players, games }).players).toHaveLength(5);
    expect(() => footballWeeklyCandidateSetSchema.parse({ players: players.slice(1), games })).toThrow();
    expect(() => footballWeeklyCandidateSetSchema.parse({
      players: [...players.slice(1), players[1]], games,
    })).toThrow();
    expect(() => footballWeeklyCandidateSetSchema.parse({
      players, games: [...games.slice(0, 4), games[0]],
    })).toThrow();
  });

  it("preserves both independent proposal sets and audited selections on read", () => {
    const cfb = { player: players[0], game: games[1], selected_at: "2026-10-11T17:00:00Z",
      selected_by: "00000000-0000-4000-8000-000000000001" };
    const parsed = footballWeeklyContentPackageSchema.parse({
      week_of: "2026-10-13", release_at: "2026-10-13T05:00:00Z",
      status: "draft", cfb_spotlight: null, nfl_spotlight: null,
      cfb_game_of_week: null, nfl_game_of_week: null,
      proposals: { cfb: { players, games }, nfl: { players, games } },
      choices: { cfb },
      approved_at: null, ready_at: null, published_at: null,
      created_at: "2026-10-11T17:00:00Z", updated_at: "2026-10-11T17:00:00Z",
    });
    expect(parsed.choices.cfb?.player.id).toBe("player-1");
    expect(parsed.proposals.nfl?.games).toHaveLength(5);
    expect(parsed.choices.nfl).toBeUndefined();
    expect(parsed.status).toBe("draft");
  });
});


describe("Phase 3 verified media and Football editorial", () => {
  const spotlight = {
    name: "Approved Player", team: "Approved School", position: "QB",
    result: "W 38–21", measurements: "6ft 2in", team_color: "#123456",
    highlight_url: "https://youtu.be/real-example",
    photo_source: "https://a.espncdn.com/photo/2026/real.jpg",
    photo_asset_path: "/assets/football/weekly/2026-10-13/cfb/spotlight.webp",
    photo_kind: "action" as const,
    stats: [
      { value: "325", label: "PASS YDS" }, { value: "3", label: "PASS TD" },
      { value: "85", label: "RUSH YDS" }, { value: "1", label: "RUSH TD" },
    ],
  };
  const game = {
    home_team: "Home", away_team: "Away", kickoff_at: "2026-10-17T19:30:00Z",
    header_asset_path: "/assets/football/weekly/2026-10-13/cfb/game-header.webp",
    header_photo_sources: ["https://seatgeekimages.com/matchup/verified/600x450.jpg"],
  };
  const paragraph = "A real team-specific matchup can turn on protection, pressure, and who wins the early downs.";
  const editorial = {
    source_urls: ["https://www.espn.com/example", "https://www.sports-reference.com/example"],
    breakdown: {
      setup: [paragraph, paragraph],
      things: [
        { title: "Protection", body: paragraph, edge: "Away" },
        { title: "Explosives", body: paragraph, edge: "Home" },
        { title: "Run fits", body: paragraph, edge: "Even" },
      ],
      paths_to_win: [{ team: "Away", body: paragraph }, { team: "Home", body: paragraph }],
      players_to_watch: ["Away", "Home"].map((team) => ({
        team, players: ["QB", "WR", "DB"].map((position) => ({ name: team + " Star", position, body: paragraph })),
      })),
      unit_edges: [
        { title: "Away offense vs Home defense", body: paragraph, edge: "Away" },
        { title: "Home offense vs Away defense", body: paragraph, edge: "Home" },
      ],
    },
  };

  it("accepts a complete four-stat real-photo Spotlight with the canonical 720x900 asset binding", () => {
    expect(footballWeeklyPreparedSpotlightSchema.parse(spotlight).photo_kind).toBe("action");
    expect(() => footballWeeklyPreparedSpotlightSchema.parse({
      ...spotlight, photo_asset_path: "/assets/fighters/placeholder.webp",
    })).toThrow();
    expect(() => footballWeeklyPreparedSpotlightSchema.parse({
      ...spotlight, stats: spotlight.stats.map((s) => ({ ...s, label: "PASS YDS" })),
    })).toThrow();
    expect(() => footballWeeklyPreparedSpotlightSchema.parse({
      ...spotlight, highlight_url: "https://example.com/pretend-video",
    })).toThrow();
  });

  it("requires the real matchup header references and established complete editorial form", () => {
    expect(footballWeeklyPreparedGameSchema.parse(game).header_photo_sources).toHaveLength(1);
    expect(() => footballWeeklyPreparedGameSchema.parse({
      ...game, header_photo_sources: ["https://unknown.example/matchup/header.jpg"],
    })).toThrow();
    expect(footballWeeklyEditorialProofSchema.parse(editorial).breakdown.things).toHaveLength(3);
    expect(() => footballWeeklyEditorialProofSchema.parse({
      ...editorial, breakdown: { ...editorial.breakdown, things: editorial.breakdown.things.slice(1) },
    })).toThrow();
  });

  it("allows unprepared packages to remain readable without inventing completed production", () => {
    const parsed = footballWeeklyContentPackageSchema.parse({
      week_of: "2026-10-13", release_at: "2026-10-13T05:00:00Z",
      status: "draft", cfb_spotlight: null, nfl_spotlight: null,
      cfb_game_of_week: null, nfl_game_of_week: null,
      proposals: {}, choices: {},
      approved_at: null, ready_at: null, published_at: null,
      created_at: "2026-10-11T00:00:00Z", updated_at: "2026-10-11T00:00:00Z",
    });
    expect(parsed.production).toEqual({});
    expect(parsed.status).toBe("draft");
  });
});
