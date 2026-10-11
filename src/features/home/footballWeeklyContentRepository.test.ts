import { describe, expect, it } from "vitest";
import {
  footballEditorialTuesdaySchema,
  footballWeeklyContentPackageSchema,
  footballWeeklyDraftPatchSchema,
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
