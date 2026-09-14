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
const releaseMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202612310125_stage21_draft_room_public_release.sql"),
  "utf8",
);

describe("Draft Room public release readiness", () => {
  it("removes the owner-only frontend gate and uses the canonical backend release switch", () => {
    expect(draftRoomSource).not.toContain("canControlPicks");
    expect(draftRoomSource).not.toContain("hasDraftRoomAdminAccess");
    expect(draftRoomSource).not.toContain("ADMIN PREVIEW");
    expect(releaseMigration).toContain("create or replace function private.draft_room_public_release_enabled()");
    expect(releaseMigration).toContain("select true;");
    expect(releaseMigration).toContain(
      "revoke all on function private.draft_room_public_release_enabled() from public, anon, authenticated;",
    );
  });

  it("keeps shared Auction layout ownership while scoping Football powder blue to Draft Room", () => {
    expect(footballCss).toContain("--draft-room-accent: var(--football-brand-blue, #8EBCE6);");
    expect(footballCss).toContain(".football-room-page.auction-page .auction-current__status");
    expect(footballCss).toContain(".football-room-page.auction-page .auction-bid fieldset button.is-selected");
    expect(footballCss).toContain(".football-room-page.auction-page .primary-action");
    expect(auctionCss).toContain("var(--ufc-red-strong)");
  });
});
