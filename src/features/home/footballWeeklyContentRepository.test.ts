import { describe, expect, it } from "vitest";
import {
  footballEditorialTuesdaySchema,
  footballWeeklyContentPackageSchema,
  footballWeeklyDraftPatchSchema,
  footballWeeklyCandidateSetSchema,
  nextFootballEditorialTuesday,
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
