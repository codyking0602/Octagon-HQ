import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const draftRoomSource = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballDraftRoomPage.tsx"),
  "utf8",
);
const footballCss = readFileSync(
  resolve(process.cwd(), "src/styles/football-foundation.css"),
  "utf8",
);
const auctionCss = readFileSync(
  resolve(process.cwd(), "src/styles/auction.css"),
  "utf8",
);
const accessMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202612310101_stage12_test_profile_admin_playtest.sql"),
  "utf8",
);

describe("Stage 12 admin playtest readiness", () => {
  it("grants TEST through the existing Picks-owner gate instead of adding a Draft Room bypass", () => {
    expect(draftRoomSource).toContain("return profile?.canControlPicks === true;");
    expect(accessMigration).toContain("insert into public.pick_control_owners (profile_id)");
    expect(accessMigration).toContain("c8b9d8a2-22a6-44cf-8a5f-3287d151f025");
    expect(accessMigration).toContain("profile.display_name = 'TEST'");
    expect(accessMigration).toContain("on conflict (profile_id) do nothing");
    expect(accessMigration).not.toMatch(/create\s+(table|function)/i);
  });

  it("keeps shared Auction layout ownership while scoping Football powder blue to Draft Room", () => {
    expect(footballCss).toContain("--draft-room-accent: var(--football-brand-blue, #8EBCE6);");
    expect(footballCss).toContain(".football-room-page.auction-page .auction-current__status");
    expect(footballCss).toContain(".football-room-page.auction-page .auction-bid fieldset button.is-selected");
    expect(footballCss).toContain(".football-room-page.auction-page .primary-action");
    expect(auctionCss).toContain("var(--ufc-red-strong)");
  });
});
