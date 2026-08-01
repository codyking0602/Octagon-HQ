import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202608220001_auction_playable_server_engine.sql", "utf8");

describe("Auction playable server migration", () => {
  it("exposes only authenticated commands and keeps private owners private", () => {
    expect(sql).toContain("public.prepare_auction");
    expect(sql).toContain("public.send_auction_first_bid");
    expect(sql).toContain("public.submit_auction_bid");
    expect(sql).toContain("for update");
    expect(sql).toContain("private.publish_notification_to_profile");
    expect(sql).toContain("revoke all on function private.resolve_auction_round");
    expect(sql).not.toMatch(/grant execute on function private\.[^\n]+authenticated/);
  });

  it("does not project pending intent, future entries, rarity, or grading internals", () => {
    const projection = sql.slice(sql.indexOf("create function public.get_auction_participant_state"));
    expect(projection).not.toContain("ultimate_fighter_category");
    expect(projection).not.toContain("rarity_band");
    expect(projection).not.toContain("grading_version");
    const returnShape = projection.slice(0, projection.indexOf("language sql"));
    expect(returnShape).not.toContain("content_version");
  });
});
