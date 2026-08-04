import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { auctionModeGroups, auctionModes } from "./auctionContract";
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

  it("uses canonical member profiles for winner photos and readable collection rows", () => {
    expect(page).toContain("createMemberProfilesRepository");
    expect(page).toContain("auction-result__winner");
    expect(page).toContain("auction-final__winner");
    expect(page).toContain("auction-collections__rows");
    expect(styles).toContain("overflow-wrap: anywhere");
    expect(styles).not.toMatch(/auction-collections[\s\S]*?white-space:\s*nowrap/);
  });

  it("keeps manual refresh while shrinking the current-item presentation", () => {
    expect(page).toContain(">REFRESH</button>");
    expect(styles).toMatch(/\.auction-current__item\s*\{[\s\S]*?min-height:\s*150px/);
    expect(styles).toMatch(/\.auction-current__item h2\s*\{[\s\S]*?clamp\(24px, 7vw, 40px\)/);
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
