import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { auctionModeGroups, auctionModes } from "./auctionContract";
import { auctionModeArtwork } from "./auctionModeArtwork";
import { playGames } from "./playRegistry";

const page = readFileSync("src/features/play/AuctionPage.tsx", "utf8");
const styles = readFileSync("src/styles/auction.css", "utf8");
const whatsNewMigration = readFileSync(
  "supabase/migrations/202609030002_auction_ui_release_whats_new.sql",
  "utf8",
);

describe("Auction release polish", () => {
  it("features Auction first without a temporary new badge or asynchronous copy", () => {
    expect(playGames[0]).toMatchObject({
      id: "auction",
      icon: "$",
      description: "Choose a UFC auction, bid privately, and build the stronger collection.",
    });
    expect(playGames[0]?.description).not.toMatch(/asynchronous/i);
    expect(page).not.toMatch(/ASYNCHRONOUS SEALED BID/);
    expect(page).toContain("SEALED BID CHALLENGE");
  });

  it("keeps all sixteen formats under one grouped owner and separates opponent selection", () => {
    expect(auctionModes).toHaveLength(16);
    expect(auctionModeGroups.flatMap((group) => group.modeIds)).toHaveLength(16);
    expect(page).toContain('setupStep === "formats"');
    expect(page).toContain("auction-catalog__tabs");
    expect(page).toContain("CHOOSE OPPONENT →");
    expect(page).toContain("← CHANGE FORMAT");
    expect(styles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
  });

  it("reduces only the introductory hero while preserving the photo catalog cards", () => {
    expect(page).toContain("auction-hero surface-card");
    expect(page).toContain("auction-catalog__image");
    expect(styles).toMatch(/\.auction-hero\s*\{[\s\S]*?gap:\s*6px;[\s\S]*?padding:\s*16px 18px;/);
    expect(styles).toMatch(/\.auction-hero h1\s*\{[\s\S]*?clamp\(32px, 9vw, 46px\)/);
    expect(styles).toMatch(/\.auction-catalog li button\s*\{[\s\S]*?min-height:\s*112px/);
  });

  it("uses a compact text-only selected-format summary for opponent selection", () => {
    expect(page).toContain("auction-opponents__summary");
    expect(page).toContain("SELECTED AUCTION");
    expect(page).not.toContain("auction-opponents__image");
    expect(styles).toMatch(/\.auction-opponents__summary\s*\{[\s\S]*?padding:\s*12px 14px/);
    expect(styles).not.toContain(".auction-opponents__image");
  });

  it("uses canonical member profiles for result identity and readable collection rows", () => {
    expect(page).toContain("createMemberProfilesRepository");
    expect(page).toContain("auction-result__winner");
    expect(page).toContain("auction-final__winner");
    expect(page).toContain("auction-collections__rows");
    expect(styles).toContain("overflow-wrap: anywhere");
    expect(styles).not.toMatch(
      /\.auction-collections__rows strong\s*\{[^}]*white-space:\s*nowrap/,
    );
  });

  it("keeps the full selected format visible while giving live artwork enough room", () => {
    expect(page).toContain('<AuctionArtworkImage modeId={state.mode_id} className="auction-board__image" />');
    expect(page).toContain('<Link className="auction-board__back" to="/play">');
    expect(page).toContain('<p className="eyebrow">AUCTION</p>');
    expect(page).toContain("<h1>{mode.displayName}</h1>");
    expect(page).toContain(">REFRESH</button>");
    expect(page).not.toContain("SELECTED AUCTION · {mode.displayName}");
    expect(styles).toMatch(/\.auction-board__header\s*\{[\s\S]*?min-height:\s*clamp\(200px, 54vw, 220px\);[\s\S]*?gap:\s*10px;[\s\S]*?overflow:\s*hidden;/);
    expect(styles).toMatch(/\.auction-board__image\s*\{[\s\S]*?object-fit:\s*cover;/);
    expect(styles).not.toMatch(/\.auction-board__image\s*\{[\s\S]*?object-position:/);
    expect(auctionModeArtwork("conor-mcgregor-performances").objectPosition).toBe("50% 20%");
    expect(styles).toMatch(/\.auction-board__back strong\s*\{[\s\S]*?font-size:\s*12px;/);
    expect(styles).toMatch(/\.auction-board__title h1\s*\{[\s\S]*?white-space:\s*normal;/);
    expect(styles).toMatch(/\.auction-scoreboard\s*\{[\s\S]*?padding:\s*11px 12px/);
    expect(styles).toMatch(/\.auction-current__meta\s*\{[\s\S]*?padding:\s*7px 10px/);
    expect(styles).toMatch(/\.auction-current__item\s*\{[\s\S]*?min-height:\s*90px;[\s\S]*?padding:\s*12px/);
    expect(styles).toMatch(/\.auction-current__item small\s*\{[\s\S]*?font-size:\s*7px;[\s\S]*?opacity:\s*\.82;/);
    expect(styles).toMatch(/\.auction-current__status\s*\{[\s\S]*?padding:\s*8px 10px/);
    expect(styles).toMatch(/\.auction-collections__header\s*\{[\s\S]*?display:\s*none;/);
    expect(styles).toMatch(/\.auction-collections__rows article:first-child\s*\{[\s\S]*?border-top:\s*0;/);
  });

  it("publishes one idempotent Auction release through the canonical What's New owner", () => {
    expect(whatsNewMigration).toContain("select public.publish_whats_new_item(");
    expect(whatsNewMigration).toContain("'games:release:auction'");
    expect(whatsNewMigration).toContain("'Auction is now playable'");
    expect(whatsNewMigration).toContain("'/play/auction'");
    expect(whatsNewMigration).toContain("'PLAY AUCTION'");
    expect(whatsNewMigration).toContain("Expected exactly one canonical Auction release announcement");
  });
});
