import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const backRoomDir = "src/features/back-room";
const playerScroll = readFileSync(
  backRoomDir + "/AuctionTablePlayerScroll.tsx",
  "utf8",
);
const rosterRegion = readFileSync(
  backRoomDir + "/AuctionTableRosterScroll.tsx",
  "utf8",
);
const sharedStyles = readFileSync(
  "src/styles/weekly-auction-table-shared.css",
  "utf8",
);

function expandableAuctionTableDialogs() {
  return readdirSync(backRoomDir)
    .filter((name) => name.endsWith("TableDialog.tsx"))
    .map((name) => ({
      name,
      content: readFileSync(backRoomDir + "/" + name, "utf8"),
    }))
    .filter(({ content }) => (
      content.includes("AUCTION TABLE")
      && content.includes("aria-expanded")
    ));
}

describe("Weekly Auction Table expanded-player scroll contract", () => {
  it("makes the expanded player pill itself the mobile touch-scroll viewport", () => {
    expect(playerScroll).toContain('"weekly-auction-table__player-scroll"');
    expect(playerScroll).toContain('expanded ? "is-expanded" : ""');
    expect(sharedStyles).toContain(".weekly-auction-table__player-scroll.is-expanded");
    expect(sharedStyles).toContain("max-height: min(46dvh, 360px);");
    expect(sharedStyles).toContain("overflow-y: auto;");
    expect(sharedStyles).toContain("touch-action: pan-y;");
    expect(sharedStyles).toContain("-webkit-overflow-scrolling: touch;");
    expect(sharedStyles).toContain("max-height: min(36dvh, 290px);");
  });

  it("does not trap touch scrolling inside a non-overflowing child roster", () => {
    expect(rosterRegion).toContain('role="region"');
    expect(rosterRegion).toContain("tabIndex={0}");
    expect(sharedStyles).toContain(".weekly-auction-table__roster-scroll");
    expect(sharedStyles).not.toContain("overscroll-behavior-y: contain;");
  });

  it("requires every expandable Auction Table to use the shared player-pill scroller", () => {
    const dialogs = expandableAuctionTableDialogs();
    expect(dialogs.length).toBeGreaterThanOrEqual(3);

    for (const dialog of dialogs) {
      expect(
        dialog.content,
        dialog.name + " must make the expanded player pill the shared scroll viewport",
      ).toContain("AuctionTablePlayerScroll");
      expect(
        dialog.content,
        dialog.name + " must keep the roster content inside the shared semantic region",
      ).toContain("AuctionTableRosterScroll");
    }
  });
});
